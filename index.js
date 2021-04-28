addEventListener('load', () => {
  const start = document.getElementById('start');
  start.addEventListener('click', main);
});

async function main() {
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  const data = new Float32Array(analyser.fftSize);

  const stream = await navigator.mediaDevices.getUserMedia({audio: true});
  source = context.createMediaStreamSource(stream);
  source.connect(analyser);

  const canvas = document.getElementById('tuner').getContext('2d');
  function onFrame() {
    analyser.getFloatTimeDomainData(data);
    const volume = Math.sqrt(data.reduce((x, y) => x + y*y, 0) / data.length);

    canvas.clearRect(0, 0, 150, 100);
    canvas.fillStyle = 'rgb(255, 0 ,0)';
    canvas.fillRect(10, 25, Math.round(volume * 100), 10);

    requestAnimationFrame(onFrame);
  }
  requestAnimationFrame(onFrame);
}

