// Adds a "Related" button to every post that has a video, and opens the feed when it's clicked.
(() => {
  'use strict';

  const player = () => globalThis.XRF_PLAYER;
  const VIDEO_SEL = '[data-testid="videoPlayer"], [data-testid="videoComponent"], video';
  const STATUS_RE = /^\/([A-Za-z0-9_]{1,30})\/status\/(\d+)/;

  // Works out which post an <article> is, reading it fresh each time because x.com recycles DOM.
  function postInfo(article) {
    for (const a of article.querySelectorAll('a[href*="/status/"]')) {
      if (!a.querySelector('time')) continue;
      const m = (a.getAttribute('href') || '').match(STATUS_RE);
      if (m) return { handle: m[1], id: m[2] };
    }
    // The main post on a /status/ page (x.com marks it with tabindex="-1").
    const m = location.pathname.match(STATUS_RE);
    if (m && article.getAttribute('tabindex') === '-1') return { handle: m[1], id: m[2] };
    return null;
  }

  function makeButton(article, overlay) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = overlay ? 'xrf-btn xrf-btn-overlay' : 'xrf-btn';
    btn.title = 'Watch related videos (like swiping up in the X app)';
    btn.innerHTML = player().icon('feed'); // constant icon markup
    btn.append(document.createTextNode('Related'));
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const info = postInfo(article);
      if (info) player().open(info);
      else player().toast('Couldn’t tell which post this is. Open the post and try again.', true);
    });
    return btn;
  }

  function inject(article) {
    if (article.querySelector('.xrf-btn')) return;
    if (!article.querySelector(VIDEO_SEL)) return;
    if (!postInfo(article)) return;
    const bars = article.querySelectorAll('[role="group"]');
    const bar = bars[bars.length - 1];
    if (bar) {
      const wrap = document.createElement('div');
      wrap.className = 'xrf-btn-wrap';
      wrap.append(makeButton(article, false));
      bar.append(wrap);
      return;
    }
    const video = article.querySelector(VIDEO_SEL);
    const host = video.closest('[data-testid="videoComponent"]') || video.parentElement;
    if (host) {
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.append(makeButton(article, true));
    }
  }

  function scan() {
    for (const article of document.querySelectorAll('article[data-testid="tweet"]')) inject(article);
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      scan();
    }, 250);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  scan();

  // Toolbar icon / Alt+Shift+V: open the feed from the post in the address bar,
  // or from the video post closest to the middle of the screen.
  function openFromPage() {
    if (player().isOpen()) return;
    const m = location.pathname.match(STATUS_RE);
    if (m) {
      player().open({ handle: m[1], id: m[2] });
      return;
    }
    const mid = window.innerHeight / 2;
    let best = null;
    let bestDist = Infinity;
    for (const article of document.querySelectorAll('article[data-testid="tweet"]')) {
      const video = article.querySelector(VIDEO_SEL);
      if (!video) continue;
      const r = video.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      const dist = Math.abs((r.top + r.bottom) / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = article;
      }
    }
    const info = best && postInfo(best);
    if (info) player().open(info);
    else player().toast('Scroll to a video post first (or open one), then try again.');
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'xrf-open-from-page') openFromPage();
  });
})();
