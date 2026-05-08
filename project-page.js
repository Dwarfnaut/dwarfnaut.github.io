document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');

    if (!track || !prev || !next) {
      return;
    }

    const originalItems = Array.from(track.querySelectorAll('figure'));

    if (originalItems.length > 1) {
      const firstClone = originalItems[0].cloneNode(true);
      const lastClone = originalItems[originalItems.length - 1].cloneNode(true);

      firstClone.dataset.clone = 'true';
      lastClone.dataset.clone = 'true';

      firstClone.setAttribute('aria-hidden', 'true');
      lastClone.setAttribute('aria-hidden', 'true');

      track.insertBefore(lastClone, originalItems[0]);
      track.appendChild(firstClone);
    }

    track.querySelectorAll('img, video').forEach(media => {
      media.setAttribute('draggable', 'false');
      media.addEventListener('dragstart', event => event.preventDefault());
    });

    const getStep = () => {
      const firstItem = track.querySelector('figure');
      if (!firstItem) {
        return track.clientWidth;
      }

      const gap = parseFloat(getComputedStyle(track).columnGap || '0');
      return firstItem.getBoundingClientRect().width + gap;
    };

    const getRealStart = () => getStep();
    const getRealEnd = () => getStep() * originalItems.length;

    const jumpTo = left => {
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = left;
      track.offsetHeight;
      track.style.scrollBehavior = '';
    };

    const normalizeLoop = () => {
      if (originalItems.length <= 1) {
        return;
      }

      const realStart = getRealStart();
      const realEnd = getRealEnd();
      const tolerance = Math.max(4, getStep() * 0.18);

      if (track.scrollLeft < realStart - tolerance) {
        jumpTo(realEnd);
      }

      if (track.scrollLeft > realEnd + tolerance) {
        jumpTo(realStart);
      }
    };

    const go = direction => {
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

    const startOnFirstRealSlide = () => {
      requestAnimationFrame(() => {
        jumpTo(getRealStart());
      });
    };

    startOnFirstRealSlide();

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

    track.addEventListener('scroll', () => {
      window.clearTimeout(track.loopTimer);
      track.loopTimer = window.setTimeout(normalizeLoop, 90);
    }, { passive: true });

    window.addEventListener('resize', startOnFirstRealSlide);
  });
});
