'use strict';

(() => {
  const section = document.querySelector('#memories');
  if (!section) return;
  const scroller = document.querySelector('#invite');
  const story = section.querySelector('.memories-story');
  const pin = section.querySelector('.memories-pin');
  const photos = [...section.querySelectorAll('.memory-photo')];
  const buttons = [...section.querySelectorAll('[data-memory-index]')];
  const current = section.querySelector('[data-memory-current]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Keep the caption readable instead of slicing two different sentences together.
  const caption = document.createElement('div');
  caption.className = 'memories-caption';
  caption.setAttribute('aria-hidden', 'true');
  section.querySelector('.memory-photos').appendChild(caption);
  let frame = 0;
  let active = -1;
  const clamp = (value) => Math.max(0, Math.min(1, value));

  // Each incoming layer reveals over the previous one; no fading or sliding.
  function wipe(progress, index) {
    const percent = progress * 100;
    if (index % 3 === 1) return `inset(0 ${100 - percent}% 0 0)`;
    if (index % 3 === 2) return `inset(0 0 ${100 - percent}% 0)`;
    if (progress <= 0.5) {
      return `polygon(0 0, ${percent * 2}% 0, 0 ${percent * 2}%)`;
    }
    const edge = (progress * 2 - 1) * 100;
    return `polygon(0 0, 100% 0, 100% ${edge}%, ${edge}% 100%, 0 100%)`;
  }

  function geometry() {
    const top = (Number.parseFloat(getComputedStyle(pin).top) || 0)
      + (Number.parseFloat(getComputedStyle(scroller).paddingTop) || 0);
    return {
      start: story.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - top,
      distance: Math.max(1, story.offsetHeight - pin.offsetHeight)
    };
  }

  function update() {
    frame = 0;
    if (motion.matches) return;
    const { start, distance } = geometry();
    const position = clamp((scroller.scrollTop - start) / distance) * (photos.length - 1);
    photos.forEach((photo, index) => {
      if (index) photo.style.clipPath = wipe(clamp(position - index + 1), index);
    });
    const next = Math.round(position);
    if (next === active) return;
    active = next;
    caption.replaceChildren(...[...photos[next].querySelector('figcaption').children].map((node) => node.cloneNode(true)));
    current.textContent = String(next + 1).padStart(2, '0');
    photos.forEach((photo, index) => { photo.setAttribute('aria-hidden', String(index !== next)); });
    buttons.forEach((button, index) => {
      if (index === next) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }

  function scheduleUpdate() {
    if (!frame && !motion.matches) frame = requestAnimationFrame(update);
  }

  function configureMotion() {
    section.classList.toggle('is-enhanced', !motion.matches);
    active = -1;
    if (motion.matches) {
      photos.forEach((photo) => {
        photo.style.removeProperty('clip-path');
        photo.removeAttribute('aria-hidden');
      });
    } else scheduleUpdate();
  }

  buttons.forEach((button, index) => button.addEventListener('click', () => {
    if (motion.matches) return;
    const { start, distance } = geometry();
    // Keep dot navigation immediate; the wipe itself is controlled by scrolling.
    scroller.scrollTo({ top: start + distance * index / (photos.length - 1), behavior: 'instant' });
    scheduleUpdate();
  }));
  scroller.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  motion.addEventListener('change', configureMotion);
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(scheduleUpdate).observe(story);
  }
  configureMotion();
})();
