import path from 'path';
import { Player } from 'midi-player-js';
import { MidiIO } from './LocalMidi';
import { absFromRoot } from '../utils/root';

import { PatternModes } from './PatternModes';
import { PatternTypes } from './PatternTypes';

export class Pattern {

  constructor (opts) {

    const {
      active    = true,
      autoPlay  = true,
      channel   = 1,
      file      = '',
      mode      = PatternModes.LOOP,
      padEnd    = 0,
      padStart  = 0,
      tempo     = 0,
      trigNote  = 0,
      transpose = 0,
      type      = PatternTypes.KEYS,
    } = opts;

    /** @type {boolean} */
    this.active = active;

    /** @type {boolean} */
    this.autoPlay = autoPlay;

    /** @type {number} */
    this.channel = channel;

    /** @type {string} */
    this.file = file;

    /** @type {TrackMode} */
    this.mode = mode;

    /** @type {number} */
    this.padEnd = padEnd;

    /** @type {number} */
    this.padStart = padStart;

    /** @type {number} */
    this.tempo = tempo;

    /** @type {number} */
    this.trigNote = trigNote;

    /** @type {number} */
    this.transpose = transpose;

    /** @type {TrackType} */
    this.type = type;

    //
    // Below are state
    //

    /** @type {boolean} */
    this.isPlaying = false;

    /** @type {*} */
    this.openNotes = {};

    //
    // Below are instantiations
    //

    /** @type {module:midi-player-js.MidiInternal.Player} */
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
    this.player.loadFile(absFromRoot(path.join('midi', file)));
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
   * @param {TrackMode} mode
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
   * @param {TrackType} type
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
