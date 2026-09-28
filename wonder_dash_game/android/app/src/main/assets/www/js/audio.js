/**
 * Wonder Dash: Magic World - Procedural Web Audio Synthesizer Engine
 * 100% Original, royalty-free, zero-dependency audio generator.
 * Provides custom music themes for all 8 worlds + comprehensive SFX.
 */

class WonderAudioEngine {
  constructor() {
    this.ctx = null;
    this.bgmNode = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    
    this.isMuted = false;
    this.bgmVolume = 0.5;
    this.sfxVolume = 0.8;
    this.currentWorldId = null;
    this.isPlayingBgm = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    
    this.initFromStorage();
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initFromStorage() {
    try {
      const saved = localStorage.getItem("wonder_dash_audio_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.isMuted = !!parsed.isMuted;
        if (typeof parsed.bgmVolume === "number") this.bgmVolume = parsed.bgmVolume;
        if (typeof parsed.sfxVolume === "number") this.sfxVolume = parsed.sfxVolume;
      }
    } catch (e) {
      console.warn("Audio settings load error", e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem("wonder_dash_audio_settings", JSON.stringify({
        isMuted: this.isMuted,
        bgmVolume: this.bgmVolume,
        sfxVolume: this.sfxVolume
      }));
    } catch (e) {}
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  // Helper note frequency converter
  noteToFreq(note) {
    const notes = {
      "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "G3": 196.00, "A3": 220.00, "B3": 246.94,
      "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00, "A4": 440.00, "B4": 493.88,
      "C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46, "G5": 783.99, "A5": 880.00, "B5": 987.77,
      "C6": 1046.50, "D6": 1174.66, "E6": 1318.51, "G6": 1567.98
    };
    return notes[note] || 440;
  }

  // ----------------------------------------------------
  // SOUND EFFECTS (SFX)
  // ----------------------------------------------------

  playJump() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playSlide() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // White noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.25);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  playCoin() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "triangle";
    osc2.type = "sine";

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.05); // E6

    osc2.frequency.setValueAtTime(1975.53, now); // B6
    osc2.frequency.setValueAtTime(2637.02, now + 0.05); // E7

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.16);
    osc2.stop(now + 0.16);
  }

  playGem() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major crystal arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.035);

      gain.gain.setValueAtTime(0.25, now + idx * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.035);
      osc.stop(now + idx * 0.035 + 0.3);
    });
  }

  playPowerup() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2500, now);

      gain.gain.setValueAtTime(0.2, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.25);
    });
  }

  playShieldBreak() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playHit() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  playGameOver() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const chords = [
      [349.23, 440.00, 523.25], // F major
      [329.63, 392.00, 493.88], // E min
      [293.66, 349.23, 440.00], // D min
      [261.63, 329.63, 392.00]  // C maj
    ];

    chords.forEach((chord, i) => {
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.22);

        gain.gain.setValueAtTime(0.18, now + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.22 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + i * 0.22);
        osc.stop(now + i * 0.22 + 0.35);
      });
    });
  }

  playButtonClick() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playPurchase() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.3, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.3);
    });
  }

  playChestOpen() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Mystical fan-out
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.22, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.4);
    });
  }

  playLevelUp() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Triumphant rising fanfare & stardust chords
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = (idx >= notes.length - 2) ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.28, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.55);
    });
  }

  playClaim() {
    this.playChestOpen();
  }

  // ----------------------------------------------------
  // PROCEDURAL BACKGROUND MUSIC GENERATOR
  // ----------------------------------------------------

  playMusicForWorld(worldId) {
    this.initContext();
    if (this.currentWorldId === worldId && this.isPlayingBgm) return;
    this.stopMusic();
    this.currentWorldId = worldId;
    this.isPlayingBgm = true;
    this.bgmStep = 0;

    const musicThemes = {
      menu: {
        tempo: 125,
        bass: ["C3", "G3", "A3", "F3"],
        melody: ["C4", "E4", "G4", "A4", "G4", "E4", "D4", "C4", "E4", "G4", "C5", "B4", "A4", "G4", "E4", "D4"],
        waveType: "triangle"
      },
      enchanted_forest: {
        tempo: 130,
        bass: ["A3", "F3", "C3", "G3"],
        melody: ["A4", "C5", "E5", "D5", "C5", "A4", "G4", "E4", "A4", "C5", "E5", "G5", "F5", "E5", "D5", "C5"],
        waveType: "sine"
      },
      rainbow_valley: {
        tempo: 140,
        bass: ["C3", "E3", "F3", "G3"],
        melody: ["C5", "D5", "E5", "G5", "A5", "G5", "E5", "D5", "C5", "E5", "G5", "C6", "A5", "G5", "E5", "D5"],
        waveType: "triangle"
      },
      candy_kingdom: {
        tempo: 135,
        bass: ["F3", "C3", "G3", "A3"],
        melody: ["F4", "A4", "C5", "F5", "E5", "C5", "A4", "G4", "A4", "C5", "E5", "D5", "C5", "A4", "F4", "G4"],
        waveType: "sine"
      },
      dinosaur_island: {
        tempo: 128,
        bass: ["D3", "D3", "G3", "A3"],
        melody: ["D4", "F4", "A4", "D5", "C5", "A4", "F4", "E4", "D4", "F4", "G4", "A4", "D5", "C5", "A4", "F4"],
        waveType: "sawtooth"
      },
      ocean_adventure: {
        tempo: 120,
        bass: ["C3", "A3", "F3", "G3"],
        melody: ["E4", "G4", "B4", "C5", "E5", "D5", "B4", "G4", "A4", "C5", "E5", "G5", "E5", "C5", "B4", "A4"],
        waveType: "sine"
      },
      space_adventure: {
        tempo: 138,
        bass: ["A3", "F3", "D3", "E3"],
        melody: ["A4", "E5", "D5", "C5", "B4", "C5", "D5", "E5", "A4", "C5", "E5", "A5", "G5", "E5", "D5", "B4"],
        waveType: "square"
      },
      crystal_mountains: {
        tempo: 132,
        bass: ["E3", "C3", "G3", "B3"],
        melody: ["B4", "E5", "G5", "B5", "A5", "G5", "E5", "D5", "E5", "G5", "B5", "D6", "C6", "B5", "A5", "G5"],
        waveType: "triangle"
      },
      magical_sky_kingdom: {
        tempo: 142,
        bass: ["C3", "G3", "A3", "F3"],
        melody: ["C5", "G5", "E5", "C5", "D5", "A5", "F5", "D5", "E5", "B5", "G5", "E5", "C6", "B5", "A5", "G5"],
        waveType: "triangle"
      }
    };

    const currentTheme = musicThemes[worldId] || musicThemes.menu;
    const beatInterval = (60 / currentTheme.tempo) / 2; // 8th note interval in seconds

    const playLoopStep = () => {
      if (!this.isPlayingBgm || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Play Bass Note (every 4 steps)
      if (this.bgmStep % 4 === 0) {
        const bassIndex = Math.floor(this.bgmStep / 4) % currentTheme.bass.length;
        const bassNote = currentTheme.bass[bassIndex];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = "sine";
        bassOsc.frequency.setValueAtTime(this.noteToFreq(bassNote), now);

        bassGain.gain.setValueAtTime(0.22, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + beatInterval * 3.8);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + beatInterval * 3.8);
      }

      // Play Melody Arpeggio Note
      const melIndex = this.bgmStep % currentTheme.melody.length;
      const melNote = currentTheme.melody[melIndex];
      const melOsc = this.ctx.createOscillator();
      const melGain = this.ctx.createGain();

      melOsc.type = currentTheme.waveType;
      melOsc.frequency.setValueAtTime(this.noteToFreq(melNote), now);

      melGain.gain.setValueAtTime(0.12, now);
      melGain.gain.exponentialRampToValueAtTime(0.001, now + beatInterval * 0.9);

      melOsc.connect(melGain);
      melGain.connect(this.bgmGain);

      melOsc.start(now);
      melOsc.stop(now + beatInterval * 0.95);

      this.bgmStep++;
      this.bgmTimer = setTimeout(playLoopStep, beatInterval * 1000);
    };

    playLoopStep();
  }

  stopMusic() {
    this.isPlayingBgm = false;
    this.currentWorldId = null;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// Global instance
window.WonderAudio = new WonderAudioEngine();
