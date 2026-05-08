document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');

    if (!track || !prev || !next) {
      return;
    }

    const originalItems = Array.from(track.querySelectorAll('figure'));

    if (originalItems.length === 0) {
      return;
    }

    const applyCarouselStyles = () => {
      carousel.style.setProperty('--carousel-card-width', 'clamp(540px, 31vw, 680px)');
      carousel.style.setProperty('--carousel-gap', '20px');
      carousel.style.position = 'relative';
      carousel.style.left = '50%';
      carousel.style.width = '100vw';
      carousel.style.marginLeft = '-50vw';
      carousel.style.marginRight = '-50vw';
      carousel.style.overflow = 'hidden';

      track.style.display = 'flex';
      track.style.gap = 'var(--carousel-gap)';
      track.style.width = 'max-content';
      track.style.margin = '0';
      track.style.padding = '0 0 18px';
      track.style.overflow = 'visible';
      track.style.overflowX = 'visible';
      track.style.scrollSnapType = 'none';
      track.style.scrollBehavior = 'auto';
      track.style.transition = 'none';
      track.style.willChange = 'transform';
      track.style.cursor = 'grab';
      track.style.userSelect = 'none';
      track.style.webkitUserSelect = 'none';
      track.style.touchAction = 'pan-y';
    };

    const applyItemStyles = item => {
      item.style.flex = '0 0 var(--carousel-card-width)';
      item.style.margin = '0';
      item.style.scrollSnapAlign = 'none';

      item.querySelectorAll('img, video').forEach(media => {
        media.setAttribute('draggable', 'false');
        media.style.pointerEvents = 'none';
        media.style.userSelect = 'none';
        media.style.webkitUserDrag = 'none';
        media.addEventListener('dragstart', event => event.preventDefault());
      });
    };

    applyCarouselStyles();
    originalItems.forEach(applyItemStyles);

    if (originalItems.length === 1) {
      prev.hidden = true;
      next.hidden = true;
      return;
    }

    const makeClone = item => {
      const clone = item.cloneNode(true);
      clone.dataset.clone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      applyItemStyles(clone);
      return clone;
    };

    const beforeClones = originalItems.map(makeClone);
    const afterClones = originalItems.map(makeClone);

    beforeClones.forEach(clone => track.insertBefore(clone, originalItems[0]));
    afterClones.forEach(clone => track.appendChild(clone));

    let items = Array.from(track.querySelectorAll('figure'));
    const realCount = originalItems.length;
    let currentIndex = realCount;
    let cardWidth = 0;
    let gap = 0;
    let step = 0;
    let centerOffset = 0;
    let currentTranslate = 0;
    let targetTranslate = 0;
    let animationFrame = 0;
    let isDragging = false;
    let hasDragged = false;
    let startX = 0;
    let startTranslate = 0;
    let dragDelta = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;

    const easeOutCubic = progress => 1 - Math.pow(1 - progress, 3);

    const translateForIndex = index => centerOffset - index * step;

    const render = value => {
      currentTranslate = value;
      track.scrollLeft = 0;
      track.style.transform = `translate3d(${value}px, 0, 0)`;
    };

    const measure = () => {
      applyCarouselStyles();
      items = Array.from(track.querySelectorAll('figure'));
      items.forEach(applyItemStyles);

      cardWidth = items[0].getBoundingClientRect().width;
      gap = parseFloat(getComputedStyle(track).gap) || 0;
      step = cardWidth + gap;
      centerOffset = (window.innerWidth - cardWidth) / 2;
      targetTranslate = translateForIndex(currentIndex);
      render(targetTranslate);
    };

    const normalizeIndex = () => {
      if (currentIndex < realCount) {
        currentIndex += realCount;
        render(translateForIndex(currentIndex));
      } else if (currentIndex >= realCount * 2) {
        currentIndex -= realCount;
        render(translateForIndex(currentIndex));
      }
    };

    const stopAnimation = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const animateToIndex = (index, duration = 620) => {
      stopAnimation();
      currentIndex = index;
      targetTranslate = translateForIndex(currentIndex);

      const from = currentTranslate;
      const distance = targetTranslate - from;
      const startedAt = performance.now();

      const tick = now => {
        const progress = Math.min(1, (now - startedAt) / duration);
        render(from + distance * easeOutCubic(progress));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(tick);
          return;
        }

        animationFrame = 0;
        render(targetTranslate);
        normalizeIndex();
      };

      animationFrame = requestAnimationFrame(tick);
    };

    const go = amount => {
      animateToIndex(currentIndex + amount);
    };

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));

    track.addEventListener('pointerdown', event => {
      stopAnimation();
      normalizeIndex();

      isDragging = true;
      hasDragged = false;
      dragDelta = 0;
      startX = event.clientX;
      startTranslate = currentTranslate;
      lastX = event.clientX;
      lastTime = performance.now();
      velocity = 0;
      track.classList.add('is-dragging');
      track.style.cursor = 'grabbing';
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

      render(startTranslate + dragDelta);
    });

    const stopDragging = event => {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      track.classList.remove('is-dragging');
      track.style.cursor = 'grab';

      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }

      const projectedDelta = dragDelta + velocity * 320;
      let slideChange = Math.round(-projectedDelta / step);

      if (slideChange === 0 && Math.abs(projectedDelta) > Math.min(120, step * 0.18)) {
        slideChange = projectedDelta < 0 ? 1 : -1;
      }

      slideChange = Math.max(-2, Math.min(2, slideChange));
      animateToIndex(currentIndex + slideChange);
    };

    track.addEventListener('pointerup', stopDragging);
    track.addEventListener('pointercancel', stopDragging);
    track.addEventListener('lostpointercapture', () => {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      track.classList.remove('is-dragging');
      track.style.cursor = 'grab';
      animateToIndex(currentIndex);
    });

    track.addEventListener('click', event => {
      if (hasDragged) {
        event.preventDefault();
      }
    });

    window.addEventListener('resize', measure);

    requestAnimationFrame(measure);
  });
});
