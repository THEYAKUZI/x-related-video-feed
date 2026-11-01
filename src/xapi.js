// Talks to X's internal web API the same way x.com itself does.
// Runs as a content script on x.com, so requests go out with the user's own session.
(() => {
  'use strict';

  const BEARER =
    'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';
  const CDN = 'https://abs.twimg.com/responsive-web/client-web/';
  const ORIGIN = () => (typeof location !== 'undefined' && location.origin) || 'https://x.com';

  const IMMERSIVE_FEATURES = [
    'rweb_video_screen_enabled', 'rweb_cashtags_enabled', 'profile_label_improvements_pcf_label_in_post_enabled',
    'responsive_web_profile_redirect_enabled', 'rweb_tipjar_consumption_enabled', 'verified_phone_label_enabled',
    'creator_subscriptions_tweet_preview_api_enabled', 'responsive_web_graphql_timeline_navigation_enabled',
    'premium_content_api_read_enabled', 'communities_web_enable_tweet_community_results_fetch',
    'c9s_tweet_anatomy_moderator_badge_enabled', 'responsive_web_grok_analyze_button_fetch_trends_enabled',
    'responsive_web_grok_analyze_post_followups_enabled', 'rweb_cashtags_composer_attachment_enabled',
    'responsive_web_jetfuel_frame', 'rweb_sports_post_context_enabled', 'x_elections_post_context_enabled',
    'responsive_web_grok_share_attachment_enabled', 'responsive_web_grok_annotations_enabled',
    'articles_preview_enabled', 'responsive_web_edit_tweet_api_enabled',
    'rweb_conversational_replies_downvote_enabled', 'graphql_is_translatable_rweb_tweet_is_translatable_enabled',
    'view_counts_everywhere_api_enabled', 'longform_notetweets_consumption_enabled',
    'responsive_web_twitter_article_tweet_consumption_enabled', 'content_disclosure_indicator_enabled',
    'content_disclosure_ai_generated_indicator_enabled', 'responsive_web_grok_show_grok_translated_post',
    'responsive_web_grok_analysis_button_from_backend', 'post_ctas_fetch_enabled',
    'freedom_of_speech_not_reach_fetch_enabled', 'standardized_nudges_misinfo',
    'tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled',
    'longform_notetweets_rich_text_read_enabled', 'longform_notetweets_inline_media_enabled',
    'responsive_web_nested_quote_preview_enabled', 'responsive_web_grok_image_annotation_enabled',
    'responsive_web_grok_imagine_annotation_enabled', 'responsive_web_made_on_x_label_enabled',
    'responsive_web_grok_community_note_auto_translation_is_enabled', 'responsive_web_enhance_cards_enabled',
  ];
  const TWEET_FEATURES = IMMERSIVE_FEATURES.filter(
    (f) => f !== 'rweb_video_screen_enabled' && f !== 'responsive_web_enhance_cards_enabled',
  );

  // Fallback values, used only when the live x.com page doesn't tell us the current ones.
  const FEATURE_DEFAULTS = {
    articles_preview_enabled: true, c9s_tweet_anatomy_moderator_badge_enabled: true,
    communities_web_enable_tweet_community_results_fetch: true, content_disclosure_ai_generated_indicator_enabled: true,
    content_disclosure_indicator_enabled: true, creator_subscriptions_tweet_preview_api_enabled: true,
    freedom_of_speech_not_reach_fetch_enabled: true, graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    longform_notetweets_consumption_enabled: true, longform_notetweets_inline_media_enabled: false,
    longform_notetweets_rich_text_read_enabled: true, post_ctas_fetch_enabled: false,
    premium_content_api_read_enabled: false, profile_label_improvements_pcf_label_in_post_enabled: true,
    responsive_web_edit_tweet_api_enabled: true, responsive_web_enhance_cards_enabled: false,
    responsive_web_graphql_timeline_navigation_enabled: true, responsive_web_grok_analysis_button_from_backend: true,
    responsive_web_grok_analyze_button_fetch_trends_enabled: false, responsive_web_grok_analyze_post_followups_enabled: false,
    responsive_web_grok_annotations_enabled: true, responsive_web_grok_community_note_auto_translation_is_enabled: true,
    responsive_web_grok_image_annotation_enabled: true, responsive_web_grok_imagine_annotation_enabled: true,
    responsive_web_grok_share_attachment_enabled: true, responsive_web_grok_show_grok_translated_post: true,
    responsive_web_jetfuel_frame: true, responsive_web_made_on_x_label_enabled: false,
    responsive_web_nested_quote_preview_enabled: true, responsive_web_profile_redirect_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true, rweb_cashtags_composer_attachment_enabled: true,
    rweb_cashtags_enabled: true, rweb_conversational_replies_downvote_enabled: false,
    rweb_sports_post_context_enabled: true, rweb_tipjar_consumption_enabled: false, rweb_video_screen_enabled: false,
    standardized_nudges_misinfo: true, tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
    verified_phone_label_enabled: false, view_counts_everywhere_api_enabled: true, x_elections_post_context_enabled: true,
  };

  // Known-good operation IDs (checked against x.com on 2026-11-01). X rotates these, so we
  // also look them up in X's own JS bundles at runtime and only fall back to these.
  const OPS = {
    ImmersiveMedia: { id: 'knKMRvWHvFkNPnuaEfjEvw', method: 'GET', chunk: 'bundle.ImmersiveMediaViewer', features: IMMERSIVE_FEATURES },
    TweetResultByRestId: { id: 'U8lc5aomF5krJzZ9vJ9wxg', method: 'GET', chunk: 'main', features: TWEET_FEATURES },
    CreateBookmark: { id: 'aoDbu3RHznuiSkQ9aNM67Q', method: 'POST', chunk: 'main' },
    DeleteBookmark: { id: 'Wlmlj2-xzyS1GN3a6cj-mQ', method: 'POST', chunk: 'main' },
    FavoriteTweet: { id: 'lI07N6Otwv1PhnEgXILM7A', method: 'POST', chunk: 'main' },
    UnfavoriteTweet: { id: 'ZYKSe-w7KEslx3JhSIk5LA', method: 'POST', chunk: 'main' },
  };

  class XApiError extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  }

  // ---------------------------------------------------------------------------
  // x.com app shell: the HTML page holds the signing key, the animation frames and
  // the map of JS chunk URLs. We fetch a fresh copy once per page load.
  // ---------------------------------------------------------------------------

  let shellPromise = null;

  function parseHtml(html) {
    return new DOMParser().parseFromString(html, 'text/html');
  }

  function shellLooksUsable(html) {
    return html.includes('twitter-site-verification') && html.includes('loading-x-anim') && html.includes('ondemand.s');
  }

  async function fetchShell(force = false) {
    if (shellPromise && !force) return shellPromise;
    shellPromise = (async () => {
      const candidates = [
        async () => {
          const r = await fetch(`${ORIGIN()}/home`, { credentials: 'include', cache: 'no-store', headers: { accept: 'text/html' } });
          return r.ok ? r.text() : '';
        },
        async () => (typeof document !== 'undefined' ? document.documentElement.outerHTML : ''),
        async () => {
          const r = await fetch(`${ORIGIN()}/i/jf/`, { credentials: 'include', cache: 'no-store', headers: { accept: 'text/html' } });
          return r.ok ? r.text() : '';
        },
      ];
      let last = '';
      for (const get of candidates) {
        try {
          const html = await get();
          if (html && shellLooksUsable(html)) return { html, doc: parseHtml(html) };
          if (html) last = html;
        } catch { /* try the next source */ }
      }
      if (!last) throw new XApiError('Could not load the x.com page data. Are you logged in?');
      return { html: last, doc: parseHtml(last) };
    })();
    shellPromise.catch(() => { shellPromise = null; });
    return shellPromise;
  }

  function chunkUrls(html) {
    const urls = {};
    const main = html.match(/https:\/\/abs\.twimg\.com\/responsive-web\/client-web\/main\.[0-9a-f]+\.js/);
    if (main) urls.main = main[0];
    // webpack runtime: ({id:"name",...}[e]||e)+"."+({id:"hash",...})[e]+"a.js"
    const m = html.match(/\(\{([^}]*?ondemand\.s[^}]*?)\}\)\[e\]\|\|e\)\+"\."\+\(\{([^}]*)\}\)\[e\]\+"a\.js"/);
    if (m) {
      const names = {};
      for (const [, id, name] of m[1].matchAll(/(\d+):"([^"]+)"/g)) names[id] = name;
      for (const [, id, hash] of m[2].matchAll(/(\d+):"([^"]+)"/g)) {
        urls[names[id] || id] = `${CDN}${names[id] || id}.${hash}a.js`;
      }
    }
    return urls;
  }

  function featureValueFromShell(html, name) {
    // The page state lists defaults first and per-user overrides after, so the last match wins.
    const re = new RegExp(`"${name}":\\{"value":(true|false)`, 'g');
    let value;
    for (const m of html.matchAll(re)) value = m[1] === 'true';
    return value;
  }

  // ---------------------------------------------------------------------------
  // x-client-transaction-id: a signature X requires on API calls.
  // Port of github.com/Lqm1/x-client-transaction-id (MIT).
  // ---------------------------------------------------------------------------

  const TX_KEYWORD = 'obfiowerehiring';
  const TX_EXTRA_BYTE = 3;

  function cubicValue(curves, time) {
    const calc = (a, b, m) => 3 * a * (1 - m) * (1 - m) * m + 3 * b * (1 - m) * m * m + m * m * m;
    if (time <= 0) {
      let g = 0;
      if (curves[0] > 0) g = curves[1] / curves[0];
      else if (curves[1] === 0 && curves[2] > 0) g = curves[3] / curves[2];
      return g * time;
    }
    if (time >= 1) {
      let g = 0;
      if (curves[2] < 1) g = (curves[3] - 1) / (curves[2] - 1);
      else if (curves[2] === 1 && curves[0] < 1) g = (curves[1] - 1) / (curves[0] - 1);
      return 1 + g * (time - 1);
    }
    let start = 0, end = 1, mid = 0;
    while (start < end) {
      mid = (start + end) / 2;
      const xEst = calc(curves[0], curves[2], mid);
      if (Math.abs(time - xEst) < 0.00001) return calc(curves[1], curves[3], mid);
      if (xEst < time) start = mid;
      else end = mid;
    }
    return calc(curves[1], curves[3], mid);
  }

  function interpolate(from, to, f) {
    return from.map((v, i) => v * (1 - f) + to[i] * f);
  }

  function floatToHex(x) {
    const result = [];
    let quotient = Math.floor(x);
    let fraction = x - quotient;
    while (quotient > 0) {
      quotient = Math.floor(x / 16);
      const remainder = Math.floor(x - quotient * 16);
      result.unshift(remainder > 9 ? String.fromCharCode(remainder + 55) : String(remainder));
      x = quotient;
    }
    if (fraction === 0) return result.join('');
    result.push('.');
    while (fraction > 0) {
      fraction *= 16;
      const integer = Math.floor(fraction);
      fraction -= integer;
      result.push(integer > 9 ? String.fromCharCode(integer + 55) : String(integer));
    }
    return result.join('');
  }

  function solve(value, min, max, rounding) {
    const r = (value * (max - min)) / 255 + min;
    return rounding ? Math.floor(r) : Math.round(r * 100) / 100;
  }

  function animate(frames, targetTime) {
    const fromColor = frames.slice(0, 3).concat(1).map(Number);
    const toColor = frames.slice(3, 6).concat(1).map(Number);
    const toRotation = [solve(frames[6], 60, 360, true)];
    const curves = frames.slice(7).map((item, i) => solve(item, i % 2 ? -1 : 0, 1, false));
    const val = cubicValue(curves, targetTime);
    const color = interpolate(fromColor, toColor, val).map((v) => (v > 0 ? v : 0));
    const rotation = interpolate([0], toRotation, val);
    const rad = (rotation[0] * Math.PI) / 180;
    const matrix = [Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)];
    const parts = color.slice(0, -1).map((v) => Math.round(v).toString(16));
    for (const v of matrix) {
      let rounded = Math.round(v * 100) / 100;
      if (rounded < 0) rounded = -rounded;
      const hex = floatToHex(rounded);
      parts.push(hex.startsWith('.') ? `0${hex}`.toLowerCase() : hex || '0');
    }
    parts.push('0', '0');
    return parts.join('').replace(/[.-]/g, '');
  }

  function base64ToBytes(b64) {
    return Array.from(atob(b64), (c) => c.charCodeAt(0));
  }

  function bytesToBase64(bytes) {
    let s = '';
    for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s);
  }

  const ONDEMAND_RE = /(\d+):\s*["']ondemand\.s["'][\s\S]*?\}\)\[e\]\s*\|\|\s*e\)\s*\+\s*["']\.["']\s*\+\s*\(\{[\s\S]*?\b\1:\s*["']([a-zA-Z0-9_-]+)["']/;
  const ONDEMAND_OLD_RE = /["']ondemand\.s["']\s*:\s*["']([a-zA-Z0-9_-]+)["']/;

  async function createSigner(shell) {
    const { html, doc } = shell;
    let hash = (html.match(ONDEMAND_RE) || [])[2] || (html.match(ONDEMAND_OLD_RE) || [])[1];
    if (!hash) throw new XApiError('Could not find X’s signing script (ondemand.s).');
    const onDemand = await fetch(`${CDN}ondemand.s.${hash}a.js`).then((r) => {
      if (!r.ok) throw new XApiError(`Could not download X’s signing script (HTTP ${r.status}).`);
      return r.text();
    });
    const indices = [...onDemand.matchAll(/\(\w\[(\d{1,2})\],\s*16\)/g)].map((m) => parseInt(m[1], 10));
    if (!indices.length) throw new XApiError('Could not read X’s signing script.');
    const rowIndexKey = indices[0];
    const keyByteIndices = indices.slice(1);

    const key = doc.querySelector("[name='twitter-site-verification']")?.getAttribute('content');
    if (!key) throw new XApiError('Could not find X’s site key on the page.');
    const keyBytes = base64ToBytes(key);

    const frames = Array.from(doc.querySelectorAll("[id^='loading-x-anim']"));
    if (!frames.length) throw new XApiError('Could not find X’s loading animation data.');
    const frame = frames[keyBytes[5] % 4];
    const d = frame?.children?.[0]?.children?.[1]?.getAttribute('d');
    if (!d) throw new XApiError('X’s loading animation data looks different than expected.');
    const rows = d.substring(9).split('C').map((seg) => {
      const cleaned = seg.replace(/[^\d]+/g, ' ').trim();
      return cleaned ? cleaned.split(/\s+/).map((n) => parseInt(n, 10)) : [];
    });
    const rowIndex = keyBytes[rowIndexKey] % 16;
    let frameTime = keyByteIndices.reduce((acc, i) => acc * (keyBytes[i] % 16), 1);
    frameTime = Math.round(frameTime / 10) * 10;
    if (!rows[rowIndex]) throw new XApiError('X’s loading animation data looks different than expected.');
    const animationKey = animate(rows[rowIndex], frameTime / 4096);

    return async function sign(method, path, timeNow, randomNum) {
      timeNow = timeNow ?? Math.floor((Date.now() - 1682924400 * 1000) / 1000);
      const timeBytes = [timeNow & 0xff, (timeNow >> 8) & 0xff, (timeNow >> 16) & 0xff, (timeNow >> 24) & 0xff];
      const data = `${method}!${path}!${timeNow}${TX_KEYWORD}${animationKey}`;
      const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data)));
      const rnd = randomNum ?? Math.floor(Math.random() * 256);
      const bytes = [...keyBytes, ...timeBytes, ...Array.from(hash.slice(0, 16)), TX_EXTRA_BYTE];
      return bytesToBase64([rnd, ...bytes.map((b) => b ^ rnd)]).replace(/=/g, '');
    };
  }

  let signerPromise = null;
  function getSigner(force = false) {
    if (signerPromise && !force) return signerPromise;
    signerPromise = fetchShell(force).then(createSigner);
    signerPromise.catch(() => { signerPromise = null; });
    return signerPromise;
  }

  // ---------------------------------------------------------------------------
  // Operation lookup: find the current queryId + feature list in X's own bundles.
  // ---------------------------------------------------------------------------

  const opCache = new Map();
  const chunkTextCache = new Map();

  async function fetchChunk(url) {
    if (!chunkTextCache.has(url)) {
      const p = fetch(url).then((r) => (r.ok ? r.text() : ''));
      chunkTextCache.set(url, p);
      p.catch(() => chunkTextCache.delete(url));
    }
    return chunkTextCache.get(url);
  }

  function findOpInSource(src, name) {
    const re = new RegExp(
      `queryId:"([\\w-]+)",operationName:"${name}",operationType:"(\\w+)"(?:,metadata:\\{featureSwitches:\\[([^\\]]*)\\])?`,
    );
    const m = src.match(re);
    if (!m) return null;
    return {
      id: m[1],
      method: m[2] === 'mutation' ? 'POST' : 'GET',
      features: m[3] !== undefined ? [...m[3].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : null,
    };
  }

  async function resolveOp(name, force = false) {
    if (opCache.has(name) && !force) return opCache.get(name);
    const known = OPS[name];
    let op = { ...known, features: known.features ? [...known.features] : null };
    try {
      const shell = await fetchShell();
      const urls = chunkUrls(shell.html);
      const url = urls[known.chunk] || urls.main;
      if (url) {
        const found = findOpInSource(await withTimeout(fetchChunk(url), 10000), name);
        if (found) {
          op = { ...op, id: found.id, method: found.method };
          if (found.features && found.features.length) op.features = found.features;
        }
      }
    } catch { /* keep the known-good values */ }
    opCache.set(name, op);
    return op;
  }

  function withTimeout(p, ms) {
    return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
  }

  async function featureObject(names, extra) {
    let html = '';
    try { html = (await fetchShell()).html; } catch { /* use defaults */ }
    const out = {};
    for (const n of names) {
      const live = html ? featureValueFromShell(html, n) : undefined;
      out[n] = live ?? FEATURE_DEFAULTS[n] ?? false;
    }
    return Object.assign(out, extra);
  }

  // ---------------------------------------------------------------------------
  // GraphQL requests
  // ---------------------------------------------------------------------------

  function cookie(name) {
    if (typeof document === 'undefined') return '';
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : '';
  }

  async function gql(name, variables, opts = {}) {
    const attempt = opts.attempt || 0;
    const op = await resolveOp(name, attempt > 0);
    const sign = await getSigner(attempt > 0);
    const path = `/i/api/graphql/${op.id}/${name}`;
    const features = op.features ? await featureObject(op.features, opts.extraFeatures) : null;

    let url = ORIGIN() + path;
    let body;
    if (op.method === 'GET') {
      const qs = new URLSearchParams({ variables: JSON.stringify(variables) });
      if (features) qs.set('features', JSON.stringify(features));
      url += `?${qs.toString().replace(/\+/g, '%20')}`;
    } else {
      body = JSON.stringify({ variables, queryId: op.id, ...(features ? { features } : {}) });
    }

    const headers = {
      authorization: `Bearer ${BEARER}`,
      'content-type': 'application/json',
      'x-twitter-active-user': 'yes',
      'x-twitter-client-language': (typeof document !== 'undefined' && document.documentElement.lang) || 'en',
      'x-client-transaction-id': await sign(op.method, path),
    };
    const csrf = cookie('ct0');
    if (csrf) {
      headers['x-csrf-token'] = csrf;
      headers['x-twitter-auth-type'] = 'OAuth2Session';
    }
    Object.assign(headers, opts.headers);

    const res = await fetch(url, { method: op.method, headers, body, credentials: 'include' });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* not JSON */ }

    if (!res.ok && !json?.data) {
      // 404 with an empty body usually means a stale signature or operation ID: refresh both once.
      if ((res.status === 404 || res.status === 400) && attempt < 1) {
        return gql(name, variables, { ...opts, attempt: attempt + 1 });
      }
      const msg = json?.errors?.map((e) => e.message).join('; ');
      if (res.status === 401 || res.status === 403) {
        throw new XApiError(msg || 'X says you are not logged in (or this account can’t see that post).', res.status);
      }
      if (res.status === 429) throw new XApiError('X rate limit reached. Wait a few minutes and try again.', 429);
      if (res.status === 404) {
        throw new XApiError(msg || 'X refused the request (HTTP 404). Make sure you’re logged in to x.com, then reload the page.', 404);
      }
      throw new XApiError(msg || `X returned HTTP ${res.status} for ${name}.`, res.status);
    }

    const missing = json?.errors?.flatMap((e) => {
      const m = /features cannot be null:\s*(.+)$/i.exec(e.message || '');
      return m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : [];
    });
    if (missing?.length && attempt < 2) {
      const extraFeatures = { ...opts.extraFeatures };
      for (const f of missing) extraFeatures[f] = FEATURE_DEFAULTS[f] ?? false;
      return gql(name, variables, { ...opts, attempt: attempt + 1, extraFeatures });
    }
    if (json?.errors?.length && !json.data) {
      throw new XApiError(json.errors.map((e) => e.message).join('; '), res.status);
    }
    return json;
  }

  // ---------------------------------------------------------------------------
  // Response parsing
  // ---------------------------------------------------------------------------

  function unwrapTweet(r) {
    if (!r) return null;
    if (r.__typename === 'TweetWithVisibilityResults') r = r.tweet;
    if (!r || !r.legacy) return null;
    return r;
  }

  function pickVideo(legacy) {
    const media = legacy?.extended_entities?.media || [];
    const m = media.find((x) => x.type === 'video' || x.type === 'animated_gif');
    if (!m || !m.video_info) return null;
    const variants = m.video_info.variants || [];
    const mp4s = variants
      .filter((v) => v.content_type === 'video/mp4' && v.url)
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
    if (!mp4s.length) return null;
    return {
      url: mp4s[0].url,
      urls: mp4s.map((v) => v.url),
      poster: m.media_url_https || '',
      isGif: m.type === 'animated_gif',
      aspect: m.video_info.aspect_ratio || null,
      durationMs: m.video_info.duration_millis || 0,
      shortUrl: m.url || '',
    };
  }

  function decodeEntities(s) {
    return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  }

  function userInfo(tweet) {
    const u = tweet?.core?.user_results?.result || {};
    return {
      screenName: u.core?.screen_name || u.legacy?.screen_name || '',
      name: u.core?.name || u.legacy?.name || '',
      avatar: u.avatar?.image_url || u.legacy?.profile_image_url_https || '',
    };
  }

  // Turns a raw tweet result into a feed item, or null if it has no playable video.
  function toItem(raw) {
    const outer = unwrapTweet(raw);
    if (!outer) return null;
    const candidates = [
      outer,
      unwrapTweet(outer.legacy.retweeted_status_result?.result),
      unwrapTweet(outer.quoted_status_result?.result),
    ].filter(Boolean);
    for (const t of candidates) {
      const video = pickVideo(t.legacy);
      if (!video) continue;
      const user = userInfo(t);
      let text = t.note_tweet?.note_tweet_results?.result?.text || t.legacy.full_text || '';
      if (video.shortUrl) text = text.split(video.shortUrl).join('');
      text = decodeEntities(text).replace(/\s*https:\/\/t\.co\/\w+\s*$/, '').trim();
      return {
        id: t.rest_id || t.legacy.id_str,
        ...user,
        text,
        video,
        sensitive: !!t.legacy.possibly_sensitive,
        favorited: !!t.legacy.favorited,
        bookmarked: !!t.legacy.bookmarked,
        likes: t.legacy.favorite_count || 0,
        views: t.views?.count ? Number(t.views.count) : null,
      };
    }
    return null;
  }

  function findInstructions(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 8) return null;
    if (Array.isArray(obj.instructions)) return obj.instructions;
    for (const v of Object.values(obj)) {
      const found = findInstructions(v, depth + 1);
      if (found) return found;
    }
    return null;
  }

  function parseTimeline(json) {
    const items = [];
    let cursor = null;
    const instructions = findInstructions(json?.data) || [];

    const handleContent = (content, entryId) => {
      if (!content) return;
      if (content.cursorType || content.entryType === 'TimelineTimelineCursor' || content.itemType === 'TimelineTimelineCursor') {
        const value = content.value || content.itemContent?.value;
        if (content.cursorType === 'Bottom' || /cursor-bottom/.test(entryId || '')) cursor = value || cursor;
        return;
      }
      const ic = content.itemContent || content.item?.itemContent;
      if (ic?.tweet_results?.result) {
        if (ic.promotedMetadata || /^promoted/.test(entryId || '')) return;
        const item = toItem(ic.tweet_results.result);
        if (item) items.push(item);
        return;
      }
      if (ic && (ic.cursorType || ic.itemType === 'TimelineTimelineCursor')) {
        handleContent(ic, entryId);
        return;
      }
      for (const sub of content.items || []) handleContent(sub.item || sub, sub.entryId);
    };

    for (const ins of instructions) {
      const entries = ins.entries || (ins.entry ? [ins.entry] : []);
      for (const e of entries) handleContent(e.content, e.entryId);
      for (const sub of ins.moduleItems || []) handleContent(sub.item, sub.entryId);
    }

    // Unknown shape: fall back to grabbing every tweet with a video, in order.
    if (!items.length && json?.data) {
      const seen = new Set();
      const walk = (o, depth) => {
        if (!o || typeof o !== 'object' || depth > 30) return;
        if (o.tweet_results?.result) {
          const item = toItem(o.tweet_results.result);
          if (item && !seen.has(item.id)) { seen.add(item.id); items.push(item); }
          return;
        }
        if (o.cursorType === 'Bottom' && o.value) cursor = o.value;
        for (const v of Object.values(o)) walk(v, depth + 1);
      };
      walk(json.data, 0);
    }
    return { items, cursor };
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  async function relatedVideos(seedId, seedHandle, cursor) {
    const variables = { pinned_tweet_id: String(seedId), page_name: seedHandle || '', includePromotedContent: false };
    if (cursor) variables.cursor = cursor;
    const json = await gql('ImmersiveMedia', variables);
    return parseTimeline(json);
  }

  async function tweet(id) {
    const json = await gql('TweetResultByRestId', {
      tweetId: String(id), withCommunity: false, includePromotedContent: false, withVoice: false,
    });
    return toItem(json?.data?.tweetResult?.result);
  }

  const setLike = (id, on) => gql(on ? 'FavoriteTweet' : 'UnfavoriteTweet', { tweet_id: String(id) });
  const setBookmark = (id, on) => gql(on ? 'CreateBookmark' : 'DeleteBookmark', { tweet_id: String(id) });

  globalThis.XRF_API = {
    relatedVideos, tweet, setLike, setBookmark, XApiError,
    // Exposed for testing.
    _internal: { createSigner, chunkUrls, findOpInSource, featureValueFromShell, parseTimeline, toItem, gql, animate },
  };
})();
