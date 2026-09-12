// sound.js - Web Audio API Synthesizer ding sound for Real-Time Alerts
export function playNotificationSound() {
  try {
    // Avoid autoplay policy console warning before first user interaction
    if (typeof navigator !== 'undefined' && navigator.userActivation && !navigator.userActivation.hasBeenActive) {
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.close().catch(() => {});
      return;
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // High crystal bell frequency for pleasing chime
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08); // E6

    // Envelope
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 700);
  } catch (err) {
    console.warn('Could not play synthesized audio ding:', err);
  }
}
