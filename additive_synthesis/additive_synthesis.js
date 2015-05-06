
var context = new AudioContext;

var Partial = function(context) {
  this.context = context;
  this.attackTime = 0.01;
  this.decayTime = 0.01;

  this.osc = context.createOscillator();
  this.gain = context.createGain();

  this.osc.connect(this.gain);
  this.gain.connect(context.destination);
};

Partial.prototype.start = function() {
  var now = this.context.currentTime

  this.gain.gain.setValueAtTime(0, now);
  this.osc.frequency.setValueAtTime(this.frequency, now);
  this.gain.gain.linearRampToValueAtTime(this.amplitude, now + this.attackTime);

  this.osc.start(now);
};

Partial.prototype.stop = function() {
  var now = this.context.currentTime

  this.gain.gain.setValueAtTime(this.gain.gain.value, now);
  this.gain.gain.linearRampToValueAtTime(0, now + this.decayTime);

  this.osc.stop(now + this.decayTime);
};

var Note = function(context, frequency, parameters) {
  this.context = context;
  this.frequency = frequency;
  this.parameters = parameters;

  this.partials = _.times(this.parameters.number_of_partials, function() {
    return new Partial(this.context);
  });

  this.frequencies = _.map(this.parameters.partial_frequencies, function(f) {
    return f * this.frequency
  }, this);

  this.amplitudes = this.parameters.partial_amplitudes;

  _.each(this.partials, function(partial, index) {
    partial.frequency = this.frequencies[index];
    partial.amplitude = this.amplitudes[index];
  }, this);
};

Note.prototype.start = function() {
  _.map(this.partials, function(partial) { partial.start() });
};

Note.prototype.stop = function() {
  _.map(this.partials, function(partial) { partial.stop() });
};

var AdditiveSynth = function(context, parameters) {
  this.context = context;
  this.notes = {};
  this.parameters = parameters;
};

AdditiveSynth.prototype.noteOn = function(midi_note_number) {
  var frequency = this.midiNoteNumberToFrequency(midi_note_number);

  this.notes[midi_note_number] = new Note(this.context, frequency, this.parameters)
  this.notes[midi_note_number].start();
};

AdditiveSynth.prototype.midiNoteNumberToFrequency = function(midi_note_number) {
  var f_ref = 440;
  var n_ref = 57;
  var a = Math.pow(2, 1/12);
  var n = midi_note_number - n_ref;
  var f = f_ref * Math.pow(a, n);

  return f;
};

AdditiveSynth.prototype.noteOff = function(midi_note_number) {
  this.notes[midi_note_number].stop();
};

var SquareWave = {
  number_of_partials: 6,
  partial_frequencies: [1, 3, 5, 7, 9, 11],
  partial_amplitudes: [1, 1/3, 1/5, 1/7, 1/9, 1/11]
}

var Bell = {
  number_of_partials: 9,
  partial_frequencies: [4.07, 3.76, 3, 2.74, 2, 1.71, 1.19, .92, .56],
  partial_amplitudes: [1, 1, 1, 1, 1, 1, 1, 1, 1]
}

var SawTooth = {
  number_of_partials: 6,
  partial_frequencies: [1, 2, 3, 4, 5, 6],
  partial_amplitudes: [1, 1/2, 1/3, 1/4, 1/5, 1/6]
}

window.onload = function() {
  var saw = new AdditiveSynth(context, SawTooth);
  var square = new AdditiveSynth(context, SquareWave);
  var bell = new AdditiveSynth(context, Bell);
  var synth = saw;

  var keyboard = new Keyboard(document);

  keyboard.onKeyDown = function(e) {
    if (e.program) {
      switch(e.program) {
      case 1:
        synth = saw;
        break;
      case 2:
        synth = square;
        break;
      case 3:
        synth = bell;
        break;
      }
    } else {
      synth.noteOn(e.midi);
    }
  }

  keyboard.onKeyUp = function(e) {
    synth.noteOff(e.midi);
  }
};
