document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');

    if (!track || !prev || !next) {
      return;
    }

    carousel.style.setProperty('--carousel-card-width', 'clamp(520px, 31vw, 690px)');
    carousel.style.setProperty('--carousel-gap', '20px');
    carousel.style.overflow = 'hidden';
    track.style.display = 'flex';
    track.style.gap = 'var(--carousel-gap)';
    track.style.width = '100%';
    track.style.overflow = 'visible';
    track.style.scrollBehavior = 'auto';
    track.style.scrollSnapType = 'none';
    track.style.willChange = 'transform';

    const originalItems = Array.from(track.querySelectorAll('figure'));

    if (originalItems.length === 0) {
      return;
    }

    originalItems.forEach(item => {
      item.style.flex = '0 0 var(--carousel-card-width)';
      item.style.margin = '0';
    });

    track.querySelectorAll('img, video').forEach(media => {
      media.setAttribute('draggable', 'false');
      media.addEventListener('dragstart', event => event.preventDefault());
    });

    if (originalItems.length === 1) {
      prev.hidden = true;
      next.hidden = true;
      return;
    }

    const makeClone = item => {
      const clone = item.cloneNode(true);
      clone.dataset.clone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      clone.style.flex = '0 0 var(--carousel-card-width)';
      clone.style.margin = '0';
      clone.querySelectorAll('img, video').forEach(media => {
        media.setAttribute('draggable', 'false');
        media.addEventListener('dragstart', event => event.preventDefault());
      });
      return clone;
    };

    const beforeClones = originalItems.map(makeClone);
    const afterClones = originalItems.map(makeClone);

    beforeClones.forEach(clone => track.insertBefore(clone, originalItems[0]));
    afterClones.forEach(clone => track.appendChild(clone));

    let items = Array.from(track.querySelectorAll('figure'));
    const realCount = originalItems.length;
    let currentIndex = realCount;
    let dragDelta = 0;
    let isDragging = false;
    let hasDragged = false;
    let startX = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let normalizeTimer = 0;

    const getGap = () => parseFloat(getComputedStyle(track).gap || '0');

    const getCardWidth = () => {
      const firstItem = items[0];
      return firstItem ? firstItem.getBoundingClientRect().width : carousel.clientWidth;
    };

    const getStep = () => getCardWidth() + (Number.isFinite(getGap()) ? getGap() : 0);

    const getCenteredTranslate = (index, delta = 0) => {
      const centerOffset = (carousel.clientWidth - getCardWidth()) / 2;
      return centerOffset - index * getStep() + delta;
    };

    const setPosition = ({ animate = false, delta = 0 } = {}) => {
      track.classList.toggle('is-animating', animate);
      track.style.transform = `translate3d(${getCenteredTranslate(currentIndex, delta)}px, 0, 0)`;
    };

    const normalizeIndex = () => {
      window.clearTimeout(normalizeTimer);

      if (currentIndex < realCount) {
        currentIndex += realCount;
        setPosition();
      } else if (currentIndex >= realCount * 2) {
        currentIndex -= realCount;
        setPosition();
      }
    };

    const finishAnimatedMove = () => {
      normalizeTimer = window.setTimeout(normalizeIndex, 680);
    };

    const go = amount => {
      currentIndex += amount;
      dragDelta = 0;
      setPosition({ animate: true });
      finishAnimatedMove();
    };

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));

    track.addEventListener('transitionend', event => {
      if (event.propertyName === 'transform') {
        normalizeIndex();
      }
    });

    track.addEventListener('pointerdown', event => {
      isDragging = true;
      hasDragged = false;
      dragDelta = 0;
      startX = event.clientX;
      lastX = event.clientX;
      lastTime = performance.now();
      velocity = 0;
      track.classList.add('is-dragging');
      track.classList.remove('is-animating');
      track.setPointerCapture(event.pointerId);
    });

    track.addEventListener('pointermove', event => {
      if (!isDragging) {
        return;
      }

      const now = performance.now();
      const elapsed = Math.max(1, now - lastTime);
      dragDelta = event.clientX - startX;
      velocity = (event.clientX - lastX) / elapsed;
      lastX = event.clientX;
      lastTime = now;

      if (Math.abs(dragDelta) > 4) {
        hasDragged = true;
      }

      setPosition({ delta: dragDelta });
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

      const projectedDelta = dragDelta + velocity * 260;
      let slideChange = Math.round(-projectedDelta / getStep());

      if (slideChange === 0 && Math.abs(projectedDelta) > Math.min(120, getStep() * 0.2)) {
        slideChange = projectedDelta < 0 ? 1 : -1;
      }

      slideChange = Math.max(-2, Math.min(2, slideChange));

      currentIndex += slideChange;
      dragDelta = 0;
      setPosition({ animate: true });
      finishAnimatedMove();
    };

    track.addEventListener('pointerup', stopDragging);
    track.addEventListener('pointercancel', stopDragging);
    track.addEventListener('lostpointercapture', () => {
      isDragging = false;
      dragDelta = 0;
      track.classList.remove('is-dragging');
      setPosition({ animate: true });
    });

    track.addEventListener('click', event => {
      if (hasDragged) {
        event.preventDefault();
      }
    });

    window.addEventListener('resize', () => {
      items = Array.from(track.querySelectorAll('figure'));
      setPosition();
    });

    requestAnimationFrame(() => setPosition());
  });
});
