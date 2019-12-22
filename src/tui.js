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

try { process.on('uncaughtException', log); } catch(e) { log(e) }

const list = new PatternList();

list.node.on('rerender', () => {
  MainView.screen.render();
});

list.node.on('openModal', () => {

});

list.addPattern(new Pattern({
  channel: 2,
  trigNote: 36,
  autoPlay: true,
  mode: PatternModes.LOOP,
  file: 'example/zelda.mid',
}));

list.addPattern(new Pattern({
  channel: 1,
  trigNote: 38,
  autoPlay: true,
  mode: PatternModes.LOOP,
  file: 'drums/01.mid',
}));

const ChanModal = new ModalFormSingleInput({
  label: 'Channel',
  width: 5
});

const TrigModal = new ModalFormSingleInput({
  label: 'Trigger',
  width: 5
});

MainView.screen.key(['up'], () => {
  list.cursorUp();
});

MainView.screen.key(['down'], () => {
  list.cursorDown();
});

MainView.screen.key(['left', 'S-tab'], () => {
  list.cursorLeft();
});

MainView.screen.key(['right', 'tab'], () => {
  list.cursorRight();
});

MainView.append(list.node);

MainView.screen.key(['C-q'], () => process.exit(2));
