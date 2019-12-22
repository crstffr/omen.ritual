import path from 'path';
import { Player } from 'midi-player-js';
import { MidiIO } from './LocalMidi';

import { log } from '../utils/log';
import { absFromRoot } from '../utils/root';

import { PatternModes } from './PatternModes';
import { PatternTypes } from './PatternTypes';

export class Pattern {

  //
  // Options / Props
  //

  /** @type {boolean} */
  active;

  /** @type {boolean} */
  autoPlay;

  /** @type {number} */
  channel;

  /** @type {string} */
  file;

  /** @type {number} */
  index;

  /** @type {PatternMode} */
  mode;

  /** @type {PatternOpts} */
  opts;

  /** @type {number} */
  padEnd;

  /** @type {number} */
  padStart;

  /** @type {number} */
  tempo;

  /** @type {number} */
  transpose;

  /** @type {number} */
  trigNote;

  /** @type {PatternType} */
  type;

  //
  // State
  //

  /** @type {boolean} */
  isPlaying;

  /** @type {*} */
  openNotes;

  //
  // Instances
  //

  /** @type {module:midi-player-js.MidiInternal.Player} */
  player;

  /**
   *
   * @param {PatternOpts|{}} opts
   */
  constructor (opts = {}) {

    const {
      active    = false,
      autoPlay  = false,
      channel   = 1,
      file      = '',
      mode      = PatternModes.LOOP,
      padEnd    = 0,
      padStart  = 0,
      tempo     = 0,
      transpose = 0,
      trigNote  = 0,
      type      = PatternTypes.KEYS,
    } = opts;

    this.active = active;
    this.autoPlay = autoPlay;
    this.channel = channel;
    this.file = file;
    this.mode = mode;
    this.opts = opts;
    this.padEnd = padEnd;
    this.padStart = padStart;
    this.tempo = tempo;
    this.transpose = transpose;
    this.trigNote = trigNote;
    this.type = type;
    this.isPlaying = false;
    this.openNotes = {};

    this.player = new Player(this.onPatternEvents);
    this.player.on('endOfFile', this.onPatternEnd);
    this.player.sampleRate = 0;

    this.loadFile(this.file);
  }

  /**
   * @param {string} file
   */
  loadFile = (file) => {
    if (!file) return;
    try {
      this.file = file;
      this.player.loadFile(file);
    } catch (e) {
      log(e);
      this.file = '';
    }
  };

  /**
   * @param {boolean} autoPlay
   */
  setAutoPlay = (autoPlay) => {
    this.autoPlay = autoPlay;
  };

  /**
   * @param {boolean} active
   */
  setActive = (active) => {
    this.active = active;
  };

  /**
   * @param {number} channel
   */
  setChannel = (channel) => {
    this.channel = channel;
  };

  /**
   * @param {number} index
   */
  setIndex = (index) => {
    this.index = index;
  };

  /**
   * @param {PatternMode} mode
   */
  setMode = (mode) => {
    this.mode = mode;
  };

  /**
   * @param {number} tempo
   */
  setTempo = (tempo) => {
    this.tempo = tempo;
    this.player.setTempo(tempo);
  };

  /**
   * @param {number} trigNote
   */
  setTrigNote = (trigNote) => {
    this.trigNote = trigNote;
  };

  /**
   * @param {PatternType} type
   */
  setType = (type) => {
    this.type = type;
  };

  /**
   *
   */
  play = (immediate) => {
    setTimeout(() => {
      if (this.player.isPlaying()) return;

      this.player.play();
      this.isPlaying = true;

      setTimeout(() => {
        if (this.tempo > 0) return;
        this.setTempo(MidiIO.clockTempo);
      }, 100);

    }, immediate ? 0 : this.padStart);
  };

  /**
   *
   */
  resetPlayer = () => {

    this.player.stop();
    this.isPlaying = false;

    // Stop notes that are left open when the file finishes.
    // Not sure why we have to do this manually.  ???

    Object.keys(this.openNotes).forEach((note) => {
      const event = this.openNotes[note];
      this.onPatternEvents({...event, name: 'Note off'});
    });
  };

  /**
   *
   */
  stop = () => {

    this.resetPlayer();
    this.setTempo(MidiIO.clockTempo);

  };

  /**
   * Trigger this pattern, which can behave differently
   * depending on the pattern mode.
   */
  trigger = () => {
    if (!this.active) return;
    switch (this.mode) {

      case PatternModes.LOOP:
      case PatternModes.ONCE:
        if (this.isPlaying) return this.stop();
        this.play();
        break;

      case PatternModes.STEP:

        break;

      case PatternModes.TOGL:
      case PatternModes.TRIG:

        break;
    }
  };

  /**
   *
   * @param {module:midi-player-js.MidiInternal.Event} event
   */
  onPatternEvents = (event) => {

    switch (event.name) {

      case 'Note on':
        event.noteNumber += this.transpose;
        this.openNotes[event.noteNumber] = event;
        MidiIO.encoder.noteOn(this.channel, event.noteNumber, event.velocity);
        // console.log('ON', this.channel, event.noteNumber);
        break;

      case 'Note off':
        delete this.openNotes[event.noteNumber];
        MidiIO.encoder.noteOff(this.channel, event.noteNumber, event.velocity);
        // console.log('OFF', this.channel, event.noteNumber);
        break;

      default:
        // console.log(event);
    }

  };

  /**
   *
   */
  onPatternEnd = () => {

    setTimeout(() => {

      this.resetPlayer();

      if (this.mode === PatternModes.LOOP) {
        setTimeout(() => this.play(true), 0);
      }

    }, this.padEnd);
  }

}
