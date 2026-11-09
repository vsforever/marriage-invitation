'use strict';

const palette = ['#FFB6CE', '#FF8FB8', '#E0457B', '#C72A5E', '#FFE38A', '#FFD24D', '#B9A3F2', '#F1E8FF'];

function heartsFallback() {
  for (let i = 0; i < 40; i++) {
    const h = document.createElement('span');
    h.className = 'float-heart';
    h.textContent = ['💗', '💜', '🌹', '💍', '🌸'][i % 5];
    h.style.setProperty('--x', `${Math.random() * 100}vw`);
    h.style.setProperty('--size', `${18 + Math.random() * 22}px`);
    h.style.setProperty('--dur', `${3 + Math.random() * 3}s`);
    h.style.setProperty('--drift', `${(Math.random() - 0.5) * 30}vw`);
    h.style.setProperty('--rot', `${(Math.random() - 0.5) * 360}deg`);
    h.style.animationDelay = `${Math.random() * 1.5}s`;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 8000);
  }
}

function miniConfetti(origin = { y: 0.6 }) {
  if (reduceMotion) return;
  if (typeof window.confetti !== 'function') { heartsFallback(); return; }
  confetti({ colors: palette, disableForReducedMotion: true, zIndex: 1100, particleCount: 100, spread: 80, startVelocity: 40, origin });
}

const celebrationColors = ['rose', 'white', 'sage', 'white', 'blush', 'maroon'];

function clearEnvelopeCelebration() {
  $('#envelopePoppers').replaceChildren();
}

function envelopePopperShower() {
  if (envelopeMotion.matches) return;
  clearEnvelopeCelebration();
  const pieces = document.createDocumentFragment();
  for (let index = 0; index < 64; index++) {
    const side = index % 2 ? -1 : 1;
    const color = celebrationColors[index % celebrationColors.length];
    const piece = el('span', `env-petal popper-petal petal--${color}${index % 4 === 0 ? 'popper-ribbon' : ''}`);
    piece.style.left = side === 1 ? '5%' : '95%';
    piece.style.setProperty('--petal-size', `${7 + Math.random() * 10}px`);
    piece.style.setProperty('--burst-x', `${side * (70 + Math.random() * innerWidth * .65)}px`);
    piece.style.setProperty('--burst-lift', `${-innerHeight * (.3 + Math.random() * .4)}px`);
    piece.style.setProperty('--burst-fall', `${innerHeight * .3}px`);
    piece.style.setProperty('--petal-turn', `${side * (240 + Math.random() * 480)}deg`);
    piece.style.setProperty('--burst-duration', `${1100 + Math.random() * 300}ms`);
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
    pieces.appendChild(piece);
  }
  $('#envelopePoppers').appendChild(pieces);
}

function syncInvitationPetals() {
  const rain = $('#invitationPetals');
  const active = !invite.inert && !document.hidden && !envelopeMotion.matches;
  rain.hidden = !active;
  if (!active) { rain.replaceChildren(); return; }
  if (rain.childElementCount) return;
  const petals = document.createDocumentFragment();
  const roseShades = ['rose', 'blush', 'maroon', 'blush'];
  for (let index = 0; index < 28; index++) {
    const petal = el('span', `env-petal rain-petal petal--${roseShades[index % roseShades.length]}`);
    petal.style.left = `${(index * 43.7) % 100}%`;
    petal.style.setProperty('--petal-size', `${9 + index % 5 * 2}px`);
    petal.style.setProperty('--petal-drift', `${(index % 2 ? 1 : -1) * (20 + index % 4 * 15)}px`);
    petal.style.setProperty('--petal-turn', `${(index % 2 ? 1 : -1) * (160 + index * 17)}deg`);
    petal.style.animationDuration = `${7 + index % 5}s`;
    petal.style.animationDelay = `${-index * 1.73}s`;
    petals.appendChild(petal);
  }
  rain.appendChild(petals);
}

envelopeMotion.addEventListener('change', syncInvitationPetals);
document.addEventListener('visibilitychange', () => {
  syncInvitationPetals();
  if (document.hidden) clearEnvelopeCelebration();
});
syncInvitationPetals();
