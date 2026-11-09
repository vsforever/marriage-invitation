'use strict';

const $ = (selector) => document.querySelector(selector);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const invite = $('#invite');
const envelope = $('#envelope');
const rsvp = $('#rsvp');
const envelopeMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const weddingDate = new Date(WEDDING.date);
let entranceTimer = null;

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
};

function buildCountdown() {
  ['Days', 'Hours', 'Mins', 'Secs'].forEach((label) => {
    const unit = el('div', 'cd-unit');
    unit.append(el('b', null, '00'), el('span', null, label));
    $('[data-countdown]').appendChild(unit);
  });
}

function tickCountdown() {
  const diff = Math.max(0, weddingDate - Date.now());
  const values = [Math.floor(diff / 864e5), Math.floor(diff / 36e5) % 24, Math.floor(diff / 6e4) % 60, Math.floor(diff / 1e3) % 60];
  document.querySelectorAll('[data-countdown] b').forEach((node, index) => {
    node.textContent = String(values[index]).padStart(2, '0');
  });
}

function buildEvents() {
  const root = $('#eventList');
  let lastDay = null;
  EVENTS.forEach((event, index) => {
    if (event.day !== lastDay) {
      root.appendChild(el('h3', 'ev-day', event.day));
      lastDay = event.day;
    }
    const item = el('section', 'event');
    const head = el('div', 'event-head');
    const icon = el('span', 'ev-emoji', event.emoji);
    icon.setAttribute('aria-hidden', 'true');
    const title = el('h4', null, event.name);
    title.id = `event-title-${index}`;
    item.setAttribute('aria-labelledby', title.id);
    head.append(icon, title);
    const body = el('div', 'event-body');
    body.append(el('p', null, `🕰️ ${event.time}`), el('p', null, `📍 ${event.venue || WEDDING.address}`));
    if (event.theme) {
      const theme = el('p');
      const dot = el('span', 'swatch');
      dot.style.background = event.theme.hex;
      dot.setAttribute('aria-hidden', 'true');
      theme.append(dot, `Theme colour: ${event.theme.name}`);
      body.appendChild(theme);
    }
    body.appendChild(el('p', null, event.text));
    item.append(head, body);
    root.appendChild(item);
  });
}

// Inert keeps keyboard and screen-reader navigation inside the active screen.
function setActiveView(active) {
  [invite, envelope].forEach((view) => {
    view.inert = view !== active;
  });
  if (typeof syncInvitationPetals === 'function') syncInvitationPetals();
}

function clearEntranceEffects() {
  clearTimeout(entranceTimer);
  entranceTimer = null;
  envelope.classList.remove('opening');
  envelope.removeAttribute('aria-busy');
  invite.classList.remove('entering');
  $('#inviteMagic').hidden = true;
  if (typeof clearEnvelopeCelebration === 'function') clearEnvelopeCelebration();
}

function revealInvite(animate = false) {
  envelope.classList.remove('show', 'opening');
  envelope.removeAttribute('aria-busy');
  invite.classList.toggle('entering', animate);
  $('#inviteMagic').hidden = !animate || envelopeMotion.matches;
  invite.scrollTop = 0;
  setActiveView(invite);
  $('#inviteTitle').focus({ preventScroll: true });
}

function openInvite() {
  clearEntranceEffects();
  revealInvite();
}

function openEnvelope() {
  clearEntranceEffects();
  envelope.classList.add('show');
  setActiveView(envelope);
  $('#envSeal').focus({ preventScroll: true });
}

function breakSeal() {
  if (envelope.inert || !envelope.classList.contains('show') || entranceTimer !== null) return;
  // Begin the fade inside the tap, without waiting for the visual reveal.
  playWeddingMusic({ fadeIn: true });
  if (envelopeMotion.matches) { openInvite(); return; }
  clearEntranceEffects();
  envelope.classList.add('opening');
  envelope.setAttribute('aria-busy', 'true');
  if (typeof envelopePopperShower === 'function') envelopePopperShower();
  entranceTimer = setTimeout(() => {
    entranceTimer = null;
    // Keep the existing poppers alive as the card starts its descent.
    revealInvite(true);
  }, 600);
}

invite.addEventListener('animationend', (event) => {
  if (event.animationName === 'invitationDrop') invite.classList.remove('entering');
});
$('#inviteMagic').addEventListener('animationend', (event) => {
  if (event.animationName === 'magicSpiral') $('#inviteMagic').hidden = true;
});
envelopeMotion.addEventListener('change', (event) => {
  if (!event.matches) return;
  const pendingEntrance = entranceTimer !== null;
  clearEntranceEffects();
  if (pendingEntrance) revealInvite();
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  if (entranceTimer !== null) openInvite();
  else clearEntranceEffects();
});

$('#envSeal').addEventListener('click', (event) => { event.stopPropagation(); breakSeal(); });
$('#envBody').addEventListener('click', breakSeal);
$('#envWelcome').addEventListener('click', breakSeal);
$('#envSkip').addEventListener('click', () => { playWeddingMusic({ fadeIn: true }); openInvite(); });
$('#inviteClose').addEventListener('click', openEnvelope);
invite.addEventListener('click', (event) => { if (event.target === invite) openEnvelope(); });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (envelope.classList.contains('show')) openInvite();
    else if (!event.target.closest('#rsvp')) openEnvelope();
  }
  if (event.key !== 'Tab') return;
  const modal = envelope.classList.contains('show') ? envelope : null;
  if (!modal) return;
  const controls = [...modal.querySelectorAll('button, input, [tabindex="0"]')]
    .filter((node) => !node.disabled && node.tabIndex >= 0 && !node.closest('[inert]') && getComputedStyle(node).visibility !== 'hidden' && node.getClientRects().length);
  if (modal === envelope) controls.push($('#mute'));
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

$('[data-wedding-address]').textContent = WEDDING.address;
buildEvents();
buildCountdown();
tickCountdown();
setInterval(tickCountdown, 1000);
openEnvelope();
