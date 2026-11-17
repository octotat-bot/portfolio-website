// M01 loader sound: off until the first pointer or key press, Web Audio only,
// no files. A photo frame gets a camera-shutter click (two short high-passed
// noise bursts, 40ms apart); a word frame gets a soft low thump (a sine
// falling from 150 to 45Hz). The master gain fades out at the end.

type AudioCtor = typeof AudioContext;

export function createIntroSound() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let noise: AudioBuffer | null = null;

  /** Call from a pointer or key handler: browsers only allow audio after one. */
  const arm = () => {
    if (ctx) return;
    const Ctor: AudioCtor | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
    void ctx.resume();
    master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
    noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.05), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  };

  const burst = (at: number, length: number, level: number) => {
    if (!ctx || !master || !noise) return;
    const source = ctx.createBufferSource();
    source.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1400;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + length);
    source.connect(filter).connect(gain).connect(master);
    source.start(at);
    source.stop(at + length + 0.01);
  };

  /** Camera shutter: two very short noise bursts, the second 40ms later. */
  const click = () => {
    if (!ctx) return;
    const now = ctx.currentTime;
    burst(now, 0.025, 0.5);
    burst(now + 0.04, 0.035, 0.35);
  };

  /** A soft low thump: a sine falling from 150 to 45Hz, under 120ms. */
  const thump = () => {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.11);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.7, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 0.12);
  };

  /** Fade the master out, then close the context. */
  const fadeOut = (seconds: number) => {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + seconds);
    const closing = ctx;
    window.setTimeout(() => void closing.close(), (seconds + 0.1) * 1000);
  };

  return { arm, click, thump, fadeOut, get armed() {
    return ctx !== null;
  } };
}
