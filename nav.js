(function () {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');

  if (!toggle || !menu) {
    return;
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', function () {
    if (menu.classList.contains('is-open')) {
      closeMenu();
      return;
    }

    openMenu();
  });

  menu.addEventListener('click', function (event) {
    if (event.target.tagName === 'A') {
      closeMenu();
    }
  });

  document.addEventListener('click', function (event) {
    if (!toggle.contains(event.target) && !menu.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });
})();
