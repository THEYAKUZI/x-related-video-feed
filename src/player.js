// Full-screen vertical video feed shown on top of x.com.
(() => {
  'use strict';

  const API = () => globalThis.XRF_API;
  const SUPPORT_URL = 'https://github.com/sponsors/THEYAKUZI';

  const PATHS = {
    close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    heart: 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z',
    heartOn: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    bookmark: 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18L7 18V5h10v13z',
    bookmarkOn: 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z',
    similar: 'M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z',
    open: 'M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
    sound: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
    muted: 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z',
    play: 'M8 5v14l11-7z',
    up: 'M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z',
    down: 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
    fullscreen: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
    help: 'M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z',
    feed: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${PATHS[name]}"/></svg>`;

  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null) continue;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v; // only ever used with the constant icons above
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    for (const c of [].concat(children)) if (c) node.append(c);
    return node;
  }

  const compact = (n) => {
    try { return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n); } catch { return String(n); }
  };

  // ---- settings (remembered between sessions) ----
  const settings = { muted: false, autoNext: false };
  try {
    chrome.storage.local.get('xrfSettings').then((r) => Object.assign(settings, r?.xrfSettings || {})).catch(() => {});
  } catch { /* storage unavailable: use defaults */ }
  function saveSettings() {
    try { chrome.storage.local.set({ xrfSettings: { ...settings } }).catch(() => {}); } catch { /* ignore */ }
  }

  // ---- toast (also usable when the player is closed) ----
  let toastEl = null;
  let toastTimer = 0;
  function toast(message, isError = false) {
    if (!toastEl) toastEl = el('div', { class: 'xrf-toast', role: 'status' });
    // Inside the player when it's open, so it stays visible in fullscreen.
    const host = current?.root || document.body;
    if (toastEl.parentNode !== host) host.append(toastEl);
    toastEl.textContent = message;
    toastEl.classList.toggle('xrf-error', isError);
    requestAnimationFrame(() => toastEl.classList.add('xrf-show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('xrf-show'), isError ? 4500 : 2200);
  }

  let current = null;

  class Player {
    constructor(seed) {
      this.seed = seed; // { id, handle }
      this.items = [];
      this.slides = [];
      this.seen = new Set();
      this.active = -1;
      this.gen = 0;
      this.loading = false;
      this.feedSeed = seed;
      this.feedStarted = false;
      this.cursor = null;
      this.usedSeeds = new Set([seed.id]);
      this.endCard = null;
      this.lastWheel = 0;
      this.lastNav = 0;
      this.build();
      this.start();
    }

    // ---------- DOM ----------
    build() {
      this.scroller = el('div', { class: 'xrf-scroller' });
      this.counter = el('span', { class: 'xrf-counter', text: '' });
      this.autoBtn = el('button', { class: 'xrf-pill', title: 'Go to the next video when one ends (A)', onclick: () => this.toggleAutoNext() });
      this.helpBox = el('div', { class: 'xrf-help' }, [
        el('h3', { text: 'Keyboard shortcuts' }),
        el('dl', {}, [
          ['↓ / J / scroll', 'Next video'], ['↑ / K', 'Previous video'], ['Space', 'Pause / play'],
          ['← / →', 'Back / forward 5s'], ['M', 'Mute'], ['L', 'Like'], ['B', 'Bookmark'],
          ['S', 'More like this video'], ['O', 'Open post'], ['A', 'Auto-next on/off'], ['F', 'Fullscreen'], ['Esc', 'Close'],
        ].flatMap(([k, d]) => [el('dt', {}, k.split(' / ').flatMap((x, i) => [i ? ' ' : null, el('kbd', { text: x })])), el('dd', { text: d })])),
        el('a', {
          class: 'xrf-support', href: SUPPORT_URL, target: '_blank', rel: 'noopener',
          text: '♥ Enjoying it? Support the project',
        }),
      ]);
      this.upBtn = el('button', { class: 'xrf-iconbtn', title: 'Previous (↑)', html: icon('up'), onclick: () => this.go(this.active - 1) });
      this.downBtn = el('button', { class: 'xrf-iconbtn', title: 'Next (↓)', html: icon('down'), onclick: () => this.go(this.active + 1) });

      this.root = el('div', { class: 'xrf-root', role: 'dialog', 'aria-label': 'Related videos' }, [
        this.scroller,
        el('div', { class: 'xrf-top' }, [
          el('button', { class: 'xrf-iconbtn', title: 'Close (Esc)', html: icon('close'), onclick: () => this.close() }),
          this.counter,
          el('div', { class: 'xrf-spacer' }),
          this.autoBtn,
          el('button', { class: 'xrf-iconbtn', title: 'Fullscreen (F)', html: icon('fullscreen'), onclick: () => this.toggleFullscreen() }),
          el('button', { class: 'xrf-iconbtn', title: 'Keyboard shortcuts (?)', html: icon('help'), onclick: () => this.toggleHelp() }),
        ]),
        this.helpBox,
        el('div', { class: 'xrf-nav' }, [this.upBtn, this.downBtn]),
        el('div', { class: 'xrf-loading-more' }, [el('div', { class: 'xrf-spinner' }), 'Loading more…']),
      ]);

      this.observer = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || e.intersectionRatio < 0.6) continue;
          if (e.target.classList.contains('xrf-card')) {
            // Scrolled onto the loading/end card: pause the video above it.
            const v = this.slides[this.active]?._xrf.video;
            if (v && !v.paused) { v.pause(); this.autoPaused = true; }
            continue;
          }
          const i = Number(e.target.dataset.index);
          if (Number.isNaN(i)) continue;
          if (i !== this.active) this.setActive(i);
          else if (this.autoPaused) this.play(this.slides[i]._xrf.video);
          this.autoPaused = false;
        }
      }, { root: this.scroller, threshold: [0.6] });

      this.onKey = this.onKey.bind(this);
      this.blockKey = (e) => { if (!e.ctrlKey && !e.metaKey && !e.altKey) e.stopImmediatePropagation(); };
      window.addEventListener('keydown', this.onKey, true);
      window.addEventListener('keyup', this.blockKey, true);
      window.addEventListener('keypress', this.blockKey, true);
      this.scroller.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

      this.prevOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.append(this.root);
      this.renderTop();
      this.showCard('loading');
    }

    makeSlide(item, index) {
      const video = el('video', { class: 'xrf-video', playsinline: '', preload: 'none', poster: item.video.poster || null });
      const fill = el('div', { class: 'xrf-progress-fill' });
      const progress = el('div', { class: 'xrf-progress', title: 'Seek' }, [el('div', { class: 'xrf-progress-track' }, fill)]);
      const text = el('p', { class: 'xrf-text', text: item.text, title: 'Click to expand' });
      text.addEventListener('click', () => text.classList.toggle('xrf-expanded'));

      const act = (name, title, iconName, onclick) => {
        const b = el('button', { class: 'xrf-act', 'data-act': name, title, onclick }, [
          el('span', { class: 'xrf-act-icon', html: icon(iconName) }),
          el('span', { class: 'xrf-act-label' }),
        ]);
        return b;
      };
      const likeBtn = act('like', 'Like (L)', 'heart', () => this.toggleLike(index));
      const bookmarkBtn = act('bookmark', 'Bookmark (B)', 'bookmark', () => this.toggleBookmark(index));
      const similarBtn = act('similar', 'Show more videos like this one (S)', 'similar', () => this.reseed(index));
      const openBtn = act('open', 'Open the post in a new tab (O)', 'open', () => this.openPost(index));
      const muteBtn = act('mute', 'Mute (M)', 'sound', () => this.toggleMute());
      similarBtn.lastChild.textContent = 'Similar';
      openBtn.lastChild.textContent = 'Open';

      const stage = el('div', { class: 'xrf-stage' }, [
        video,
        el('div', { class: 'xrf-tap', onclick: () => this.togglePlay(), ondblclick: () => this.toggleFullscreen() }, [
          el('div', { class: 'xrf-paused-icon', html: icon('play') }),
        ]),
        item.video.isGif ? el('div', { class: 'xrf-badge', text: 'GIF' }) : null,
        el('div', { class: 'xrf-unavailable', text: 'This video couldn’t be played.' }),
        el('div', { class: 'xrf-info' }, [
          el('a', { class: 'xrf-user', href: `/${item.screenName}`, target: '_blank', rel: 'noopener' }, [
            el('img', { class: 'xrf-avatar', src: item.avatar || null, alt: '', loading: 'lazy' }),
            el('span', { class: 'xrf-name', text: item.name }),
            el('span', { class: 'xrf-handle', text: `@${item.screenName}` }),
          ]),
          text,
        ]),
        progress,
      ]);
      const ar = item.video.aspect && item.video.aspect[0] && item.video.aspect[1] ? item.video.aspect[0] / item.video.aspect[1] : 9 / 16;
      stage.style.setProperty('--ar', String(ar));

      const slide = el('section', { class: 'xrf-slide', 'data-index': String(index) }, [
        stage,
        el('div', { class: 'xrf-rail' }, [likeBtn, bookmarkBtn, similarBtn, openBtn, muteBtn]),
      ]);

      progress.addEventListener('click', (e) => {
        const r = progress.getBoundingClientRect();
        if (video.duration) video.currentTime = ((e.clientX - r.left) / r.width) * video.duration;
      });
      video.addEventListener('timeupdate', () => {
        if (video.duration) fill.style.width = `${(video.currentTime / video.duration) * 100}%`;
      });
      video.addEventListener('play', () => slide.classList.remove('xrf-paused'));
      video.addEventListener('pause', () => slide.classList.add('xrf-paused'));
      video.addEventListener('ended', () => {
        if (settings.autoNext && index === this.active) this.go(index + 1);
      });
      video.addEventListener('error', () => this.onVideoError(index));

      slide._xrf = { video, likeBtn, bookmarkBtn, muteBtn, variant: 0 };
      this.renderActions(slide, item);
      return slide;
    }

    renderActions(slide, item) {
      const { likeBtn, bookmarkBtn, muteBtn } = slide._xrf;
      likeBtn.classList.toggle('xrf-on', item.favorited);
      likeBtn.firstChild.innerHTML = icon(item.favorited ? 'heartOn' : 'heart');
      likeBtn.lastChild.textContent = item.likes ? compact(item.likes) : 'Like';
      bookmarkBtn.classList.toggle('xrf-on', item.bookmarked);
      bookmarkBtn.firstChild.innerHTML = icon(item.bookmarked ? 'bookmarkOn' : 'bookmark');
      bookmarkBtn.lastChild.textContent = item.bookmarked ? 'Saved' : 'Save';
      muteBtn.firstChild.innerHTML = icon(settings.muted ? 'muted' : 'sound');
      muteBtn.lastChild.textContent = settings.muted ? 'Muted' : 'Sound';
    }

    renderTop() {
      const total = this.items.length;
      this.counter.textContent = total ? `${this.active + 1} / ${total}${this.endCard?.dataset.kind === 'end' ? '' : '+'}` : '';
      this.autoBtn.textContent = settings.autoNext ? 'Auto-next: on' : 'Auto-next: off';
      this.autoBtn.classList.toggle('xrf-on', settings.autoNext);
      this.upBtn.disabled = this.active <= 0;
      this.downBtn.disabled = this.active >= total - 1 && !this.loading;
    }

    showCard(kind, error) {
      if (this.endCard) {
        this.observer.unobserve(this.endCard);
        this.endCard.remove();
      }
      this.endCard = null;
      if (!kind) return;
      let card;
      if (kind === 'loading') {
        card = el('div', { class: 'xrf-card' }, [el('div', { class: 'xrf-spinner' }), el('p', { text: 'Finding related videos…' })]);
      } else if (kind === 'end') {
        card = el('div', { class: 'xrf-card' }, [
          el('h2', { text: 'That’s all for now' }),
          el('p', { text: 'X didn’t return any more related videos. Try “Similar” on a video you liked to branch off in a new direction.' }),
          el('button', { class: 'xrf-pill', text: 'Try again', onclick: () => { this.showCard(null); this.usedSeeds.clear(); this.fill(); } }),
        ]);
      } else {
        card = el('div', { class: 'xrf-card' }, [
          el('h2', { text: 'Couldn’t load related videos' }),
          el('p', { text: error?.message || String(error) }),
          el('button', { class: 'xrf-pill', text: 'Retry', onclick: () => { this.showCard(null); this.fill(); } }),
        ]);
      }
      card.dataset.kind = kind;
      this.endCard = card;
      this.scroller.append(card);
      this.observer.observe(card);
      this.renderTop();
    }

    // ---------- data ----------
    async start() {
      const gen = this.gen;
      let seedItem = null;
      try {
        seedItem = await API().tweet(this.seed.id);
      } catch (e) {
        if (!this.seed.handle) { this.showCard('error', e); return; }
      }
      if (this.closed || gen !== this.gen) return;
      if (seedItem) {
        if (!this.seed.handle) this.seed.handle = seedItem.screenName;
        this.feedSeed = { id: this.seed.id, handle: this.seed.handle || seedItem.screenName };
        this.usedSeeds.add(seedItem.id);
        this.add([seedItem]);
      }
      await this.fill();
      if (!this.items.length && !this.closed && this.endCard?.dataset.kind !== 'error') {
        this.showCard('error', new Error('No playable videos found for this post.'));
      }
    }

    add(items) {
      let added = 0;
      for (const item of items || []) {
        if (!item || this.seen.has(item.id)) continue;
        this.seen.add(item.id);
        const index = this.items.length;
        this.items.push(item);
        const slide = this.makeSlide(item, index);
        this.slides.push(slide);
        if (this.endCard) this.scroller.insertBefore(slide, this.endCard);
        else this.scroller.append(slide);
        this.observer.observe(slide);
        added++;
      }
      if (added && this.active < 0) {
        this.scroller.scrollTop = 0;
        this.setActive(0);
      }
      this.renderTop();
      return added;
    }

    nextSeed() {
      // Branch off from what's being watched now, falling back to earlier videos.
      for (let i = Math.min(this.active, this.items.length - 1); i >= 0; i--) {
        const it = this.items[i];
        if (!this.usedSeeds.has(it.id)) return { id: it.id, handle: it.screenName };
      }
      for (let i = this.items.length - 1; i > this.active; i--) {
        const it = this.items[i];
        if (!this.usedSeeds.has(it.id)) return { id: it.id, handle: it.screenName };
      }
      return null;
    }

    async fill() {
      if (this.loading || this.closed || this.endCard?.dataset.kind === 'end' || this.endCard?.dataset.kind === 'error') return;
      const gen = this.gen;
      this.loading = true;
      this.root.classList.toggle('xrf-is-loading', this.items.length > 0);
      if (!this.items.length) this.showCard('loading');
      try {
        let added = 0;
        for (let tries = 0; !added && tries < 4; tries++) {
          let seed = this.feedSeed;
          const cursor = this.feedStarted ? this.cursor : null;
          if (this.feedStarted && !cursor) {
            seed = this.nextSeed();
            if (!seed) break;
            this.usedSeeds.add(seed.id);
          }
          const res = await API().relatedVideos(seed.id, seed.handle, cursor);
          if (gen !== this.gen || this.closed) return;
          this.feedSeed = seed;
          this.feedStarted = true;
          this.cursor = res.cursor && res.cursor !== cursor ? res.cursor : null;
          added = this.add(res.items);
        }
        if (gen !== this.gen || this.closed) return;
        if (this.endCard?.dataset.kind === 'loading') this.showCard(null);
        if (!added) this.showCard('end');
      } catch (e) {
        if (gen !== this.gen || this.closed) return;
        if (this.items.length) toast(e.message || String(e), true);
        this.showCard('error', e);
      } finally {
        if (gen === this.gen) {
          this.loading = false;
          this.root.classList.remove('xrf-is-loading');
          this.renderTop();
        }
      }
    }

    reseed(index = this.active) {
      const item = this.items[index];
      if (!item) return;
      this.gen++;
      this.loading = false;
      this.root.classList.remove('xrf-is-loading');
      for (const s of this.slides.splice(index + 1)) {
        this.unloadVideo(s._xrf.video);
        this.observer.unobserve(s);
        s.remove();
      }
      this.items.splice(index + 1);
      this.showCard(null);
      this.feedSeed = { id: item.id, handle: item.screenName };
      this.feedStarted = false;
      this.cursor = null;
      this.usedSeeds.add(item.id);
      if (index !== this.active) this.go(index);
      toast('Finding more videos like this one…');
      const gen = this.gen;
      this.fill().then(() => {
        if (this.closed || gen !== this.gen) return;
        if (this.items.length > index + 1) toast('Scroll down for similar videos');
        else if (this.endCard?.dataset.kind === 'end') toast('X didn’t find more videos like this one.');
      });
    }

    // ---------- playback ----------
    setActive(i) {
      if (i === this.active || !this.slides[i]) return;
      this.active = i;
      this.slides.forEach((s, j) => {
        const v = s._xrf.video;
        s.classList.toggle('xrf-active', j === i);
        if (Math.abs(j - i) <= 1) {
          if (!v.getAttribute('src')) {
            v.preload = j === i || j === i + 1 ? 'auto' : 'metadata';
            v.src = this.items[j].video.urls[s._xrf.variant] || this.items[j].video.url;
          }
        } else if (v.getAttribute('src')) {
          this.unloadVideo(v);
        }
        if (j !== i && !v.paused) v.pause();
      });
      const s = this.slides[i];
      const v = s._xrf.video;
      v.loop = !settings.autoNext || this.items[i].video.isGif;
      v.muted = settings.muted;
      this.renderActions(s, this.items[i]);
      this.play(v);
      this.renderTop();
      if (i >= this.items.length - 4) this.fill();
    }

    play(v) {
      const p = v.play();
      if (p && p.catch) {
        p.catch((err) => {
          if (err?.name === 'NotAllowedError' && !v.muted) {
            v.muted = true;
            v.play().catch(() => {});
            toast('Sound was blocked by the browser. Press M to unmute.');
          }
        });
      }
    }

    unloadVideo(v) {
      v.pause();
      v.removeAttribute('src');
      try { v.load(); } catch { /* ignore */ }
    }

    onVideoError(index) {
      const s = this.slides[index];
      const item = this.items[index];
      if (!s || !item || !s._xrf.video.getAttribute('src')) return;
      s._xrf.variant++;
      const next = item.video.urls[s._xrf.variant];
      if (next) {
        s._xrf.video.src = next; // try a lower quality version
        if (index === this.active) this.play(s._xrf.video);
      } else {
        s.classList.add('xrf-broken');
      }
    }

    go(i) {
      if (i < 0) return;
      if (i >= this.items.length) {
        this.fill();
        if (this.endCard) this.endCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      this.lastNav = performance.now();
      this.slides[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    togglePlay() {
      const v = this.slides[this.active]?._xrf.video;
      if (!v) return;
      if (v.paused) this.play(v);
      else v.pause();
    }

    seek(delta) {
      const v = this.slides[this.active]?._xrf.video;
      if (v && v.duration) v.currentTime = Math.max(0, Math.min(v.duration - 0.1, v.currentTime + delta));
    }

    toggleMute() {
      settings.muted = !settings.muted;
      saveSettings();
      const s = this.slides[this.active];
      if (s) {
        s._xrf.video.muted = settings.muted;
        if (!settings.muted && s._xrf.video.paused) this.play(s._xrf.video);
      }
      this.slides.forEach((sl, j) => this.renderActions(sl, this.items[j]));
    }

    toggleAutoNext() {
      settings.autoNext = !settings.autoNext;
      saveSettings();
      const s = this.slides[this.active];
      if (s) s._xrf.video.loop = !settings.autoNext || this.items[this.active].video.isGif;
      this.renderTop();
      toast(settings.autoNext ? 'Auto-next on: plays the next video when one ends' : 'Auto-next off: videos loop');
    }

    toggleFullscreen() {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else this.root.requestFullscreen?.().catch(() => {});
    }

    toggleHelp() {
      this.helpBox.classList.toggle('xrf-show');
    }

    openPost(index = this.active) {
      const it = this.items[index];
      if (it) window.open(`/${it.screenName}/status/${it.id}`, '_blank', 'noopener');
    }

    async toggleLike(index = this.active) {
      const it = this.items[index];
      const s = this.slides[index];
      if (!it || !s) return;
      const on = !it.favorited;
      it.favorited = on;
      it.likes = Math.max(0, it.likes + (on ? 1 : -1));
      this.renderActions(s, it);
      try {
        await API().setLike(it.id, on);
      } catch (e) {
        it.favorited = !on;
        it.likes = Math.max(0, it.likes + (on ? -1 : 1));
        this.renderActions(s, it);
        toast(`Couldn’t update like: ${e.message}`, true);
      }
    }

    async toggleBookmark(index = this.active) {
      const it = this.items[index];
      const s = this.slides[index];
      if (!it || !s) return;
      const on = !it.bookmarked;
      it.bookmarked = on;
      this.renderActions(s, it);
      try {
        await API().setBookmark(it.id, on);
        toast(on ? 'Added to your Bookmarks' : 'Removed from your Bookmarks');
      } catch (e) {
        it.bookmarked = !on;
        this.renderActions(s, it);
        toast(`Couldn’t update bookmark: ${e.message}`, true);
      }
    }

    // ---------- input ----------
    onWheel(e) {
      if (e.target.closest?.('.xrf-text.xrf-expanded, .xrf-help')) return;
      e.preventDefault();
      if (Math.abs(e.deltaY) < 2) return;
      const now = performance.now();
      // One swipe/flick = one video. A continuous scroll keeps going about once a second.
      const newGesture = now - this.lastWheel > 160;
      this.lastWheel = now;
      if (newGesture || now - this.lastNav > 1000) this.go(this.active + Math.sign(e.deltaY));
    }

    onKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      let handled = true;
      switch (e.key) {
        case 'Escape':
          if (this.helpBox.classList.contains('xrf-show')) this.toggleHelp();
          else this.close();
          break;
        case 'ArrowDown': case 'PageDown': case 'j': case 'J': this.go(this.active + 1); break;
        case 'ArrowUp': case 'PageUp': case 'k': case 'K': this.go(this.active - 1); break;
        case ' ': case 'Spacebar': this.togglePlay(); break;
        case 'ArrowRight': this.seek(5); break;
        case 'ArrowLeft': this.seek(-5); break;
        case 'm': case 'M': this.toggleMute(); break;
        case 'l': case 'L': this.toggleLike(); break;
        case 'b': case 'B': this.toggleBookmark(); break;
        case 's': case 'S': this.reseed(); break;
        case 'o': case 'O': this.openPost(); break;
        case 'a': case 'A': this.toggleAutoNext(); break;
        case 'f': case 'F': this.toggleFullscreen(); break;
        case '?': this.toggleHelp(); break;
        default: handled = false;
      }
      // Stop x.com's own shortcuts (j/k/l…) from acting on the page underneath.
      e.stopImmediatePropagation();
      if (handled) e.preventDefault();
    }

    close() {
      if (this.closed) return;
      this.closed = true;
      this.gen++;
      this.observer.disconnect();
      for (const s of this.slides) this.unloadVideo(s._xrf.video);
      window.removeEventListener('keydown', this.onKey, true);
      window.removeEventListener('keyup', this.blockKey, true);
      window.removeEventListener('keypress', this.blockKey, true);
      if (document.fullscreenElement === this.root) document.exitFullscreen().catch(() => {});
      this.root.remove();
      document.documentElement.style.overflow = this.prevOverflow;
      if (current === this) current = null;
    }
  }

  function open(seed) {
    if (!seed || !seed.id) return;
    if (current) current.close();
    current = new Player({ id: String(seed.id), handle: seed.handle || '' });
  }

  globalThis.XRF_PLAYER = { open, toast, icon, isOpen: () => !!current };
})();
