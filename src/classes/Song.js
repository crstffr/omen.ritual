import { MidiIO } from './LocalMidi';
import { Pattern } from './Pattern';
import { EventEmitter } from 'events';
import { log } from '../utils/log';

export class Song extends EventEmitter {

  constructor (opts) {
    super();

    const {
      name    = 'untitled',
      channel = 16,
    } = opts;

    /** @type {number} */
    this.channel = channel;

    /** @type {SongOpts} */
    this.opts = opts;

    /** @type {Pattern[]} */
    this.patterns = [];

    /** @type {string} */
    this.name = name;

    MidiIO.onMessage((msg) => {
      if (msg.type === 'Start') return this.play();
      if (msg.type === 'Stop')  return this.stop();
      this.checkForTrigNotes(msg);
    });

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

  removePattern = (which) => {
    this.patterns = this.patterns.filter((_, i) => (which !== i));
    this.emit('updated');
    this.emit('touched');
  };

  getNextTrigNote = () => {
    const notes = this.patterns.map(({trigNote}) => trigNote);
    for (let i = 36; i <= 127; i = i + 2) {
      if (!notes.includes(i)) return i;
    }
    return 34;
  };

  /**
   *
   * @returns {{song: SongOpts, patterns: PatternOpts[]}}
   */
  exportData = () => {
    return {
      song: this.opts,
      patterns: this.patterns.map(pattern => pattern.exportData())
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
