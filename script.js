document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const navToggle = document.querySelector('.nav-toggle');
  const dropdown = document.querySelector('.nav-dropdown');
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const fadeEls = document.querySelectorAll('.fade-in');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = body.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (dropdown && dropdownToggle) {
    dropdownToggle.addEventListener('click', () => {
      const isOpen = dropdown.classList.toggle('open');
      dropdownToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('img').forEach(img => {
    const showFallback = () => {
      const fallbackText = img.dataset.fallbackText;

      if (img.dataset.optional !== undefined) {
        img.remove();
        return;
      }

      if (!fallbackText || !img.parentElement) {
        return;
      }

      const fallback = document.createElement('span');
      fallback.className = 'image-fallback';
      fallback.textContent = fallbackText;
      img.replaceWith(fallback);
    };

    img.addEventListener('error', showFallback, { once: true });

    if (img.complete && img.naturalWidth === 0) {
      showFallback();
    }
  });

  if (!('IntersectionObserver' in window)) {
    fadeEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.14
  });

  fadeEls.forEach(el => observer.observe(el));
});
