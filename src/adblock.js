// RTube ad-block + page enhancement script, injected into every page.
//
// Strategy (invisible, no overlays):
//  - A requestAnimationFrame loop (~16ms) runs synchronously BEFORE the browser
//    paints each frame. The moment a YouTube ad state is detected, the callback
//    mutes the video, seeks the ad to its end, maxes out playbackRate and clicks
//    any skip button - all in the same frame, so the ad frame never renders.
//  - Cosmetic CSS hides ad containers, promos and "Open App" banners on all sites.
//  - The page-visibility hack keeps media playing when the app is backgrounded
//    (iOS marks the webview hidden on background; players listen to
//    visibilitychange). Honors the Background Play setting via
//    window.__rtube_background_play.
export const ADBLOCK_JS = `(function () {
  if (window.__rtube_adblock_installed) return;
  window.__rtube_adblock_installed = true;

  // Background audio: keep the page "visible" so players don't pause when the
  // app is backgrounded or the screen locks.
  function applyVisibilityHack() {
    try {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      Object.defineProperty(document, 'webkitHidden', { value: false, configurable: true });
      Object.defineProperty(document, 'webkitVisibilityState', { value: 'visible', configurable: true });
    } catch (e) {}
  }
  if (window.__rtube_background_play !== false) applyVisibilityHack();
  function __rt_block_visibility(e) {
    if (window.__rtube_background_play === false) return;
    try { e.stopImmediatePropagation(); } catch (err) {}
  }
  document.addEventListener('visibilitychange', __rt_block_visibility, true);
  document.addEventListener('webkitvisibilitychange', __rt_block_visibility, true);

  var host = "";
  try { host = location.hostname || ""; } catch (e) {}
  var isYouTube = /(^|\\.)youtube\\.com$/.test(host) || /(^|\\.)youtu\\.be$/.test(host);

  function checkIsAd(player) {
    if (!player) return false;
    if (player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting')) {
      return true;
    }
    if (player.querySelector('.ytp-ad-text, .ytp-ad-preview-text, .ytp-ad-skip-button, .ytp-ad-player-overlay-layout, .ytp-ad-badge')) {
      return true;
    }
    var adModule = player.querySelector('.video-ads.ytp-ad-module');
    if (adModule && adModule.children.length > 0) {
      return true;
    }
    return false;
  }

  // High-frequency requestAnimationFrame loop (~16ms), runs before paint.
  function adScanLoop() {
    try {
      // Block Ads toggle. When off, skip everything but keep the loop alive so
      // re-enabling works without a page reload.
      if (window.__rtube_block_enabled === false) {
        requestAnimationFrame(adScanLoop);
        return;
      }
      if (isYouTube) {
        var player = document.querySelector('.html5-video-player');
        if (player) {
          var isAd = checkIsAd(player);
          var video = player.querySelector('video') || document.querySelector('video');

          if (isAd) {
            // Act synchronously before paint: mute and seek the ad to its end.
            if (video) {
              video.muted = true;
              if (!isNaN(video.duration) && video.duration > 0) {
                video.currentTime = video.duration;
              }
              video.playbackRate = 16.0;
            }

            // Click any skip button immediately.
            var skipBtn = player.querySelector(
              '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .videoAdUiSkipButton'
            );
            if (skipBtn && typeof skipBtn.click === 'function') {
              skipBtn.click();
            }

            // Trigger YouTube's own player skip API when available.
            var moviePlayer = document.getElementById('movie_player') || player;
            if (moviePlayer && typeof moviePlayer.skipAd === 'function') {
              moviePlayer.skipAd();
            }
          } else {
            // Real content: make sure playback rate is normal.
            if (video && video.playbackRate > 2.0) {
              video.playbackRate = 1.0;
            }
          }
        }
      }
    } catch (e) {}
    requestAnimationFrame(adScanLoop);
  }
  requestAnimationFrame(adScanLoop);

  // Cosmetic filter CSS: hides ad containers, promos and "Open App" banners.
  var css = [
    '.ytp-ad-player-overlay,',
    '.ytp-ad-module,',
    '.video-ads,',
    '.ytp-ad-overlay-container,',
    '.ytp-ad-message-container,',
    '.ytp-ad-action-interstitial,',
    '.ytp-ad-image-overlay,',
    '.ytp-ad-text-overlay,',
    '[id*="google_ads"], [id*="banner-ad"], [class*="ad-banner"],',
    '[class*="sponsored-post"], [class*="advertisement"], .ad-container,',
    '.adsbygoogle, iframe[src*="doubleclick"], iframe[src*="googleads"],',
    '[data-ad-unit], [data-ad-slot], .taboola, .outbrain,',
    'ytd-banner-promo-renderer, ytd-ad-slot-renderer,',
    '[class*="promoted-item"], [id*="promo-banner"],',
    'ytm-app-banner, ytm-smart-app-banner, ytm-open-app-banner,',
    '[class*="open-app"], [id*="open-app"], [class*="app-banner"],',
    '[id*="app-banner"], [aria-label*="Open App" i], [aria-label*="Open in app" i] {',
    '  display: none !important;',
    '  visibility: hidden !important;',
    '  height: 0 !important;',
    '  max-height: 0 !important;',
    '  opacity: 0 !important;',
    '  pointer-events: none !important;',
    '}'
  ].join('\\n');

  function injectCSS() {
    try {
      if (window.__rtube_block_enabled === false) return;
      if (document.getElementById('rtube-adblock-css')) return;
      var root = document.head || document.documentElement;
      if (!root) return;
      var style = document.createElement('style');
      style.id = 'rtube-adblock-css';
      style.textContent = css;
      root.appendChild(style);
    } catch (e) {}
  }

  function cleanBanners() {
    try {
      if (window.__rtube_block_enabled === false) return;
      var banners = document.querySelectorAll(
        'ytm-app-banner, ytm-smart-app-banner, ytm-open-app-banner,' +
        'ytm-promoted-sparkles-web-renderer, ytd-promoted-sparkles-web-renderer,' +
        '#masthead-ad, .ytm-companion-ad-renderer'
      );
      for (var i = 0; i < banners.length; i++) {
        banners[i].remove();
      }
    } catch (e) {}
  }

  injectCSS();
  cleanBanners();
  setInterval(cleanBanners, 1500);

  // Re-apply after SPA-style navigations.
  try {
    if (document.documentElement) {
      new MutationObserver(function () { injectCSS(); cleanBanners(); })
        .observe(document.documentElement, { childList: true, subtree: true });
    }
  } catch (e) {}
})();true;`;

// Flip the Block Ads toggle live without reloading the page.
export const SET_BLOCK_ENABLED = (enabled) =>
  `window.__rtube_block_enabled = ${enabled ? 'true' : 'false'};true;`;

// Flip the Background Play behavior live without reloading the page.
export const SET_BACKGROUND_PLAY = (enabled) =>
  `window.__rtube_background_play = ${enabled ? 'true' : 'false'};true;`;

// Pause every media element on the page (used by the sleep timer).
export const PAUSE_ALL_JS = `(function(){try{document.querySelectorAll('video,audio').forEach(function(m){try{m.pause();}catch(e){}});}catch(e){}})();true;`;

// Find the page's main video element and report a downloadable src back.
export const FIND_VIDEO_JS = `(function(){
  try {
    var vids = Array.prototype.slice.call(document.querySelectorAll('video'));
    var best = null, bestScore = -1;
    vids.forEach(function(v){
      var src = v.currentSrc || v.src || '';
      if (!src || src.indexOf('blob:') === 0) return;
      var score = (v.videoWidth || 0) * (v.videoHeight || 0);
      if (score > bestScore) { bestScore = score; best = { src: src, title: document.title }; }
    });
    if (best) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'RTUBE_VIDEO_SRC', src: best.src, title: best.title }));
    } else {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'RTUBE_VIDEO_SRC', src: null }));
    }
  } catch (e) {
    try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'RTUBE_VIDEO_SRC', src: null })); } catch (e2) {}
  }
})();true;`;
