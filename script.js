document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const navToggle = document.querySelector('.nav-toggle');
  const dropdown = document.querySelector('.nav-dropdown');
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const fadeEls = document.querySelectorAll('.fade-in');

  const logoButton = document.querySelector('.logo-wrap');
  const topButton = document.querySelector('.top-button');
  const hero = document.querySelector('.hero');

  const updateHeroParallax = () => {
    if (!hero) return;
    const offset = Math.min(window.scrollY * 0.18, 80);
    hero.style.setProperty('--hero-parallax', `${offset}px`);
  };

  updateHeroParallax();
  window.addEventListener('scroll', updateHeroParallax, { passive: true });

  
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = body.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (logoButton) {
    logoButton.addEventListener('click', () => {
      logoButton.classList.remove('ripple');
      void logoButton.offsetWidth;
      logoButton.classList.add('ripple');
    });
  }

  
  document.querySelectorAll('.site-nav a').forEach(link => {
    link.addEventListener('click', () => {
      body.classList.remove('menu-open');
  
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

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

  //TOP BUTTON - for going back to the top of the page
  if (topButton) {
  const updateTopButton = () => {
    topButton.classList.toggle('visible', window.scrollY > 420);
  };

  topButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  updateTopButton();
  window.addEventListener('scroll', updateTopButton, { passive: true });
  }

//LIGHT BOX FOR SKILL PAGES (images)
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = document.querySelector('.lightbox-image');
  const lightboxClose = document.querySelector('.lightbox-close');
  
  if (lightbox && lightboxImage && lightboxClose) {
    document.querySelectorAll('.art-gallery a').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
  
        const image = link.querySelector('img');
        lightboxImage.src = link.href;
        lightboxImage.alt = image ? image.alt : '';
  
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
      });
    });
  
    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      lightboxImage.src = '';
      lightboxImage.alt = '';
    };
  
    lightboxClose.addEventListener('click', closeLightbox);
  
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  
});
