import path from 'path';
import {EventEmitter} from 'events';
import { Player } from 'midi-player-js';
import { MidiIO } from './LocalMidi';

import { log } from '../utils/log';
import { absFromRoot } from '../utils/root';

import { PatternModes } from './PatternModes';
import { PatternTypes } from './PatternTypes';

export class Pattern extends EventEmitter {

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
  isPlaying = false;

  /** @type {boolean} */
  isPlayOnce = false;

  /** @type {*} */
  openNotes = {};

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

    super();

    const {
      active    = true,
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
    this.padEnd = padEnd;
    this.padStart = padStart;
    this.tempo = tempo;
    this.transpose = transpose;
    this.trigNote = trigNote;
    this.type = type;

    this.player = new Player(this.onPatternEvents);
    this.player.on('endOfFile', this.onPatternEnd);
    this.player.sampleRate = 0;

    this.loadFile(this.file);
  }

  destroy = () => {
    this.player.stop();
    for (let i in this) {
      if (!this.hasOwnProperty(i)) continue;
      delete this[i];
    }
  };

  /**
   *
   * @returns {PatternOpts}
   */
  exportData = () => ({
    active:     this.active,
    autoPlay:   this.autoPlay,
    channel:    this.channel,
    file:       this.file,
    mode:       this.mode,
    padEnd:     this.padEnd,
    padStart:   this.padStart,
    tempo:      this.tempo,
    transpose:  this.transpose,
    trigNote:   this.trigNote,
    type:       this.type
  });

  /**
   * @param {string} val
   * @returns {boolean}
   */
  loadFile = (val) => {
    if (!val) return;
    if (val !== this.file) this.touch();
    try {
      this.file = val;
      this.player.loadFile(this.file);
      return true;
    } catch (e) {
      this.file = '';
      return false;
    }
  };

  /**
   * @param {boolean} val
   */
  setAutoPlay = (val) => {
    if (val !== this.autoPlay) this.touch();
    this.autoPlay = val;
  };

  /**
   * @param {boolean} val
   */
  setActive = (val) => {
    if (val !== this.active) this.touch();
    this.active = val;
  };

  /**
   * @param {number} val
   */
  setChannel = (val) => {
    if (val !== this.channel) this.touch();
    this.channel = val;
  };

  /**
   * @param {number} val
   */
  setIndex = (val) => {
    this.index = val;
  };

  /**
   * @param {PatternMode} val
   */
  setMode = (val) => {
    if (val !== this.mode) this.touch();
    this.mode = val;
  };

  /**
   * @param {number} val
   */
  setTempo = (val) => {
    this.tempo = val;
    this.player.setTempo(val);
  };

  /**
   * @param {number} val
   */
  setTrigNote = (val) => {
    if (val !== this.trigNote) this.touch();
    this.trigNote = val;
  };

  /**
   * @param {PatternType} val
   */
  setType = (val) => {
    if (val !== this.type) this.touch();
    this.type = val;
  };

  /**
   *
   */
  play = (immediate) => {
    if (!this.file) return false;
    setTimeout(() => {
      if (this.player.isPlaying()) return;
      this.player.play();
      this.isPlaying = true;
      this.emit('play');
    }, immediate ? 0 : this.padStart);
    return true;
  };

  playOnce = (immediate) => {
    this.isPlayOnce = true;
    this.play(immediate);
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
    this.emit('stop');
  };

  /**
   *
   */
  touch = () => {
    this.emit('touched');
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

      if (this.isPlayOnce) {
        this.isPlayOnce = false;
        return;
      }

      if (this.mode === PatternModes.LOOP) {
        setTimeout(() => this.play(true), 0);
      }

    }, this.padEnd);
  }

}
