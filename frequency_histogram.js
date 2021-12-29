addEventListener('load', () => {
  document.getElementById('start').addEventListener('click', () => { main(); });
});

const HEIGHT = 256;

// Max support size. Higher is better for bin resolution.
const FFT_SIZE = 32768;
// Max frequency based on a guitar's high open E.
const MAX_FREQUENCY = 400;

async function main(type) {
  const audioContext = new AudioContext();
  // Max frequency / (frequency range per bin).
  const width = MAX_FREQUENCY / ((audioContext.sampleRate / 2) / FFT_SIZE)

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = FFT_SIZE;

  const data = new Uint8Array(analyser.frequencyBinCount);

  const stream = await navigator.mediaDevices.getUserMedia({audio: true});
  source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  const canvas = document.getElementById('histogram');
  canvas.width = width;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d');

  function onFrame() {
    analyser.getByteFrequencyData(data);

    context.clearRect(0, 0, width, HEIGHT);
    context.fillStyle = 'red';
    for (let i = 0; i < width; ++i) {
      context.fillRect(i, HEIGHT - data[i], 1, data[i]);
    }

    requestAnimationFrame(onFrame);
  }
  requestAnimationFrame(onFrame);
}

