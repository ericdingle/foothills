addEventListener('load', main);

const FREQ = 261.626;
const W = 2 * Math.PI * FREQ;

const SAMPLES_PER_SEC = 44100;
const MAX_PERIOD = Math.round(SAMPLES_PER_SEC / 50);
const MIN_PERIOD = Math.round(SAMPLES_PER_SEC / 500);
const FFT_SIZE = Math.pow(2, Math.ceil(Math.log2(MAX_PERIOD)) + 1);

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

function countBits(n) {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
}

class Zeroes {
  constructor(length) {
    this.array = new Uint32Array(length / 32);
  }

  offset(index) { return Math.floor(index / 32); }
  value(index) { return this.array[this.offset(index)]; }

  get(index) {
    const mask = 1 << (index % 32);
    return (this.value(index) & mask) != 0;
  }

  set(index, value) {
    const mask = 1 << (index % 32);
    if (value)
      this.array[this.offset(index)] |= mask;
    else
      this.array[this.offset(index)] &= ~mask;
  }

  *autoCorrelate() {
    const len1 = this.array.length * 16;
    const len2 = this.array.length / 2;

    for (let i = 0; i < len1; ++i) {
      const shift = i % 32;
      let count = 0;
      for (let j = 0; j < len2; ++j) {
        let value = this.array[this.offset(i) + j]
        if (shift != 0) {
          value >>>= shift;
          value |= this.array[this.offset(i) + j + 1] << (32 - shift);
        }
        count += countBits(this.array[j] ^ value);
      }
      yield [i, count];
    }
  }

  slice(start, end) {
    const result = [];
    for (let i = start; i < end; ++i)
      result.push(this.get(i));
    return result;
  }
}

function main() {
  // Plot the function.
  const data = new Float32Array(FFT_SIZE);
  for (let i = 0; i < data.length; ++i) {
    data[i] = func(i / SAMPLES_PER_SEC);
  }

  let context = getContext('func');
  context.beginPath();
  context.moveTo(0, HEIGHT / 2);
  for (let i = 0; i < WIDTH; ++i)
    context.lineTo(i, HEIGHT / 2 - 100 * data[i]);
  context.stroke();

  // Plot the zeroes.
  const zeroes = new Zeroes(data.length);
  for (let i = 0; i < data.length; ++i) {
    zeroes.set(i, data[i] >= 0);
  }

  context = getContext('zeroes');
  context.beginPath();
  context.moveTo(0, HEIGHT / 2);
  for (let i = 0; i < WIDTH; ++i)
    context.lineTo(i, HEIGHT / 2 - 100 * zeroes.get(i));
  context.stroke();

  // Plot the auto correlation.
  const corr = new Uint16Array(data.length / 2);
  for (const [i, count] of zeroes.autoCorrelate()) {
    corr[i] = count;
  }

  context = getContext('corr');
  context.beginPath();
  context.moveTo(0, HEIGHT / 2);
  for (let i = 0; i < WIDTH; ++i)
    context.lineTo(i, HEIGHT / 2 - 0.125 * corr[i]);
  context.stroke();

  // Handle harmonics.
  let maxCount = 0;
  let index = corr.slice(MIN_PERIOD).reduce((p, c, i, a) => {
    maxCount = Math.max(maxCount, c);
    return c < a[p] ? i : p;
  }, 0) + MIN_PERIOD;

  const threshold = 0.15 * maxCount;
  const maxDiv = Math.floor(index / MIN_PERIOD);
  for (let div = maxDiv; div != 1; --div) {
    let harmonic = true;

    for (let i = 1; i < div; ++i) {
      const j = Math.floor(i * index / div);
      if (corr[j] > threshold) {
        harmonic = false;
        break;
      }
    }

    if (harmonic) {
      index = Math.floor(index / div);
      break;
    }
  }

  // Estimate the frequency.
  let prev = 0;
  let start = 0;
  for (; data[start] <= 0; ++start)
    prev = data[start];
  let dy = data[start] - prev;
  const dx1 = -prev / dy;

  let end = index - 1;
  for (; data[end] <= 0; ++end)
    prev = data[end];
  dy = data[end] - prev;
  const dx2 = -prev / dy;

  const samples = (end - start) + (dx2 - dx1);
  const freq = SAMPLES_PER_SEC / samples;

  console.log(freq);
}
