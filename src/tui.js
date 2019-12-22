import c from 'chalk';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { log } from './utils/log';

import { Pattern } from './classes/Pattern';
import { PatternModes } from './classes/PatternModes';

import { MainView } from './views/MainView';
import { PatternList } from './components/PatternList';
import { PatternListRow } from './components/PatternListRow';
import { ModalFormSingleInput } from './components/ModalFormSingleInput';
import {absFromRoot} from './utils/root';

try { process.on('uncaughtException', log); } catch(e) { log(e) }

const list = new PatternList();

list.node.on('rerender', () => {
  MainView.screen.render();
});

list.addPattern(new Pattern({
  channel: 2,
  trigNote: 36,
  autoPlay: true,
  mode: PatternModes.LOOP,
  file: absFromRoot('midi/example/zelda.mid'),
}));

list.addPattern(new Pattern({
  channel: 1,
  trigNote: 38,
  autoPlay: true,
  mode: PatternModes.LOOP,
  file: absFromRoot('midi/drums/01.mid'),
}));

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
