import { Player } from 'midi-player-js';
import { absFromRoot } from '../utils/root';

import { PatternModes } from './PatternModes';
import { PatternTypes } from './PatternTypes';

export class Pattern {

  constructor (opts) {

    if (!opts.io) throw new Error('Pattern requires "io" option');

    const {
      active    = true,
      autoPlay  = true,
      channel   = 1,
      file      = '',
      io        = {},
      mode      = PatternModes.LOOP,
      tempo     = 120,
      trigNote  = 36,
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

    /** @type {LocalMidi} */
    this.io = io;

    /** @type {TrackMode} */
    this.mode = mode;

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
    this.setTempo(this.tempo);
    this.io.onTempoChange(this.setTempo);

    console.log(this.player);
    console.log(this.player.getSongTime());

  }

  /**
   * @param {string} file
   */
  loadFile = (file) => {
    if (!file) return;
    this.file = absFromRoot(file);
    this.player.loadFile(this.file);
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
  play = () => {
    if (this.player.isPlaying()) return;
    console.log('PLAY');
    this.player.play();
    this.isPlaying = true;
  };

  /**
   *
   */
  stop = () => {
    this.player.stop();
    this.isPlaying = false;

    // Stop notes that are left open when the file finishes.
    // Not sure why we have to do this manually.  ???

    Object.keys(this.openNotes).forEach((note) => {
      const event = this.openNotes[note];
      this.onPatternEvents({...event, name: 'Note off'});
    });

  };

  trigger = () => {
    if (!this.active) return;
    switch (this.mode) {

      case PatternModes.LOOP:
      case PatternModes.ONCE:

        console.log(this.isPlaying ? 'stop' : 'play');

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
        this.io.encoder.noteOn(this.channel, event.noteNumber, event.velocity);
        console.log('ON', this.channel, event.noteNumber);
        break;

      case 'Note off':
        delete this.openNotes[event.noteNumber];
        this.io.encoder.noteOff(this.channel, event.noteNumber, event.velocity);
        console.log('OFF', this.channel, event.noteNumber);
        break;

      default:
        // console.log(event);
    }

  };

  onPatternEnd = () => {

    console.log('EEEEEEEEENNNNNDDDDDD');
    console.log('EEEEEEEEENNNNNDDDDDD');
    console.log('EEEEEEEEENNNNNDDDDDD');
    console.log('EEEEEEEEENNNNNDDDDDD');
    console.log('EEEEEEEEENNNNNDDDDDD');

    setTimeout(() => {

      this.stop();

      if (this.mode === PatternModes.LOOP) {
        setTimeout(() => this.play(), 0);
      }

    }, 200);

  }

}
