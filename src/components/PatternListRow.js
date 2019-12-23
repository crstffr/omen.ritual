import c from 'chalk';
import path from 'path';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { clone } from '../utils/clone';
import { log } from '../utils/log';
import { uid } from '../utils/uid';

import { MainView } from '../views/MainView';
import { PatternModesList } from '../classes/PatternModes';
import { ModalFormSingleInput } from './ModalFormSingleInput';
import { ModalFormFilePicker } from './ModalFormFilePicker';
import { absFromRoot } from '../utils/root';

const ChanModal = new ModalFormSingleInput({
  label: 'Channel',
  valueType: 'number',
  valueMax: 16,
  valueMin: 1,
  inputWidth: 3
});

const ModeModal = new ModalFormSingleInput({
  label: 'Mode',
  valueType: 'options',
  valueOpts: PatternModesList,
  inputWidth: 5
});

const TrigModal = new ModalFormSingleInput({
  label: 'Trigger',
  valueType: 'number',
  valueMax: 127,
  valueMin: 0,
  inputWidth: 4
});

const FileModal = new ModalFormFilePicker({
  label: 'File',
  baseDir: absFromRoot('/midi'),
  validFileExts: ['.mid', '.midi']
});

export class PatternListRow {

  /** @type {number} */
  index;

  /** @type {number} */
  id;

  /** @type {Widgets.FormElement} */
  node;

  /** @type {Pattern} */
  pattern;

  /** @type {Widgets.ButtonElement[]} */
  cols;

  /**
   *
   * @param {Pattern} pattern
   * @param {number} index
   */
  constructor (pattern, index = 0) {

    this.id = uid();
    this.index = index;
    this.pattern = pattern || {};

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
        button.key(['delete'], this.rowDelete);
        button.key(['i'], this.rowInsert);
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
    this.cols.forEach(col => col.destroy());
    this.node.destroy();
  };

  render = () => {
    MainView.screen.render();
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
        ChanModal.setValue(this.pattern.channel);
        ChanModal.open((result) => {
          const chan = Number(result.input);
          if (!ChanModal.validate(chan)) return false;
          this.pattern.setChannel(chan);
          this.updateProps();
          return true;
        });
        break;

      case 'FILE':
        FileModal.setValue(this.pattern.file);
        FileModal.open((result) => {
          const file = result.input;
          if (!FileModal.validate(file)) return false;
          this.pattern.loadFile(file);
          this.updateProps();
          return true;
        });
        break;

      case 'MODE':
        ModeModal.setValue(this.pattern.mode);
        ModeModal.open((result) => {
          const mode = result.input;
          if (!ModeModal.validate(mode)) return false;
          this.pattern.setMode(mode);
          this.updateProps();
          return true;
        });
        break;

      case 'TRIG':
        TrigModal.setValue(this.pattern.trigNote);
        TrigModal.open((result) => {
          const note = Number(result.input);
          if (!TrigModal.validate(note)) return false;
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
          val = String(`${this.index + 1}`).padEnd(2);
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
