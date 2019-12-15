
export class Song {

  constructor (opts) {

    if (!opts.io) throw new Error('Song requires io option');

    const {
      channel = 16,
      io      = {},
    } = opts;

    /** @type {number} */
    this.channel = channel;

    /** @type {LocalMidi} */
    this.io = io;

    /** @type {Pattern[]} */
    this.patterns = [];

    /** @type {string} */
    this.name = 'song-name';

    if (this.io) {
      this.io.onMessage(this.checkForTrigNotes);
    }

  }

  /**
   *
   * @param {Pattern} pattern
   */
  addPattern = (pattern) => {
    this.patterns.push(pattern);
  };

  /**
   *
   * @param {MIDIMessage} msg
   */
  checkForTrigNotes = (msg) => {
    if (msg.channel !== this.channel) return;
    if (msg.type !== 'NoteOn') return;
    if (msg.velocity === 0) return;

    this.patterns.forEach(pattern => {
      if (msg.note === pattern.trigNote) pattern.trigger();
    });
  };

  play = () => {
    this.patterns.forEach(pattern => {
      if (pattern.autoPlay) pattern.play()
    });
  };

  stop = () => {
    this.patterns.forEach(pattern => pattern.stop());
  };

}
