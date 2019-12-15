
export class Song {

  constructor () {

    /** @type {Pattern[]} */
    this.patterns = [];

    /** @type {string} */
    this.name = 'song-name';

  }

  /**
   *
   * @param {Pattern} pattern
   */
  addPattern(pattern) {
    this.patterns.push(pattern);
  }

  removePattern(pattern) {
    this.patterns.filter((item) => item !== pattern);
  }

  play() {
    this.patterns.forEach(pattern => pattern.play());
  }

  stop() {
    this.patterns.forEach(pattern => pattern.stop());
  }

}
