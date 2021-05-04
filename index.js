const TIME = 1, FREQ = 2;

addEventListener('load', () => {
  document.getElementById('time-volume').addEventListener('click', () => { main(TIME); });
  document.getElementById('freq-volume').addEventListener('click', () => { main(FREQ); });
});

async function main(type) {
  const context = new AudioContext();
  const analyser = context.createAnalyser();

  let data;
  if (type == TIME) {
    data = new Float32Array(analyser.fftSize);
  } else if (type == FREQ) {
    data = new Float32Array(analyser.frequencyBinCount);
  }

  const stream = await navigator.mediaDevices.getUserMedia({audio: true});
  source = context.createMediaStreamSource(stream);
  source.connect(analyser);

  const canvas = document.getElementById('tuner').getContext('2d');
  let a = 100, b = -100;
  function onFrame() {
    let volume;
    if (type == TIME) {
      analyser.getFloatTimeDomainData(data);
      volume = Math.sqrt(data.reduce((x, y) => x + y*y, 0) / data.length);
    } else if (type == FREQ) {
      analyser.getFloatFrequencyData(data);
      volume = Math.pow(10, 0.02 * data.reduce((x, y) => Math.max(x, y)));
    }

    canvas.clearRect(0, 0, 150, 100);
    canvas.resetTransform();

    canvas.translate(60, 60);
    canvas.rotate(Math.PI * volume);
    canvas.translate(-60, -60);

    canvas.fillStyle = 'rgb(255, 0 ,0)';
    canvas.fillRect(10, 55, 50, 5);

    requestAnimationFrame(onFrame);
  }
  requestAnimationFrame(onFrame);
}

