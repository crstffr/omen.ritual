import midi from 'midi';
import { log } from '../utils/log';

import {
  DecodeStream,
  EncodeStream
} from '@lachenmayer/midi-messages';

export class LocalMidi {

  constructor () {

    this.cListeners = [];
    this.clockTempo = 0;
    this.clockTicks = 0;
    this.clockTimer = 0;

    this.input  = new midi.Input();
    this.output = new midi.Output();

    // Do not ignore MIDI TimingClock messages
    this.input.ignoreTypes(true, false, true);

    /** @type {EncodeStream} */
    this.encoder = new EncodeStream();
    this.encoder.pipe(midi.createWriteStream(this.output));

    /** @type {DecodeStream} */
    this.decoder = new DecodeStream();
    midi.createReadStream(this.input).pipe(this.decoder);

    this.onMessage((msg) => {
      if (msg.type === 'Stop') this.clockReset();
      if (msg.type !== 'TimingClock') return;
      if (!this.clockTimer) return this.clockTimer = Date.now();
      if (++this.clockTicks % 4 === 0) this.calcTempo();
      if (this.clockTicks === 96) this.broadcastTempo();
    });

  }

  clockReset() {
    this.clockTimer = 0;
    this.clockTicks = 0;
  }

  calcTempo() {
    const now = Date.now();
    const then = this.clockTimer;
    const tempo = Number((10000 / (now - then)).toFixed(2));
    this.clockTimer = now;
    this.clockTempo = tempo;
  }

  broadcastTempo() {
    this.cListeners.forEach(cb => cb(this.clockTempo));
    this.clockTicks = 1;
  }

  /**
   *
   * @param {string} input
   * @param {string} output
   */
  connect({input = '', output = ''}) {

    let inputConnected  = false;
    let outputConnected = false;

    if (input) {
      Array(this.input.getPortCount()).fill().forEach((_, port) => {
        // console.log(port, this.input.getPortName(port));
        const name = this.input.getPortName(port);
        if (name !== input) return;

        console.log('Opening MIDI In: ', port, name);
        this.input.openPort(port);
        inputConnected = true;
      });
      if (!inputConnected) console.log('Unable to find MIDI input: ', input);
    }

    if (output) {
      Array(this.output.getPortCount()).fill().forEach((_, port) => {
        // console.log(port, this.output.getPortName(port));
        const name = this.output.getPortName(port);
        if (name !== output) return;

        console.log('Opening MIDI Out:', port, name);
        this.output.openPort(port);
        outputConnected = true;
      });
      if (!outputConnected) console.log('Unable to find MIDI output:', output);
    }

    return inputConnected || outputConnected;
  }

  /**
   *
   */
  disconnect() {
    try {
      this.input.closePort();
      this.output.closePort();
    } catch(e) {}
  }

  /**
   * @param {function} cb
   * @returns {function} unwatch
   */
  onMessage = (cb) => {
    this.decoder.on('data', cb);
    return () => this.decoder.removeListener('data', cb);
  };

  /**
   * @param {function} cb
   * @returns {function} unwatch
   */
  onTempoChange = (cb) => {
    if (typeof cb !== 'function') return;
    this.cListeners.push(cb);
  };

  /**
   *
   * @param msg
   */
  sendMessage = (msg) => {
    this.output.sendMessage(msg);
  }

}


export const MidiIO = new LocalMidi();
