export const SAMPLES_PER_SEC = 44100;
export const MAX_PERIOD = Math.round(SAMPLES_PER_SEC / 50);
export const MIN_PERIOD = Math.round(SAMPLES_PER_SEC / 500);
export const MIN_SAMPLES = Math.pow(2, Math.ceil(Math.log2(MAX_PERIOD)) + 1);

export function getFrequency(data, corr) {
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
  return freq;
}
