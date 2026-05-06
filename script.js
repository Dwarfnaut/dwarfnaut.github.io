document.addEventListener('DOMContentLoaded', () => {
  const els = document.querySelectorAll('.fade-in');

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  els.forEach(el => obs.observe(el));
});
