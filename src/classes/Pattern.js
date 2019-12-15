import {  } from '';
import { Player } from 'midi-player-js';

import { PatternModes } from './PatternModes';
import { PatternTypes } from './PatternTypes';

export class Pattern {

  constructor (opts) {

    const {
      channel,
      file,
      mode,
      tempo,
      trigger,
      type,
    } = opts;

    /** @type {boolean} */
    this.active = true;

    /** @type {number} */
    this.channel = channel || 1;

    /** @type {string} */
    this.file = file || '';

    /** @type {TrackMode} */
    this.mode = mode || PatternModes.LOOP;

    /** @type {number} */
    this.tempo = tempo || 120;

    /** @type {number} */
    this.trigger = trigger || 35;

    /** @type {TrackType} */
    this.type = type || PatternTypes.DRUM;

    /** @type {module:midi-player-js.MidiInternal.Player} */
    this.player = new Player(this.onPlayerEvents);

    if (file) {
      this.player.loadFile(file);
    }

  }

  /**
   * @param {string} file
   */
  loadFile = (file) => {
    this.file = file;
    this.player.loadFile(file);
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
   * @param {number} trigger
   */
  setTrigger = (trigger) => {
    this.trigger = trigger;
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
    this.player.play();
  };

  /**
   *
   */
  stop = () => {
    this.player.stop();
  };

  /**
   *
   * @param event
   */
  onPlayerEvents = (event) => {

    console.log(event);

  }

}
