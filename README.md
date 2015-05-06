# Code samples for: 'A brief history of synthesis'

These repository contains 6 implementations of classic synthesis techniques using the Web Audio API:

- *Theremin*: A basic monophonic synthesiser where the pitch and volume of a single oscillator are controlled using the mouse pointer, a bit like waving your hands near a Theremin
- *Additive Synthesis*: Create sounds by adding together sine waves. This demo also shows how to achieve polyphony (playing multiple notes at the same time) with the Web Audio API.
- *Subtractive Synthesis*: A simple subtractive monosynth - create sounds by filtering sawtooth waves.
- *FM Synthesis*: An implementation of the "brass-like sounds" from John Chowning's seminal paper on Frequency Modulation Synthesis.
- *Sampler*: A demonstration of how to load samples from an external source, map them to keys, and play them back at various time offsets. Samples the "Amen break".
- *Granular*: A basic granular synthesis engine with variable grain length and grain density.

In addition a simple class `keyboard.js` shows how to map QWERTY keys to midi note numbers.

When writing these examples I tried to keep the ratio of Web Audio
code to boilerplate as high as I could. I've avoided libraries,
frameworks and build tools to make the code as simple as possible to
understand (for you, and for me!). I'd love it if you took this code,
played around with it, changed the parameters, added features and used
it to understand how to make interesting, beautiful sounds using the
Web Audio API.

## I want to know more! ##

At the moment, this code is presented as-is, and without commentary,
although I've tried to make it as easy to follow as possible.

I cover some of the background theory in my ScotlandJS talk (video to
follow). For the rest, I'm planning to write a book on this subject,
and expand on these examples and others in greater detail. If that
sounds interesting to you, please
[subscribe to my newsletter](http://blog.chrislowis.co.uk/waw.html) to
be the first to hear about it.
