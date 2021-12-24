import {getFrequency, MIN_SAMPLES, SAMPLES_PER_SEC} from './tuner_lib.js';
import {Zeroes} from './zeroes.js';

const FREQ = 261.626;
const W = 2 * Math.PI * FREQ;

const HEIGHT = 256;
const WIDTH = 1024;

function func(t) {
  return 0.3 * Math.sin(W * t) + 0.4 * Math.sin(2 * W * t) + 0.3 * Math.sin(3 * W * t);
}

function getContext(name) {
  const canvas = document.getElementById(name);
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, WIDTH, HEIGHT);
  return context;
}

function main() {
  // Plot the function.
  let data = new Float32Array(MIN_SAMPLES);
  data = data.map((v, i) => func(i / SAMPLES_PER_SEC));

  let context = getContext('func');
  context.beginPath();
  context.moveTo(0, HEIGHT / 2);
  for (let i = 0; i < WIDTH; ++i)
    context.lineTo(i, HEIGHT / 2 - 100 * data[i]);
  context.stroke();

  // Plot the zeroes.
  const zeroes = new Zeroes(data.length);
  data.forEach((v, i) => { zeroes.set(i, v >= 0); });

  context = getContext('zeroes');
  context.beginPath();
  context.moveTo(0, HEIGHT / 2);
  for (let i = 0; i < WIDTH; ++i)
    context.lineTo(i, HEIGHT / 2 - 100 * zeroes.get(i));
  context.stroke();

  // Plot the auto correlation.
  const corr = zeroes.autoCorrelate();

  context = getContext('corr');
  context.beginPath();
  context.moveTo(0, HEIGHT / 2);
  for (let i = 0; i < WIDTH; ++i)
    context.lineTo(i, HEIGHT / 2 - 0.125 * corr[i]);
  context.stroke();

  // Get the frequency
  const freq = getFrequency(data, corr);
  console.log(freq);
}

addEventListener('load', main);
