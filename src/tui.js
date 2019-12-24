import c from 'chalk';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { log } from './utils/log';

import { Events } from './classes/Events';
import { MidiIO } from './classes/LocalMidi';
import { Song } from './classes/Song';
import { Pattern } from './classes/Pattern';
import { Previewer } from './classes/Previewer';
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
})) { console.log('UNABLE TO CONNECT'); process.exit(1); }

const savedSong = SaveFiles.loadLastSong();

const song = (savedSong)
  ? Song.load(savedSong)
  : new Song();

Previewer.setSong(song);

const list = new PatternList({song});

song.on('touched', () => {
  MainView.setTitleDirty();
});

MainView.screen.key(['C-s'], () => {
  SaveFiles.saveSong(song);
  MainView.setTitleClean();
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

