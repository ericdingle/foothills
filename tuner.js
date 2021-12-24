import {getFrequency, MIN_SAMPLES, SAMPLES_PER_SEC} from './tuner_lib.js';
import {Zeroes} from './zeroes.js';

async function main() {
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = MIN_SAMPLES;

  const stream = await navigator.mediaDevices.getUserMedia({audio: true});
  const source = context.createMediaStreamSource(stream);
  source.connect(analyser);

  const data = new Float32Array(analyser.fftSize);

  function onFrame() {
    analyser.getFloatTimeDomainData(data);

    const zeroes = new Zeroes(data.length);
    data.forEach((v, i) => { zeroes.set(i, v >= 0); });

    const corr = zeroes.autoCorrelate();
    const freq = getFrequency(data, corr);

    document.getElementById('freq').textContent = Math.round(freq);

    requestAnimationFrame(onFrame);
  }
  requestAnimationFrame(onFrame);
}

addEventListener('load', () => {
  document.getElementById('start').addEventListener('click', main);
});
