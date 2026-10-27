/* A short mechanical click, synthesized locally after a deliberate knob press. */
window.playKnobClick = (() => {
  let context;
  return (strength = 1) => {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      context ||= new Audio();
      if (context.state === 'suspended') context.resume().catch(() => {});
      const now = context.currentTime;
      const gain = context.createGain();
      gain.gain.setValueAtTime(.16 * strength, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + .075);
      gain.connect(context.destination);
      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * .045), context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * Math.exp(-i / (samples.length * .15));
      const noise = context.createBufferSource();
      noise.buffer = buffer;
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 2400;
      noise.connect(filter); filter.connect(gain); noise.start(now);
      const body = context.createOscillator();
      body.type = 'triangle'; body.frequency.setValueAtTime(180, now);
      body.frequency.exponentialRampToValueAtTime(70, now + .06);
      body.connect(gain); body.start(now); body.stop(now + .08);
      body.onended = () => { body.disconnect(); noise.disconnect(); filter.disconnect(); gain.disconnect(); };
    } catch { /* Sound is optional; the knob always remains usable. */ }
  };
})();
