addEventListener('load', main);

const WIDTH = 200;
const HEIGHT = 200;

function func(t) {
  return 0.3 * Math.sin(2 * Math.PI * t) + 0.4 * Math.sin(4 * Math.PI * t) + 0.3 * Math.sin(6 * Math.PI * t);
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
  const data = []
  for (let i = 0; i < WIDTH; i += 1)
    data.push(HEIGHT / 2 * func(i / 100));

  let context = getContext('func');
  context.beginPath();
  context.moveTo(0, HEIGHT / 2 - data[0]);
  for (let i = 1; i < data.length; ++i)
    context.lineTo(i, HEIGHT / 2 - data[i]);
  context.stroke();

  // Plot the zero crossings.
  const zeroes = data.map(v => v >= 0 ? 1 : 0);

  context = getContext('zeroes');
  context.beginPath();
  context.moveTo(0, HEIGHT / 2 - 50 * zeroes[0]);
  for (let i = 0; i < zeroes.length; ++i)
    context.lineTo(i, HEIGHT / 2 - 50 * zeroes[i]);
  context.stroke();

  // Plot the auto correlation.
  const len = zeroes.length / 2;
  const slice = zeroes.slice(0, len);
  const corr = [];
  for (let i = 0; i < len; ++i) {
    const xor = slice.map((v, j) => v ^ zeroes[i + j]);
    corr.push(xor.reduce((sum, v) => sum + v));
  }
  corr.push(...corr);

  context = getContext('corr');
  context.beginPath();
  context.moveTo(0, HEIGHT / 2 - corr[0]);
  for (let i = 0; i < corr.length; ++i)
    context.lineTo(i, HEIGHT / 2 - corr[i]);
  context.stroke();
}
