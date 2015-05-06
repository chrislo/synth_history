
var context = new AudioContext;

var Theremin = function(context) {
   this.context = context;
};

Theremin.prototype.playNote = function(note) {
   var now = this.context.currentTime;
   var param = this.oscillator.frequency;

   param.cancelScheduledValues(now);
   param.setValueAtTime(param.value, now);
   param.linearRampToValueAtTime(note, now + 0.01);
};

Theremin.prototype.start = function() {
   this.setup();
   this.oscillator.start();
};

Theremin.prototype.stop = function() {
   this.oscillator.stop();
};

Theremin.prototype.setup = function() {
   this.oscillator = this.context.createOscillator();
   this.oscillator.type = 'sine';

   this.gain = this.context.createGain();

   this.oscillator.connect(this.gain);
   this.gain.connect(this.context.destination);
};

Theremin.prototype.setVolume = function(volume) {
   var now = this.context.currentTime;
   var param = this.gain.gain;

   param.cancelScheduledValues(now);
   param.setValueAtTime(param.value, now);
   param.linearRampToValueAtTime(volume, now + 0.01);
};

var relativePosition = function(event) {
  var x = event.clientX;
  var y = event.clientY;
  var maxX = document.documentElement.clientWidth;
  var maxY = document.documentElement.clientHeight;

  return { x: x/maxX, y: y/maxY }
};

var controlTheremin = function(theremin, event) {
  var parameters = relativePosition(event);
  var frequency = parameters.x * 1000;
  var volume = parameters.y;

  theremin.playNote(frequency);
  theremin.setVolume(volume);
};

window.onload = function() {
  var theremin = new Theremin(context);
  var keyboard = new Keyboard(document);

  var body = document.getElementsByTagName("body")[0];
  body.addEventListener("mousemove", function(event) {
    controlTheremin(theremin, event);
  });

  var playing = false;

  keyboard.onKeyDown = function(e) {
    if(playing == true) {
      theremin.stop();
      playing = false;
    } else {
      theremin.start();
      playing = true;
    }
  };
};
