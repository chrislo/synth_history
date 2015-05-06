var context = new AudioContext;

var SubtractiveSynth = function(context, parameters) {
  this.context = context;
  this.parameters = parameters;
  this.setup();
};

SubtractiveSynth.prototype.setup = function() {
  var ctx = this.context;

  osc1 = ctx.createOscillator();
  osc1.type = this.parameters.osc1type;
  osc1.detune.value = this.parameters.osc1detune;
  osc1.start();

  osc2 = ctx.createOscillator();
  osc2.type = this.parameters.osc2type;
  osc2.detune.value = this.parameters.osc2detune;
  osc2.start();

  env = ctx.createGain();
  env.gain.value = 0;

  filter = ctx.createBiquadFilter();
  filter.frequency.value = this.parameters.filterCutoff;
  filter.type = 'lowpass';

  osc1.connect(env);
  osc2.connect(env);

  env.connect(filter);

  filter.connect(ctx.destination);

  this.oscillators = [osc1, osc2];
  this.envelope = env;
  this.filter = filter;
};

SubtractiveSynth.prototype.noteOn = function(midi_note_number) {
  this.setOscillatorFrequencies(midi_note_number);
  this.triggerEnvelopeAttack();
  this.triggerFilterAttack();
};

SubtractiveSynth.prototype.triggerEnvelopeAttack = function() {
  var param = this.envelope.gain;
  var now = this.context.currentTime;

  param.cancelScheduledValues(now);
  param.setValueAtTime(0, now);
  param.linearRampToValueAtTime(1, now + this.parameters.attack);
};

SubtractiveSynth.prototype.triggerFilterAttack = function() {
  var param = this.filter.frequency;
  var now = this.context.currentTime;

  if (this.parameters.filterAttack > 0) {
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(this.parameters.filterCutoff, now + this.parameters.filterAttack);
  };
};

SubtractiveSynth.prototype.setOscillatorFrequencies = function(midi_note_number) {
  var osc1freq = this.midiNoteNumberToFrequency(midi_note_number + this.parameters.osc1tune);
  var osc2freq = this.midiNoteNumberToFrequency(midi_note_number + this.parameters.osc2tune);
  var now = this.context.currentTime;

  var osc1param = this.oscillators[0].frequency;
  osc1param.cancelScheduledValues(now);
  osc1param.setValueAtTime(osc1param.value, now);
  osc1param.linearRampToValueAtTime(osc1freq, now + this.parameters.glideTime);

  var osc2param = this.oscillators[1].frequency;
  osc2param.cancelScheduledValues(now);
  osc2param.setValueAtTime(osc2param.value, now);
  osc2param.linearRampToValueAtTime(osc2freq, now + this.parameters.glideTime);
};

SubtractiveSynth.prototype.midiNoteNumberToFrequency = function(midi_note_number) {
  var f_ref = 440;
  var n_ref = 57;
  var a = Math.pow(2, 1/12);
  var n = midi_note_number - n_ref;
  var f = f_ref * Math.pow(a, n);

  return f;
};

SubtractiveSynth.prototype.noteOff = function(midi_note_number) {
  var now = this.context.currentTime;

  this.triggerEnvelopeRelease();
  this.triggerFilterRelease();
};

SubtractiveSynth.prototype.triggerEnvelopeRelease = function() {
  var param = this.envelope.gain;
  var now = this.context.currentTime;

  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(0, now + this.parameters.release);
};

SubtractiveSynth.prototype.triggerFilterRelease = function() {
  var param = this.filter.frequency;
  var now = this.context.currentTime;

  if (this.parameters.filterDecay > 0) {
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(0, now + this.parameters.filterDecay);
  };
};

var MellowLead = {
  osc1type: 'square',
  osc2type: 'sine',
  osc1detune: -10,
  osc2detune: +10,
  glideTime: 0.02,
  release: 0.35
}

var GrowlingBass = {
  osc1type: 'square',
  osc2type: 'sawtooth',
  osc1tune: -24,
  osc2tune: -9,
  filterCutoff: 125,
  filterDecay: 0.6,
  release: 0.60
}

var Defaults = {
  osc1type: 'square',
  osc2type: 'square',
  osc1tune: 0,
  osc2tune: 0,
  osc1detune: 0,
  osc2detune: 0,
  filterCutoff: context.sampleRate,
  filterAttack: 0,
  filterDecay: 0,
  glideTime: 0,
  attack: 0,
  release: 0
}

window.onload = function() {
  var synth = new SubtractiveSynth(context, _.defaults(MellowLead, Defaults));
  var keyboard = new Keyboard(document);

  keyboard.onKeyDown = function(e) {
    synth.noteOn(e.midi);
  }

  keyboard.onKeyUp = function(e) {
    synth.noteOff(e.midi);
  }
};
