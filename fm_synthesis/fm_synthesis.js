var context = new AudioContext;

var Voice = function(context, frequency, parameters) {
  this.context = context;

  this.modulatingOsc = context.createOscillator()
  this.modulatingOscGain = context.createGain();

  this.carrierOsc = context.createOscillator();
  this.carrierOscGain = context.createGain();

  this.modulatingOsc.connect(this.modulatingOscGain);
  this.modulatingOscGain.connect(this.carrierOsc.frequency);
  this.carrierOsc.connect(this.carrierOscGain);
  this.carrierOscGain.connect(context.destination);

  this.modulationIndex = parameters.modulationIndex;
  this.modulationFrequency = frequency / parameters.carrierModulationRatio;

  this.modulatingOsc.frequency.value = this.modulationFrequency;
  this.carrierOsc.frequency.value = frequency;
};

Voice.prototype.on = function() {
  this.modulatingOsc.start();
  this.carrierOsc.start();
  this.triggerCarrierEnvelope();
  this.triggerSpectralEnvelope();
};

Voice.prototype.triggerCarrierEnvelope = function() {
  var param = this.carrierOscGain.gain;
  var now = this.context.currentTime;

  param.cancelScheduledValues(now);
  param.setValueAtTime(0, now);
  param.linearRampToValueAtTime(1, now + 0.2);
  param.linearRampToValueAtTime(0.7, now + 0.3);
  param.setValueAtTime(0.7, now + 0.5);
  param.linearRampToValueAtTime(0, now + 0.6);
};

Voice.prototype.triggerSpectralEnvelope = function() {
  var param = this.modulatingOscGain.gain;
  var now = this.context.currentTime;
  var A = this.modulationIndex * this.modulationFrequency;

  param.cancelScheduledValues(now);
  param.setValueAtTime(0, now);
  param.linearRampToValueAtTime(A, now + 0.2);
  param.linearRampToValueAtTime(A * 0.8, now + 0.3);
  param.setValueAtTime(A * 0.8, now + 0.5);
  param.linearRampToValueAtTime(0, now + 0.6);
};

Voice.prototype.off = function() {
  this.modulatingOsc.stop();
  this.carrierOsc.stop();
};

var FmSynth = function(context, parameters) {
  this.context = context;
  this.voices = {};
  this.parameters = parameters;
};

FmSynth.prototype.noteOn = function(midi_note_number) {
  var frequency = this.midiNoteNumberToFrequency(midi_note_number);

  this.voices[midi_note_number] = new Voice(this.context, frequency, this.parameters)
  this.voices[midi_note_number].on();
};

FmSynth.prototype.midiNoteNumberToFrequency = function(midi_note_number) {
  var f_ref = 440;
  var n_ref = 57;
  var a = Math.pow(2, 1/12);
  var n = midi_note_number - n_ref;
  var f = f_ref * Math.pow(a, n);

  return f;
};

FmSynth.prototype.noteOff = function(midi_note_number) {
  this.voices[midi_note_number].off();
};

var params = {
  carrierModulationRatio: 1,
  modulationIndex: 10
};

window.onload = function() {
  var synth = new FmSynth(context, params);
  var keyboard = new Keyboard(document);

  keyboard.onKeyDown = function(e) {
    synth.noteOn(e.midi);
  }

  keyboard.onKeyUp = function(e) {
    synth.noteOff(e.midi);
  }
};
