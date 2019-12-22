import c from 'chalk';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { log } from './utils/log';

import { MidiIO } from './classes/LocalMidi';
import { Song } from './classes/Song';
import { Pattern } from './classes/Pattern';
import { PatternModes } from './classes/PatternModes';
import { SaveFiles } from './classes/SaveFiles';

import { MainView } from './views/MainView';
import { PatternList } from './components/PatternList';
import { PatternListRow } from './components/PatternListRow';
import { ModalFormSingleInput } from './components/ModalFormSingleInput';
import { absFromRoot } from './utils/root';

try { process.on('uncaughtException', log); } catch(e) { log(e) }

if (!MidiIO.connect({
  input:  'MIDI4x4 Midi In 1',
  output: 'MIDI4x4 Midi Out 1'
})) process.exit(1);

SaveFiles.getSaves();

const MySong = new Song({
  channel: 14
});

const list = new PatternList({
  song: MySong
});

list.node.on('rerender', () => {
  MainView.screen.render();
});

MySong.addPattern({
  channel: 2,
  trigNote: 36,
  autoPlay: true,
  mode: PatternModes.LOOP,
  file: absFromRoot('midi/songs/chopin.mid'),
});

MySong.addPattern({
  channel: 1,
  trigNote: 38,
  autoPlay: true,
  mode: PatternModes.LOOP,
  file: absFromRoot('midi/drums/01.mid'),
});

MainView.screen.key(['up'], () => {
  if (MainView.isModalOpen) return;
  list.cursorUp();
});

MainView.screen.key(['down'], () => {
  if (MainView.isModalOpen) return;
  list.cursorDown();
});

MainView.screen.key(['left', 'S-tab'], () => {
  if (MainView.isModalOpen) return;
  list.cursorLeft();
});

MainView.screen.key(['right', 'tab'], () => {
  if (MainView.isModalOpen) return;
  list.cursorRight();
});

MainView.append(list.node);

MainView.screen.key(['C-q'], () => process.exit(2));
