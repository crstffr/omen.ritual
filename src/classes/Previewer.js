import { Events } from './Events';
import { MidiIO } from './LocalMidi';
import { Pattern } from './Pattern';
import { log } from '../utils/log';

export const Previewer = new (class {

  /** @type {boolean} */
  isPlaying;

  /** @type {Song} */
  song;

  /** @type {Pattern} */
  origPattern;

  /** @type {Pattern} */
  tempPattern;

  constructor () {
    Events.on('previewStop', this.stop);
    Events.on('previewFile', this.playFile);
    Events.on('patternSelected', this.setPattern);

    MidiIO.onMessage((msg) => {
      if (msg.type === 'Stop')  return this.stop();
    });
  }

  /**
   *
   * @param {Song} val
   */
  setSong = (val) => {
    this.song = val;
  };

  /**
   *
   * @param {Pattern} val
   */
  setPattern = (val) => {
    this.stop();
    this.origPattern = val;
  };

  playFile = (file) => {
    if (this.isPlaying) return this.stop();
    if (!this.origPattern) return;
    const origData = this.origPattern.exportData();
    this.tempPattern = new Pattern(origData);
    this.tempPattern.setTempo(this.song.tempo);
    if (this.tempPattern.loadFile(file)) {
      this.tempPattern.play(true);
      this.isPlaying = true;
    }
  };

  stop = () => {
    if (!this.isPlaying) return;
    if (this.tempPattern) {
      this.tempPattern.stop();
      this.tempPattern.destroy();
      this.tempPattern = null;
    }
    this.origPattern.stop();
    this.isPlaying = false;
  };


})();
