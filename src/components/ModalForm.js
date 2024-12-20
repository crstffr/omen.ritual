import c from 'chalk';
import blessed from 'blessed';
import { log } from '../utils/log';
import { MainView } from '../views/MainView';

export class ModalForm {

  /** @type {boolean} */
  isOpen = false;

  /** @type {Widgets.BoxElement} */
  node;

  /** @type {Widgets.FormElement} */
  form;

  constructor (opts) {

    const {
      label = 'Modal',
      width = 'shrink',
      height = 'shrink'
    } = opts;

    this.node = blessed.box({
      width: '100%-2',
      height: '100%-2',
      style: {
        bg: 'black',
        transparent: true
      }
    });

    this.node.on('opened', () => this.focus());

    this.form = blessed.form({
      parent: this.node,
      keys: true,
      shrink: true,
      width: width,
      height: height,
      padding: 1,
      top: 'center',
      left: 'center',
      autoNext: false,
      label: c.greenBright(' ' + label + ' '),
      border: 'line',
      style: {
        fg: 'black',
        bg: 'normal',
        border: {
          fg: 'white',
        }
      }
    });

  }

  render = () => {
    MainView.screen.render();
  };

  focus = () => {
    let focused = false;
    this.form.children.forEach(child => {
      if (!child.options.shouldFocus) return;
      focused = true;
      child.focus();
    });
    if (!focused) this.form.focus();
  };

  open = (onSubmit, onCancel) => {

    this.form.on('cancel', (data) => {
      if (typeof onCancel === 'function') {
        if (!onCancel(data)) {
          this.focus();
          return;
        }
      }
      this.close();
    });

    this.form.on('submit', (data) => {
      if (typeof onSubmit === 'function') {
        if (!onSubmit(data)) {
          this.focus();
          return;
        }
      }
      this.close();
    });

    MainView.openModal(this, onSubmit, onCancel);
  };

  close = () => {
    MainView.closeModal(this);
  };

}
