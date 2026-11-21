/*
 * Upbeat generative chill-pop for the sky village, made with Web Audio (no
 * files): a swung drum groove, a bouncy bass line, offbeat chord stabs, a
 * sparkly arpeggio, and a catchy lead motif that repeats with variations.
 * Everything is synthesised and scheduled on a 16th-note grid.
 *
 * Browsers only allow audio after a user gesture, so `start()` must be
 * called from a click/tap handler (or after one has happened).
 */

type Nodes = {
  ctx: AudioContext;
  master: GainNode;
  stop: () => void;
};

const MASTER = 0.55;
const BPM = 98;
const STEP = 60 / BPM / 4; // one 16th note
const SWING = 0.14; // push every off-16th a little late for groove

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

/** I - V - vi - IV in D major, one bar each: bright and singable. */
const CHORDS = [
  { root: 38, tones: [62, 66, 69, 73] }, // Dmaj7
  { root: 45, tones: [61, 64, 69, 71] }, // A(add9)
  { root: 47, tones: [62, 66, 69, 71] }, // Bm7
  { root: 43, tones: [62, 67, 71, 74] }, // Gmaj
];

/** D major pentatonic for the lead. */
const SCALE = [74, 76, 78, 81, 83, 86, 88, 90];

/** Drum patterns over 16 steps. */
const KICK = [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0];
const SNARE = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
const HAT = [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1];
/** Bass rhythm (scale-degree offsets from the root, null = rest). */
const BASS: (number | null)[] = [0, null, null, 12, null, null, 0, null, 0, null, 7, null, null, 12, null, 7];
/** Chord stabs on the offbeats. */
const STAB = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];

function noiseBuffer(ctx: AudioContext) {
  const len = ctx.sampleRate;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function impulse(ctx: AudioContext, seconds = 1.8) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
  }
  return buf;
}

/** A 2-bar lead motif: 32 steps, each either a scale index or null. */
function makeMotif(): (number | null)[] {
  const rhythm = [0, 3, 6, 8, 10, 14, 16, 19, 22, 24, 26, 28];
  const out: (number | null)[] = Array(32).fill(null);
  let pos = 2 + Math.floor(Math.random() * 2);
  for (const s of rhythm) {
    if (Math.random() < 0.22) continue;
    pos = Math.max(0, Math.min(SCALE.length - 1, pos + [-2, -1, 1, 1, 2, 0][Math.floor(Math.random() * 6)]));
    out[s] = pos;
  }
  return out;
}

function vary(m: (number | null)[]) {
  return m.map((n, i) => (n === null || i < 16 ? n : Math.random() < 0.35 ? Math.max(0, Math.min(SCALE.length - 1, n + (Math.random() < 0.5 ? -1 : 1))) : n));
}

function build(): Nodes {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const noise = noiseBuffer(ctx);

  const master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  comp.attack.value = 0.005;
  comp.release.value = 0.15;
  master.connect(comp).connect(ctx.destination);

  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx);
  const reverbOut = ctx.createGain();
  reverbOut.gain.value = 0.3;
  reverb.connect(reverbOut).connect(master);

  const delay = ctx.createDelay(1);
  delay.delayTime.value = STEP * 3; // dotted-8th echo
  const fb = ctx.createGain();
  fb.gain.value = 0.3;
  const delayTone = ctx.createBiquadFilter();
  delayTone.type = "lowpass";
  delayTone.frequency.value = 3000;
  delay.connect(delayTone).connect(fb).connect(delay);
  const delayOut = ctx.createGain();
  delayOut.gain.value = 0.3;
  delayTone.connect(delayOut).connect(master);

  const bus = (gain: number, toReverb = 0, toDelay = 0) => {
    const g = ctx.createGain();
    g.gain.value = gain;
    g.connect(master);
    if (toReverb) {
      const s = ctx.createGain();
      s.gain.value = toReverb;
      g.connect(s).connect(reverb);
    }
    if (toDelay) {
      const s = ctx.createGain();
      s.gain.value = toDelay;
      g.connect(s).connect(delay);
    }
    return g;
  };
  const drums = bus(0.9, 0.08);
  const bassBus = bus(0.5);
  // chords and arp duck under the kick for a gentle pumping feel
  const duck = ctx.createGain();
  duck.connect(master);
  const chordBus = ctx.createGain();
  chordBus.gain.value = 0.3;
  chordBus.connect(duck);
  const chordVerb = ctx.createGain();
  chordVerb.gain.value = 0.5;
  chordBus.connect(chordVerb).connect(reverb);
  const arpBus = bus(0.16, 0.4, 0.6);
  const leadBus = bus(0.24, 0.35, 0.5);

  // ---------------- instruments
  const kick = (at: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(140, at);
    o.frequency.exponentialRampToValueAtTime(45, at + 0.12);
    g.gain.setValueAtTime(1, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.38);
    o.connect(g).connect(drums);
    o.start(at);
    o.stop(at + 0.4);
    duck.gain.setValueAtTime(0.45, at);
    duck.gain.linearRampToValueAtTime(1, at + 0.22);
  };

  const snare = (at: number, vel = 1) => {
    const n = ctx.createBufferSource();
    n.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 2000;
    f.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.55 * vel, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.2);
    n.connect(f).connect(g).connect(drums);
    n.start(at, Math.random() * 0.5);
    n.stop(at + 0.22);
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.frequency.setValueAtTime(220, at);
    o.frequency.exponentialRampToValueAtTime(160, at + 0.08);
    og.gain.setValueAtTime(0.35 * vel, at);
    og.gain.exponentialRampToValueAtTime(0.001, at + 0.1);
    o.connect(og).connect(drums);
    o.start(at);
    o.stop(at + 0.12);
  };

  const hat = (at: number, vel: number, open = false) => {
    const n = ctx.createBufferSource();
    n.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 7500;
    const g = ctx.createGain();
    const len = open ? 0.18 : 0.045;
    g.gain.setValueAtTime(0.22 * vel, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + len);
    n.connect(f).connect(g).connect(drums);
    n.start(at, Math.random() * 0.5);
    n.stop(at + len + 0.02);
  };

  const bassNote = (note: number, at: number, len: number) => {
    const o = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = "sawtooth";
    sub.type = "sine";
    o.frequency.value = midi(note);
    sub.frequency.value = midi(note);
    f.type = "lowpass";
    f.Q.value = 6;
    f.frequency.setValueAtTime(900, at);
    f.frequency.exponentialRampToValueAtTime(220, at + len);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.5, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(f);
    sub.connect(f);
    f.connect(g).connect(bassBus);
    o.start(at);
    sub.start(at);
    o.stop(at + len + 0.05);
    sub.stop(at + len + 0.05);
  };

  /** Electric-piano-ish stab: detuned triangles through a closing filter. */
  const stab = (tones: number[], at: number) => {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(2600, at);
    f.frequency.exponentialRampToValueAtTime(700, at + 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.32, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.42);
    f.connect(g).connect(chordBus);
    for (const n of tones) {
      for (const d of [-7, 7]) {
        const o = ctx.createOscillator();
        o.type = "triangle";
        o.frequency.value = midi(n);
        o.detune.value = d;
        o.connect(f);
        o.start(at);
        o.stop(at + 0.45);
      }
    }
  };

  /** Bright pluck for the arpeggio and lead. */
  const pluck = (note: number, at: number, vel: number, out: GainNode, len = 0.5) => {
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o.type = "square";
    o2.type = "sine";
    o.frequency.value = midi(note);
    o2.frequency.value = midi(note + 12);
    f.type = "lowpass";
    f.frequency.setValueAtTime(4200, at);
    f.frequency.exponentialRampToValueAtTime(900, at + len);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.4 * vel, at + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(f);
    o2.connect(f);
    f.connect(g).connect(out);
    o.start(at);
    o2.start(at);
    o.stop(at + len + 0.05);
    o2.stop(at + len + 0.05);
  };

  // ---------------- arrangement + scheduler
  let step = 0; // 16ths since start
  let next = ctx.currentTime + 0.15;
  let motif = makeMotif();
  let current = motif;

  const scheduleStep = (t: number) => {
    const s = step % 16;
    const bar = Math.floor(step / 16);
    const section = bar % 16; // 16-bar cycle
    const intro = bar < 2;
    const breakdown = section >= 12 && section < 14; // drums thin out for 2 bars
    const chord = CHORDS[bar % CHORDS.length];
    const at = t + (s % 2 === 1 ? SWING * STEP : 0);

    // new lead phrase every 8 bars, variation every 2
    if (s === 0 && bar % 2 === 0) {
      if (bar % 8 === 0 && bar > 0) motif = makeMotif();
      current = bar % 4 === 2 ? vary(motif) : motif;
    }

    // drums
    if (!intro && !breakdown && KICK[s]) kick(at);
    if (!intro && SNARE[s]) snare(at, breakdown ? 0.5 : 1);
    if (!intro && !breakdown && s === 15 && bar % 4 === 3) snare(at, 0.5); // little fill
    if (HAT[s]) hat(at, s % 4 === 0 ? 1 : 0.55, s === 14 && bar % 2 === 1);

    // bass
    const b = BASS[s];
    if (!intro && b !== null) bassNote(chord.root + b, at, STEP * 2.2);

    // chords
    if (STAB[s]) stab(chord.tones, at);

    // arpeggio: 8ths cycling up through the chord, an octave up
    if (!intro && s % 2 === 0) {
      const i = (s / 2) % chord.tones.length;
      pluck(chord.tones[i] + 12, at, 0.5, arpBus, 0.25);
    }

    // lead motif (2 bars long)
    if (bar >= 4 && !breakdown) {
      const m = current[(bar % 2) * 16 + s];
      if (m !== null && m !== undefined) pluck(SCALE[m], at, 0.8, leadBus, STEP * 3.5);
    }

    step++;
  };

  const timer = setInterval(() => {
    while (next < ctx.currentTime + 0.25) {
      scheduleStep(next);
      next += STEP;
    }
  }, 50);

  const stop = () => {
    clearInterval(timer);
    ctx.close().catch(() => {});
  };

  return { ctx, master, stop };
}

export class Ambient {
  private nodes: Nodes | null = null;
  private stopTimer: ReturnType<typeof setTimeout> | undefined;

  /** Fade the music in. Call from a user gesture the first time. */
  start() {
    if (this.stopTimer) clearTimeout(this.stopTimer);
    if (!this.nodes) this.nodes = build();
    const { ctx, master } = this.nodes;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(MASTER, now + 1.5);
  }

  /** Fade out, then release the audio context. */
  stop() {
    const n = this.nodes;
    if (!n) return;
    const now = n.ctx.currentTime;
    n.master.gain.cancelScheduledValues(now);
    n.master.gain.setValueAtTime(n.master.gain.value, now);
    n.master.gain.linearRampToValueAtTime(0, now + 0.8);
    this.stopTimer = setTimeout(() => {
      n.stop();
      if (this.nodes === n) this.nodes = null;
    }, 900);
  }

  /** Pause/resume without tearing down, e.g. when the tab is hidden. */
  setSuspended(suspended: boolean) {
    const ctx = this.nodes?.ctx;
    if (!ctx) return;
    if (suspended) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  }
}
