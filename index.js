async function main() {
  const context = new AudioContext();
  const analyser = context.createAnalyser();

  const stream = await navigator.mediaDevices.getUserMedia({audio: true});
  source = context.createMediaStreamSource(stream);
  source.connect(analyser);

  const elem = document.getElementById('volume');
  const data = new Float32Array(analyser.fftSize);

  function onFrame() {
    analyser.getFloatTimeDomainData(data);
    const volume = Math.sqrt(data.reduce((x, y) => x + y*y, 0) / data.length);
    elem.innerText = Math.round(volume * 100);
    requestAnimationFrame(onFrame);
  }
  requestAnimationFrame(onFrame);
}

addEventListener('load', () => {
  const start = document.getElementById('start');
  start.addEventListener('click', main);
});
