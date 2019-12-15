
import { LocalMidi } from './classes/LocalMidi';
import { Pattern } from './classes/Pattern';
import { Song } from './classes/Song';

import { PatternModes } from './classes/PatternModes';

const MyMidi = new LocalMidi({
  input:  'MIDI4x4 Midi In 1',
  output: 'MIDI4x4 Midi Out 1'
});

const MySong = new Song({
  channel: 14,
  io: MyMidi,
});

MyMidi.onMessage(msg => {
  if (msg.type === 'TimingClock') return;
  if (msg.type === 'Start') return MySong.play();
  if (msg.type === 'Stop')  return MySong.stop();
  console.log(msg);
});

MySong.addPattern(new Pattern({
  io: MyMidi,
  channel: 2,
  file: 'midi/chords/v2/Cymatics - MIDI 13 - Amin.mid',
  mode: PatternModes.ONCE,
  autoPlay: true,
}));
