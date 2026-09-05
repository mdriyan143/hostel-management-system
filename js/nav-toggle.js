(function () {
  var KEY = 'hm_nav_collapsed';

  function apply(collapsed) {
    document.body.classList.toggle('nav-collapsed', collapsed);
  }

  apply(localStorage.getItem(KEY) === '1');

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('navToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var collapsed = !document.body.classList.contains('nav-collapsed');
      apply(collapsed);
      localStorage.setItem(KEY, collapsed ? '1' : '0');
    });
  });
})();
