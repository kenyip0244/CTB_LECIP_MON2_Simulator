/**
 * CTB LECIP MON2 SIMULATOR - AUDIO SYSTEM
 * Features:
 * 1. Web Audio API synthesized iconic 2-tone "Ding-Dong" chime (叮噹報站提示音)
 * 2. Web Speech API bilingual Cantonese (zh-HK) and English (en) stop announcements
 */

class Mon2AudioSystem {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
    this.speechEnabled = false; // TTS disabled per user request
    this.volume = 0.7;
    this.synth = window.speechSynthesis || null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  playChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // First Tone (Ding) ~ 830 Hz (Ab5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(830, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.35 * this.volume, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Second Tone (Dong) ~ 622 Hz (Eb5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(622, now + 0.35);

    gain2.gain.setValueAtTime(0.001, now + 0.35);
    gain2.gain.exponentialRampToValueAtTime(0.4 * this.volume, now + 0.38);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.35);
    osc2.stop(now + 1.0);
  }

  speakAnnouncement(stop, status = "next") {
    // TTS completely removed per user request ("刪除tts")
  }
}


