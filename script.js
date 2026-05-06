const els = document.querySelectorAll('.fade-in');

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
});

els.forEach(el => obs.observe(el));
