var context = new AudioContext;

var Voice = function(context, buffer, offset) {
  this.context = context;
  this.buffer = buffer;
  this.offset = offset;
};

Voice.prototype.start = function() {
  this.source = this.context.createBufferSource();
  this.source.loop = true;
  this.source.buffer = this.buffer;

  this.source.connect(this.context.destination);

  this.source.start(0, this.offset);
};

Voice.prototype.stop = function() {
  this.source.stop();
};

var SamplingSynth = function(context, parameters) {
  this.context = context;
  this.notes = {};
  this.parameters = parameters;

  this.loadSample(parameters.url);
};

SamplingSynth.prototype.loadSample = function(url) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  request.onload = function() {
    this.context.decodeAudioData(request.response, function(buffer) {
      this.buffer = buffer;
      this.ready();
    }.bind(this));
  }.bind(this);

  request.send();
};

SamplingSynth.prototype.noteOn = function(midi_note_number) {
  var offset = this.parameters.offsets[midi_note_number];

  this.notes[midi_note_number] = new Voice(this.context, this.buffer, offset);
  this.notes[midi_note_number].start();
};

SamplingSynth.prototype.noteOff = function(midi_note_number) {
  this.notes[midi_note_number].stop();
};

var Amen = {
  url: 'amen.wav',
  offsets: {
    48: 0,
    50: 0.431,
    52: 1.091,
    53: 1.536,
    55: 2.175,
    57: 2.643,
    59: 4.587,
    60: 5.671,
    62: 6.317
  }
}

window.onload = function() {
  var synth = new SamplingSynth(context, Amen);
  var keyboard = new Keyboard(document);

  synth.ready = function() {
    console.log('ready');

    keyboard.onKeyDown = function(e) {
      synth.noteOn(e.midi);
    }

    keyboard.onKeyUp = function(e) {
      synth.noteOff(e.midi);
    }
  };
};
