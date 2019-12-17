
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

MySong.addPattern(new Pattern({
  channel: 2,
  trigNote: 36,
  autoPlay: true,
  mode: PatternModes.LOOP,
  file: 'midi/chords/03.mid',
}));
