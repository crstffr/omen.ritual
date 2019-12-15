import midi from 'midi';

import {
  DecodeStream,
  EncodeStream
} from '@lachenmayer/midi-messages';

export class LocalMidi {

  /**
   *
   * @param {string} input
   * @param {string} output
   */
  constructor ({input = '', output = ''}) {

    this.clockTempo = 0;
    this.clockTicks = 0;
    this.clockTimer = Date.now();
    this.cListeners = [];

    this.input  = new midi.Input();
    this.output = new midi.Output();

    this.connect({input, output});
    this.input.ignoreTypes(true, false, true);

    /** @type {EncodeStream} */
    this.encoder = new EncodeStream();
    this.encoder.pipe(midi.createWriteStream(this.output));

    /** @type {DecodeStream} */
    this.decoder = new DecodeStream();
    midi.createReadStream(this.input).pipe(this.decoder);

    this.onMessage((msg) => {
      if (msg.type !== 'TimingClock') return;
      if (++this.clockTicks === 24) this.calcTempo();
    });

  }

  calcTempo() {
    const now = Date.now();
    const then = this.clockTimer;
    const tempo = Math.floor(60000 / (now - then));
    if (tempo !== this.clockTempo) this.cListeners.forEach(cb => cb(tempo));
    this.clockTicks = 0;
    this.clockTimer = now;
    this.clockTempo = tempo;
  }

  /**
   *
   * @param {string} input
   * @param {string} output
   */
  connect({input = '', output = ''}) {
    if (input) {
      Array(this.input.getPortCount()).fill().forEach((_, port) => {
        // console.log(port, this.input.getPortName(port));
        const name = this.input.getPortName(port);
        if (name === input) {
          console.log('Opening MIDI In: ', port, name);
          this.input.openPort(port);
        }
      });
    }
    if (output) {
      Array(this.output.getPortCount()).fill().forEach((_, port) => {
        // console.log(port, this.output.getPortName(port));
        const name = this.output.getPortName(port);
        if (name === output) {
          console.log('Opening MIDI Out:', port, name);
          this.output.openPort(port);
        }
      });
    }
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
    return this.decoder.on('data', cb);
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
