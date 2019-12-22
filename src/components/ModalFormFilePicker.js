import path from 'path';
import c from 'chalk';
import blessed from 'blessed';
import { log } from '../utils/log';
import { ModalForm } from './ModalForm';
import { absFromRoot } from '../utils/root';

export class ModalFormFilePicker extends ModalForm {

  /** @type {string} */
  baseDir;

  /** @type {Widgets.FileManagerElement} */
  picker;

  /** @type {string[]} */
  validFileExts;

  constructor (opts) {

    super({
      ...opts,
      height: 20,
      width: '80%',
    });

    const {
      baseDir = absFromRoot(),
      validFileExts = []
    } = opts;

    this.baseDir = baseDir;
    this.validFileExts = validFileExts;

    this.picker = blessed.filemanager({
      keys: true,
      name: 'input',
      parent: this.form,
      shouldFocus: true,
      cwd: this.baseDir,
      top: 0,
      left: 'center',
      width: '100%-6',
      height: 16,
      style: {
        fg: 'green',
        selected: {
          bg: 'green',
          fg: 'black'
        }
      },
      scrollbar: {
        bg: 'white',
        ch: ''
      }
    });

    this.picker.refresh();
    this.picker.on('file', () => this.form.submit());
    this.picker.key('escape', () => this.form.cancel());

    this.picker.key(['home'], () => {
      this.picker.select(0);
      this.rerender();
    });

    this.picker.key(['end'], () => {
      this.picker.select(this.picker.items.length - 1);
      this.rerender();
    });

    this.picker.key(['pageup'], () => {
      this.picker.up(10);
      this.rerender();
    });

    this.picker.key(['pagedown'], () => {
      this.picker.down(10);
      this.rerender();
    });

    this.picker.on('cd', (dir) => {
      const relPath = path.relative(this.baseDir, dir);
      if (relPath === '' || relPath.slice(0,2) === '..') this.gotoBaseDir();
    });


  }

  gotoBaseDir = () => {
    this.picker.reset(this.baseDir, () => {
      this.picker.shiftItem();
      this.rerender();
    });
  };

  setValue = (val) => {
    if (!val) return this.gotoBaseDir();
    const {dir, base} = path.parse(val);
    this.picker.refresh(dir, () => {
      this.picker.items.forEach((item, i) => {
        if (item.content === base) {
          this.picker.select(i);
          this.rerender();
        }
      });
    });
  };

  validate = (val) => {
    const {ext} = path.parse(val);
    if (this.validFileExts.length === 0) return true;
    return this.validFileExts.includes(ext);
  };


}
