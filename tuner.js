import {getFrequency, MIN_FREQUENCY} from './tuner_lib.js';
import {Zeroes} from './zeroes.js';

const START_FREQ = 55;
const NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

async function main() {
  const context = new AudioContext();
  const maxPeriod = Math.round(context.sampleRate / MIN_FREQUENCY);
  const minSamples = Math.pow(2, Math.ceil(Math.log2(maxPeriod)) + 1);

  const analyser = context.createAnalyser();
  analyser.fftSize = minSamples;

  const stream = await navigator.mediaDevices.getUserMedia({audio: true});
  const source = context.createMediaStreamSource(stream);
  source.connect(analyser);

  const data = new Float32Array(analyser.fftSize);

  const noteNode = document.getElementById('note');
  const freqNode = document.getElementById('freq');

  function onFrame() {
    analyser.getFloatTimeDomainData(data);

    let volume = 0;
    const zeroes = new Zeroes(data.length);
    for (let i = 0; i < data.length; ++i) {
      volume += data[i] * data[i];
      zeroes.set(i, data[i] >= 0);
    }
    volume = Math.sqrt(volume / data.length);

    if (volume >= 0.005) {
      const corr = zeroes.autoCorrelate();
      const freq = getFrequency(context.sampleRate, data, corr);
      const note = 12 * Math.log2(freq / START_FREQ);
      const wholeNote = Math.round(note);

      const cents = wholeNote - note;

      const flat = cents < -0.2 ? '&#9650;' : '';
      const sharp = cents > 0.2 ? '&#9660;' : '';

      noteNode.innerHTML = `${NOTES[wholeNote % 12]} ${flat}${sharp}`;
      freqNode.textContent = Math.round(freq);
    }

    requestAnimationFrame(onFrame);
  }
  requestAnimationFrame(onFrame);
}

addEventListener('load', () => {
  document.getElementById('start').addEventListener('click', main);
});
