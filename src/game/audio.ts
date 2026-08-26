type Tone = { freq: number; dur: number; type?: OscillatorType; gain?: number };

class GameAudio {
  private ctx: AudioContext | null = null;
  muted = false;

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    return this.ctx;
  }

  resume() {
    try {
      const ctx = this.ensure();
      if (ctx.state === "suspended") void ctx.resume();
    } catch {
      /* ignore */
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  play(tones: Tone[]) {
    if (this.muted) return;
    try {
      const ctx = this.ensure();
      const now = ctx.currentTime;
      tones.forEach((tone, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tone.type ?? "square";
        osc.frequency.value = tone.freq;
        const g = tone.gain ?? 0.05;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(g, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        const start = now + i * 0.02;
        osc.start(start);
        osc.stop(start + tone.dur + 0.02);
      });
    } catch {
      /* audio optional */
    }
  }

  ui() {
    this.play([{ freq: 620, dur: 0.06, type: "square", gain: 0.04 }]);
  }

  start() {
    this.play([
      { freq: 220, dur: 0.12, type: "sawtooth", gain: 0.05 },
      { freq: 330, dur: 0.14, type: "sawtooth", gain: 0.05 },
      { freq: 440, dur: 0.18, type: "square", gain: 0.05 },
    ]);
  }

  pickup() {
    this.play([
      { freq: 740, dur: 0.08, type: "square", gain: 0.06 },
      { freq: 980, dur: 0.12, type: "square", gain: 0.05 },
    ]);
  }

  hide() {
    this.play([{ freq: 180, dur: 0.16, type: "triangle", gain: 0.04 }]);
  }

  alert() {
    this.play([
      { freq: 160, dur: 0.1, type: "sawtooth", gain: 0.07 },
      { freq: 90, dur: 0.18, type: "sawtooth", gain: 0.07 },
    ]);
  }

  trap() {
    this.play([{ freq: 90, dur: 0.22, type: "square", gain: 0.06 }]);
  }

  win() {
    this.play([
      { freq: 392, dur: 0.12, type: "square", gain: 0.06 },
      { freq: 494, dur: 0.12, type: "square", gain: 0.06 },
      { freq: 587, dur: 0.22, type: "square", gain: 0.07 },
    ]);
  }

  lose() {
    this.play([
      { freq: 220, dur: 0.16, type: "sawtooth", gain: 0.07 },
      { freq: 165, dur: 0.2, type: "sawtooth", gain: 0.07 },
      { freq: 110, dur: 0.32, type: "triangle", gain: 0.07 },
    ]);
  }
}

export const audio = new GameAudio();
