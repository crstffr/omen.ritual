
import { MidiIO } from './classes/LocalMidi';
import { Pattern } from './classes/Pattern';
import { Song } from './classes/Song';

import { PatternModes } from './classes/PatternModes';

if (!MidiIO.connect({
  input:  'MIDI4x4 Midi In 1',
  output: 'MIDI4x4 Midi Out 1'
})) process.exit(1);

const MySong = new Song({
  channel: 14
});

MidiIO.onMessage(msg => {

  switch (msg.type) {
    case 'Start':
      return MySong.play();

    case 'Stop':
      return MySong.stop();
  }

  if (msg.type === 'TimingClock') return;
  if (msg.type === 'Start') return MySong.play();
  if (msg.type === 'Stop')  return MySong.stop();
  // console.log(msg);
});

MySong.addPattern(new Pattern({
  channel: 2,
  autoPlay: true,
  mode: PatternModes.LOOP,
  file: 'midi/01.mid',
}));
