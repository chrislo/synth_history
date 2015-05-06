
var context = new AudioContext;

var Grain = function(context, data, output) {
  this.context = context;
  this.data = data;
  this.output = output;

  this.setup();
};

Grain.prototype.setup = function() {
  var N = this.data.length;
  this.buffer = this.context.createBuffer(1, N, this.context.sampleRate);

  var buffer_data = this.buffer.getChannelData(0);

  for (var i = 0; i < N; i++) {
    // Hann window
    window_fn = 0.5 * (1 - Math.cos(2 * Math.PI * i / (N - 1)));
    buffer_data[i] = this.data[i] * window_fn;
  }
};

Grain.prototype.trigger = function(time) {
  var source = this.context.createBufferSource();
  source.buffer = this.buffer;
  source.connect(this.output);
  source.start(time);
};

var GranularSynth = function(context, url, params) {
  this.context = context;
  this.loadSample(url);

  this.output = context.createDynamicsCompressor();
  this.output.connect(context.destination);

  this.grainsPerSecond = params.grainsPerSecond;
  this.grainLength = params.grainLength;
  this.walkProbability = params.walkProbability;
};

GranularSynth.prototype.loadSample = function(url) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  request.onload = function() {
    this.context.decodeAudioData(request.response, function(buffer) {
      this.buffer = buffer;
      this.createGrains();
    }.bind(this));
  }.bind(this);

  request.send();
};

GranularSynth.prototype.createGrains = function() {
  var rawData = this.buffer.getChannelData(0);
  var chunks = _.chunk(rawData, this.grainLength);

  this.grains = chunks.map(function(data) {
    return new Grain(this.context, data, this.output)
  }.bind(this) );

  this.ready();
};

GranularSynth.prototype.stop = function() {
  clearInterval(this.scheduler);
};

GranularSynth.prototype.play = function() {
  var scheduleAheadTime = 1;
  var nextGrainTime = this.context.currentTime;
  var grainIndex = 25;

  this.scheduler = setInterval(function() {
    while (nextGrainTime < this.context.currentTime + scheduleAheadTime ) {
      if (Math.random() < this.walkProbability) {
        if (Math.random() > 0.5) {
          grainIndex = Math.min(this.grains.length - 1, grainIndex + 1);
        } else {
          grainIndex = Math.max(0, grainIndex - 1);
        }
      }

      nextGrainTime += 1 / this.grainsPerSecond;
      this.grains[grainIndex].trigger(nextGrainTime);
    }
  }.bind(this), 250);
};

window.onload = function() {
  var fastSynth = new GranularSynth(context, '/short.wav', {grainsPerSecond: 10, grainLength: 4000, walkProbability: 0.5});
  var slowSynth = new GranularSynth(context, '/short.wav', {grainsPerSecond: 40, grainLength: 40000, walkProbability: 1});
  var keyboard = new Keyboard(document);

  var playing = false;
  var synth = fastSynth;

  synth.ready = function() {
    keyboard.onKeyDown = function(e) {
      if (e.program) {
        switch(e.program) {
        case 1:
          synth = fastSynth;
          break;
        case 2:
          synth = slowSynth;
          break;
        }
      } else {
        if(playing == true) {
          synth.stop();
          playing = false;
        } else {
          synth.play();
          playing = true;
        }
      }
    }
  }
};
