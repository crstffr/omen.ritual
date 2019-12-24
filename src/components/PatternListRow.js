import c from 'chalk';
import path from 'path';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { clone } from '../utils/clone';
import { log } from '../utils/log';
import { uid } from '../utils/uid';

import { Events } from '../classes/Events';
import { MainView } from '../views/MainView';
import { PatternModesList } from '../classes/PatternModes';
import { ModalFormSingleInput } from './ModalFormSingleInput';
import { ModalFormFilePicker } from './ModalFormFilePicker';
import { absFromRoot } from '../utils/root';

import { PatternChanModal } from '../modals/PatternChanModal';
import { PatternFileModal } from '../modals/PatternFileModal';
import { PatternModeModal } from '../modals/PatternModeModal';
import { PatternTrigModal } from '../modals/PatternTrigModal';

export class PatternListRow {

  /** @type {Widgets.ButtonElement[]} */
  cols;

  /** @type {number} */
  index;

  /** @type {number} */
  id;

  /** @type {Widgets.FormElement} */
  node;

  /** @type {Pattern} */
  pattern;

  /** @type {Song} */
  song;

  /**
   *
   * @param {Song} song
   * @param {Pattern} pattern
   * @param {number} index
   */
  constructor (song, pattern, index = 0) {

    this.id = uid();
    this.index = index;
    this.pattern = pattern || {};
    this.song = song || {};

    this.pattern.on('play', this.updateProps);
    this.pattern.on('stop', this.updateProps);

    this.node = blessed.box({
      keys: true,
      autoNext: true,
      shouldFocus: true,
      width: '100%-2',
      height: 1,
      style: {
        bg: 'normal'
      }
    });

    const opts = {
      keys: true,
      shrink: true,
      width: 'shrink',
      height: 1,
      top: 0,
      padding: {
        left: 0,
        right: 1
      },
      style: {
        fg: 'white',
        bg: 'normal',
        focus: {
          fg: 'black',
          bg: 'green'
        },
      }
    };

    this.cols = [
      blessed.button({
        name: 'ROW',
        ...clone(opts),
        style: {
          focus: {
            fg: 'white'
          }
        }
      }),
      blessed.button({
        name: 'ACTIVE',
        ...clone(opts)
      }),
      blessed.button({
        name: 'FILE',
        ...clone(opts)
      }),
      blessed.button({
        name: 'MODE',
        ...clone(opts)
      }),
      blessed.button({
        name: 'CHAN',
        ...clone(opts)
      }),
      blessed.button({
        name: 'TRIG',
        ...clone(opts)
      }),
      blessed.button({
        name: 'AUTO',
        ...clone(opts)
      }),
    ];

    this.updateProps();

    // Set the left position for each button

    this.cols.reduce((acc, button, i) => {
      button.left = acc + 2;
      return acc + button.content.length + 2;
    }, 0);

    // Iterate over each col and setup button handlers

    this.cols.forEach((button, i) => {

      this.node.append(button);

      button.on('press', () => {
        const prop = this.cols[i].name;
        this.editProp(prop);
      });

      button.key(['escape'], () => {
        if (button.name === 'ROW') return;
        this.node.emit('selectPattern', this.index);
      });

      if (button.name === 'ROW') {
        button.on('focus', this.rowFocus);
        button.on('blur', this.rowBlur);
        button.key(['i'], this.rowInsert);
        button.key(['space'], this.patternPlay);
        button.key(['escape'], this.patternStop);
        button.key(['delete'], this.rowDelete);
        button.key(['enter'], () => this.editProp('FILE'));
        button.key(['a'], () => this.editProp('ACTIVE'));
        button.key(['c'], () => this.editProp('CHAN'));
        button.key(['m'], () => this.editProp('MODE'));
        button.key(['p'], () => this.editProp('AUTO'));
        button.key(['t'], () => this.editProp('TRIG'));
      }

    });

  }

  destroy = () => {
    this.pattern.removeListener('play', this.updateProps);
    this.pattern.removeListener('stop', this.updateProps);
    this.cols.forEach(col => col.destroy());
    this.node.destroy();
  };

  render = () => {
    MainView.screen.render();
  };

  patternPlay = () => {
    if (this.pattern.isPlaying) {
      return this.patternStop();
    }
    this.pattern.play();
    this.updateProps();
  };

  patternStop = () => {
    this.pattern.stop();
    this.updateProps();
  };

  rowFocus = () => {
    this.node.style.bg = 'gray';
    this.cols.forEach(col => {
      col.style.bg = 'gray';
    });
    this.render();
  };

  rowBlur = () => {
    this.node.style.bg = 'normal';
    this.cols.forEach(col => {
      col.style.bg = 'normal';
    });
    this.render();
  };

  rowDelete = () => {
    this.node.emit('removePattern', this.index);
  };

  rowInsert = () => {
    this.node.emit('insertPattern', this.index);
  };

  colFocus = (col) => {
    if (!this.cols[col]) return;
    this.rowBlur();
    this.cols[col].focus();
  };

  editProp = (prop) => {

    switch (prop) {
      case 'ACTIVE':
        this.pattern.setActive(!this.pattern.active);
        this.updateProps();
        break;

      case 'AUTO':
        this.pattern.setAutoPlay(!this.pattern.autoPlay);
        this.updateProps();
        break;

      case 'CHAN':
        PatternChanModal.setValue(this.pattern.channel);
        PatternChanModal.open((result) => {
          const chan = Number(result.input);
          if (!PatternChanModal.validate(chan)) return false;
          this.pattern.setChannel(chan);
          this.updateProps();
          return true;
        });
        break;

      case 'FILE':
        PatternFileModal.setValue(this.pattern.file);
        PatternFileModal.open((result) => {
          const file = result.input;
          if (!PatternFileModal.validate(file)) return false;
          this.pattern.loadFile(file);
          this.updateProps();
          return true;
        });
        break;

      case 'MODE':
        PatternModeModal.setValue(this.pattern.mode);
        PatternModeModal.open((result) => {
          const mode = result.input;
          if (!PatternModeModal.validate(mode)) return false;
          this.pattern.setMode(mode);
          this.updateProps();
          return true;
        });
        break;

      case 'TRIG':
        PatternTrigModal.setValue(this.pattern.trigNote);
        PatternTrigModal.startListeningForMidi(this.song.channel);
        PatternTrigModal.open((result) => {
          const note = Number(result.input);
          if (!PatternTrigModal.validate(note)) return false;
          PatternTrigModal.stopListeningForMidi();
          this.pattern.setTrigNote(note);
          this.updateProps();
          return true;
        });
        break;
    }

  };

  updateProps = () => {
    this.cols.forEach((col) => {
      let val = '';
      switch (col.name) {
        case 'ROW':
          const play = c.red('▶');
          const num = this.index + 1;
          const str = this.pattern.isPlaying ? play : num;
          val = String(str).padEnd(2);
          break;
        case 'ACTIVE':
          val = String(this.pattern.active ? 'ON' : 'OFF').padEnd(3);
          break;
        case 'CHAN':
          val = String(this.pattern.channel).padStart(2, '0');
          break;
        case 'MODE':
          val = String(this.pattern.mode);
          break;
        case 'TRIG':
          val = String(this.pattern.trigNote).padStart(3, '0');
          break;
        case 'AUTO':
          val = String(this.pattern.autoPlay ? 'PLAY' : 'WAIT').padEnd(4);
          break;
        case 'FILE':
          const midiPath = absFromRoot('midi');
          const relativePath = path.relative(midiPath, this.pattern.file);
          val = relativePath.slice(0, 30).padEnd(30);
          break;
      }
      col.setContent(val);
    });

    this.render();
  }

}
