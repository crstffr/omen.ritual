import { MidiIO } from './LocalMidi';
import { Pattern } from './Pattern';
import { EventEmitter } from 'events';
import { log } from '../utils/log';

export class Song extends EventEmitter {

  /** @type {number} */
  channel;

  /** @type {string} */
  name;

  /** @type {Pattern[]} */
  patterns = [];

  /**
   *
   * @param {SongOpts} [opts]
   */
  constructor (opts = {}) {
    super();

    const {
      channel = 14,
      name    = 'untitled',
    } = opts;

    this.channel = channel;
    this.name = name;

    MidiIO.onMessage((msg) => {
      if (msg.type === 'Start') return this.play();
      if (msg.type === 'Stop')  return this.stop();
      this.checkForTrigNotes(msg);
    });

  }

  /**
   * Static method to instantiate new song from save data
   *
   * @param {SongExport} data
   */
  static load(data) {
    const song = new Song(data.song);
    data.patterns.forEach(patternOpts => {
      song.addPattern(patternOpts);
    });
    return song;
  }

  /**
   *
   * @param {PatternOpts} [patternOpts]
   */
  addPattern = (patternOpts) => {
    const pattern = new Pattern(patternOpts);
    pattern.setIndex(this.patterns.length);

    if (!pattern.trigNote) {
      const note = this.getNextTrigNote();
      pattern.setTrigNote(note);
    }

    pattern.on('touched', () => this.emit('touched'));
    this.patterns.push(pattern);
    this.emit('updated');
    return pattern;
  };

  /**
   *
   * @param {number} index
   */
  removePattern = (index) => {
    this.patterns = this.patterns.filter((_, i) => (index !== i));
    this.emit('updated');
    this.emit('touched');
  };

  /**
   *
   * @returns {number}
   */
  getNextTrigNote = () => {
    const notes = this.patterns.map(({trigNote}) => trigNote);
    for (let i = 36; i <= 127; i = i + 2) {
      if (!notes.includes(i)) return i;
    }
    return 34;
  };

  /**
   *
   * @returns {SongSaveData}
   */
  exportData = () => {
    return {
      song: {
        channel: this.channel,
        name: this.name
      },
      patterns: this.patterns.map(p => p.exportData())
    }
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
