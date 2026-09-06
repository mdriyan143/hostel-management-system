(function () {
  var KEY = 'hm_nav_collapsed';
  var MOBILE_QUERY = '(max-width: 860px)';

  function isMobile() {
    return window.matchMedia(MOBILE_QUERY).matches;
  }

  function applyDesktopCollapse(collapsed) {
    document.body.classList.toggle('nav-collapsed', collapsed);
  }

  // Desktop preference is remembered across pages. The mobile drawer is not -
  // it always starts closed on each page load, so it never traps you behind
  // a full-screen overlay on first visit or after following a link.
  applyDesktopCollapse(localStorage.getItem(KEY) === '1');

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('navToggle');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isMobile()) {
        document.body.classList.toggle('mobile-nav-open');
      } else {
        var collapsed = !document.body.classList.contains('nav-collapsed');
        applyDesktopCollapse(collapsed);
        localStorage.setItem(KEY, collapsed ? '1' : '0');
      }
    });

    // Tapping outside the open drawer (the dark overlay) closes it on mobile.
    document.addEventListener('click', function (e) {
      if (!isMobile()) return;
      if (!document.body.classList.contains('mobile-nav-open')) return;
      var sidebar = document.querySelector('.sidebar');
      if (sidebar && !sidebar.contains(e.target) && e.target !== btn) {
        document.body.classList.remove('mobile-nav-open');
      }
    });
  });
})();
