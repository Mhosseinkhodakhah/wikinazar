class CountMinSketch {
  constructor({ width = 1000, depth = 5, seed = 0 } = {}) {
    this.width = width;
    this.depth = depth;
    this.table = Array.from({ length: depth }, () => new Float64Array(width));
    this.seed = seed;
  }

  _hash(item, i) {
    let h = this.seed + i * 0x9e3779b9;
    const s = JSON.stringify(item);
    for (let j = 0; j < s.length; j++) {
      h = ((h << 5) - h + s.charCodeAt(j)) | 0;
      h ^= h >>> 16;
    }
    return (((h >>> 0) % this.width) + this.width) % this.width;
  }

  add(item, count = 1) {
    for (let i = 0; i < this.depth; i++) {
      const col = this._hash(item, i);
      this.table[i][col] += count;
    }
  }

  estimate(item) {
    let min = Infinity;
    for (let i = 0; i < this.depth; i++) {
      const col = this._hash(item, i);
      min = Math.min(min, this.table[i][col]);
    }
    return min;
  }

  merge(other) {
    if (this.width !== other.width || this.depth !== other.depth) {
      throw new Error('Sketch dimensions must match');
    }
    for (let i = 0; i < this.depth; i++) {
      for (let j = 0; j < this.width; j++) {
        this.table[i][j] += other.table[i][j];
      }
    }
  }

  clear() {
    for (let i = 0; i < this.depth; i++) {
      this.table[i].fill(0);
    }
  }
}

export { CountMinSketch };
