import c from 'chalk';
import blessed from 'blessed';
import { log } from '../utils/log';
import { ModalForm } from './ModalForm';

export class ModalFormSingleInput extends ModalForm {

  /** @type {Widgets.TextboxElement} */
  textbox;

  /** @type {number} */
  valueMax;

  /** @type {number} */
  valueMin;

  /** @type {string[]} */
  valueOpts;

  /** @type {string} */
  valueType;

  constructor (opts) {
    super({
      ...opts,
      height: 5,
      width: opts.inputWidth + 10
    });

    const {
      inputWidth = 10,
      inputValue = '',
      valueMax,
      valueMin,
      valueOpts,
      valueType,
    } = opts;

    this.valueMax = valueMax;
    this.valueMin = valueMin;
    this.valueOpts = valueOpts || [];
    this.valueType = valueType;

    this.textbox = blessed.Textbox({
      parent: this.form,
      keys: true,
      name: 'input',
      top: 'center',
      left: 'center',
      height: 1,
      width: inputWidth,
      value: inputValue,
      shouldFocus: true,
      inputOnFocus: true,
      style: {
        fg: 'green',
        bg: 'black',
        border: {
          fg: 'black',
          bg: 'black'
        }
      }
    });

    this.textbox.key('escape', () => this.form.cancel());
    this.textbox.key('enter',  () => this.form.submit());

    this.textbox.key('up', () => {
      switch (this.valueType) {
        case 'number':
          this.incrementValue();
          break;
        case 'options':
          this.selectPrevOption();
          break;
      }
    });

    this.textbox.key('down', () => {
      switch (this.valueType) {
        case 'number':
          this.decrementValue();
          break;
        case 'options':
          this.selectNextOption();
          break;
      }
    });

  }

  setValue = (val) => {
    this.textbox.setValue(String(val));
  };

  validate = (val) => {
    switch (this.valueType) {
      case 'number':
        if (isNaN(val)) return false;
        if (this.valueMin !== undefined && val < this.valueMin) return false;
        if (this.valueMax !== undefined && val > this.valueMax) return false;
        return true;

      case 'options':
        return this.valueOpts.includes(val);
    }
  };

  decrementValue = () => {
    const val = Number(this.textbox.value) - 1;
    if (!this.validate(val)) return;
    this.setValue(val);
    this.rerender();
  };

  incrementValue = () => {
    const val = Number(this.textbox.value) + 1;
    if (!this.validate(val)) return;
    this.setValue(val);
    this.rerender();
  };

  selectPrevOption = () => {
    let i = this.valueOpts.indexOf(this.textbox.value);
    if (i === 0) i = this.valueOpts.length;
    if (i === -1) i = 1;
    this.setValue(this.valueOpts[--i]);
    this.rerender();
  };

  selectNextOption = () => {
    let i = this.valueOpts.indexOf(this.textbox.value);
    if (i === this.valueOpts.length - 1) i = -1;
    this.setValue(this.valueOpts[++i]);
    this.rerender();
  };


}
