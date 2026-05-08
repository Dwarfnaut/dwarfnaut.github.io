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

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let hasDragged = false;

    const snapToNearestItem = () => {
      const step = getStep();
      const nearest = Math.round(track.scrollLeft / step) * step;
      track.scrollTo({ left: nearest, behavior: 'smooth' });
    };

    track.addEventListener('pointerdown', event => {
      isDragging = true;
      hasDragged = false;
      startX = event.clientX;
      startScrollLeft = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
    });

    track.addEventListener('pointermove', event => {
      if (!isDragging) {
        return;
      }

      const distance = event.clientX - startX;

      if (Math.abs(distance) > 4) {
        hasDragged = true;
      }

      track.scrollLeft = startScrollLeft - distance;
    });

    const stopDragging = event => {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      track.classList.remove('is-dragging');

      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }

      snapToNearestItem();
    };

    track.addEventListener('pointerup', stopDragging);
    track.addEventListener('pointercancel', stopDragging);
    track.addEventListener('lostpointercapture', () => {
      isDragging = false;
      track.classList.remove('is-dragging');
    });

    track.addEventListener('click', event => {
      if (hasDragged) {
        event.preventDefault();
      }
    });
  });
});
