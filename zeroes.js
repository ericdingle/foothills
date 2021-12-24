function offset(index) { return Math.floor(index / 32); }

function countBits(n) {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
}

export class Zeroes {
  constructor(length) {
    this.array = new Uint32Array(length / 32);
  }

  get(index) {
    const mask = 1 << (index % 32);
    return (this.array[offset(index)] & mask) != 0;
  }

  set(index, value) {
    const mask = 1 << (index % 32);
    if (value)
      this.array[offset(index)] |= mask;
    else
      this.array[offset(index)] &= ~mask;
  }

  autoCorrelate() {
    const len1 = this.array.length * 16;  // Number of bits, half the data length.
    const len2 = this.array.length / 2;   // Number of values.

    const corr = new Uint16Array(len1);
    for (let i = 0; i < len1; ++i) {
      const shift = i % 32;
      let count = 0;
      for (let j = 0; j < len2; ++j) {
        let value = this.array[offset(i) + j]
        if (shift != 0) {
          value >>>= shift;
          value |= this.array[offset(i) + j + 1] << (32 - shift);
        }
        count += countBits(this.array[j] ^ value);
      }
      corr[i] = count;
    }
    return corr;
  }
}
