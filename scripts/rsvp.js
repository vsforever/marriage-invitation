'use strict';

const rsvpForm = $('#rsvpForm');
const rsvpGuests = $('#rsvpGuests');
const rsvpWishes = $('#rsvpWishes');
const rsvpError = $('#rsvpError');
const RSVP_SENT_KEY = 'wedding-invitation-rsvp-sent';
const clampGuests = (value) => Math.min(20, Math.max(1, Number.parseInt(value, 10) || 1));
let rsvpPending = false;

function showRsvpStep(step) {
  rsvp.querySelectorAll('[data-rsvp-step]').forEach((node) => { node.hidden = node.dataset.rsvpStep !== step; });
}

// Each response is appended to the guest list, rather than updating an earlier one.
function markRsvpSent() {
  $('#rsvpStatus').textContent = 'We’ve received a response from this device. A new reply will be added as a separate response.';
}
try { if (localStorage.getItem(RSVP_SENT_KEY)) markRsvpSent(); } catch (_) { /* storage blocked */ }

rsvp.querySelectorAll('.rsvp-step').forEach((button) => button.addEventListener('click', () => {
  rsvpGuests.value = clampGuests(clampGuests(rsvpGuests.value) + Number(button.dataset.step));
}));
rsvpGuests.addEventListener('change', () => { rsvpGuests.value = clampGuests(rsvpGuests.value); });

rsvpForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (rsvpPending) return;
  const name = $('#rsvpName').value.trim().replace(/\s+/g, ' ');
  const guests = Number(rsvpGuests.value);
  const wishes = rsvpWishes.value.trim();
  rsvpError.textContent = '';
  if (!name || name.length > 80) {
    rsvpError.textContent = 'Please share your name with us (up to 80 characters).';
    $('#rsvpName').focus();
    return;
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
    rsvpError.textContent = 'Please let us know your party size, from 1 to 20 guests, including yourself.';
    rsvpGuests.focus();
    return;
  }
  if (wishes.length > 2000) {
    rsvpError.textContent = 'Please keep your lovely message within 2,000 characters.';
    rsvpWishes.focus();
    return;
  }
  if (!RSVP_ENDPOINT) {
    rsvpError.textContent = 'Online replies aren’t connected yet. Please share your confirmation with Vivek directly.';
    return;
  }

  const submit = $('#rsvpSubmit');
  rsvpPending = true;
  submit.disabled = true;
  submit.textContent = 'Sending your reply…';
  rsvpForm.setAttribute('aria-busy', 'true');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const body = new URLSearchParams({ name, guests: String(guests), wishes, website: rsvpForm.elements.website.value });
    const response = await fetch(RSVP_ENDPOINT, { method: 'POST', body, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'rejected');
    try { localStorage.setItem(RSVP_SENT_KEY, '1'); } catch (_) { /* storage blocked */ }
    markRsvpSent();
    $('#rsvpThanks').textContent = `We can’t wait to celebrate with you, ${name.split(' ')[0]}! Your reply for ${guests} ${guests === 1 ? 'guest' : 'guests'} has been received. 💛`;
    showRsvpStep('thanks');
    miniConfetti({ y: 0.5 });
    $('#rsvpThanksTitle').focus();
  } catch (error) {
    console.error('RSVP failed', error);
    rsvpError.textContent = 'Your reply couldn’t reach us just yet. Please check your connection and try again.';
  } finally {
    clearTimeout(timeout);
    rsvpPending = false;
    submit.disabled = false;
    submit.textContent = 'Count us in 💗';
    rsvpForm.removeAttribute('aria-busy');
  }
});
$('#rsvpAnother').addEventListener('click', () => {
  rsvpForm.reset();
  rsvpError.textContent = '';
  showRsvpStep('form');
  $('#rsvpName').focus();
});
