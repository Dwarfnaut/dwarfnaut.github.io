document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');

    if (!track || !prev || !next) {
      return;
    }

    const getStep = () => {
      const firstItem = track.querySelector('figure');
      if (!firstItem) {
        return track.clientWidth;
      }

      const gap = parseFloat(getComputedStyle(track).columnGap || '0');
      return firstItem.getBoundingClientRect().width + gap;
    };

    const go = direction => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const nextLeft = track.scrollLeft + getStep() * direction;

      if (direction > 0 && nextLeft >= maxScroll - 8) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      if (direction < 0 && nextLeft <= 8) {
        track.scrollTo({ left: maxScroll, behavior: 'smooth' });
        return;
      }

      track.scrollBy({ left: getStep() * direction, behavior: 'smooth' });
    };

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
  });
});
