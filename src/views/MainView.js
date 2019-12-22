import c from 'chalk';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { log } from '../utils/log';

export const MainView = new (class {

  /** @type {Widgets.BlessedElement} */
  node;

  /** @type {BlessedContrib.grid} */
  grid;

  /** @type {Widgets.Screen} */
  screen;

  constructor () {

    this.screen = blessed.screen({
      smartCSR: true,
      autoPadding: true,
    });

    this.grid = new contrib.grid({
      screen: this.screen,
      rows: 12,
      cols: 12,
    });

    this.node = this.grid.set(0, 0, 12, 12, blessed.box, {
      label: c.green(' OMEN RITUAL '),
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      style: {
        fg: 'green',
        border: {
          fg: 'green',
        }
      }
    });

  }

  clear = () => {
    this.node.children.forEach((child, i) => {
      if (i === 0) return;
      this.node.remove(child);
    })
  };

  /**
   *
   * @param {Widgets.BlessedElement} node
   */
  show = (node) => {
    this.clear();
    this.node.append(node);
    node.emit('shown');
    if (node.options.shouldFocus) node.focus();
    this.screen.render();
  };

  /**
   *
   * @param {Widgets.BlessedElement} node
   */
  append = (node) => {
    this.node.append(node);
    if (node.options.shouldFocus) node.focus();
    this.screen.render();
    node.emit('shown');
  };

  /**
   *
   * @param {ModalForm} modal
   * @param {function} onSubmit
   * @param {function} onCancel
   */
  openModal = (modal, onSubmit, onCancel) => {
    this.screen.saveFocus();
    this.node.append(modal.node);

    /*
    const closeModal = this.closeModal.bind(null, modal);

    modal.form.on('cancel', (data) => {
      if (typeof onCancel === 'function') {
        if (!onCancel(data)) return;
      }
      closeModal();
    });

    modal.form.on('submit', (data) => {
      if (typeof onSubmit === 'function') {
        if (!onSubmit(data)) return;
      }
      closeModal();
    });
    */

    this.screen.render();
    modal.node.emit('opened');
  };

  closeModal = (modal) => {
    modal.node.destroy();
    modal.form.removeAllListeners();
    this.screen.restoreFocus();
    this.screen.render();
  }

})();
