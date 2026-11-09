'use strict';

const musicVolume = 0.65;
const weddingAudio = new Audio(WEDDING_MUSIC);
weddingAudio.loop = true;
weddingAudio.preload = 'none';
weddingAudio.volume = musicVolume;
let musicMuted = false;
let musicFadeFrame = 0;
let musicPlayId = 0;
try { musicMuted = localStorage.getItem('wedding-invitation-muted') === 'true'; } catch (_) { /* storage blocked */ }
weddingAudio.muted = musicMuted;

function updateMusicButton() {
  const playing = !weddingAudio.paused && !weddingAudio.muted;
  $('#mute').textContent = playing ? '🔊' : '🔇';
  $('#mute').setAttribute('aria-label', playing ? 'Mute music' : 'Play music');
  $('#mute').setAttribute('aria-pressed', String(playing));
}

function stopMusicFade() {
  cancelAnimationFrame(musicFadeFrame);
  musicFadeFrame = 0;
}

function finishMusicFade() {
  if (!musicFadeFrame) return;
  stopMusicFade();
  if (!musicMuted && !weddingAudio.paused) weddingAudio.volume = musicVolume;
}

function fadeMusicIn(start, duration) {
  function step(now) {
    if (musicMuted || weddingAudio.paused) { stopMusicFade(); return; }
    const progress = Math.max(0, Math.min(1, (now - start) / duration));
    weddingAudio.volume = musicVolume * progress * progress * (3 - 2 * progress);
    musicFadeFrame = progress < 1 ? requestAnimationFrame(step) : 0;
  }
  // Buffered playback may start later; catch up rather than extending the reveal.
  step(performance.now());
}

async function playWeddingMusic({ fadeIn = false, fadeDuration = 2400 } = {}) {
  if (musicMuted || !weddingAudio.paused) return;
  const playId = ++musicPlayId;
  const startedAt = performance.now();
  stopMusicFade();
  weddingAudio.volume = fadeIn ? 0 : musicVolume;
  try {
    // Calling play synchronously preserves the tap's autoplay permission.
    await weddingAudio.play();
    if (playId !== musicPlayId || musicMuted) return;
    if (fadeIn) fadeMusicIn(startedAt, fadeDuration);
  } catch (_) {
    // Missing audio or autoplay restrictions must never block the invitation.
    if (playId === musicPlayId) weddingAudio.volume = musicVolume;
  }
  updateMusicButton();
}

$('#mute').addEventListener('click', () => {
  musicMuted = !weddingAudio.paused && !weddingAudio.muted;
  weddingAudio.muted = musicMuted;
  ++musicPlayId;
  stopMusicFade();
  weddingAudio.volume = musicVolume;
  try { localStorage.setItem('wedding-invitation-muted', String(musicMuted)); } catch (_) { /* storage blocked */ }
  if (!musicMuted) playWeddingMusic();
  updateMusicButton();
});
weddingAudio.addEventListener('play', updateMusicButton);
weddingAudio.addEventListener('pause', () => {
  ++musicPlayId;
  stopMusicFade();
  weddingAudio.volume = musicVolume;
  updateMusicButton();
});
weddingAudio.addEventListener('error', () => {
  stopMusicFade();
  weddingAudio.volume = musicVolume;
  updateMusicButton();
});
updateMusicButton();
