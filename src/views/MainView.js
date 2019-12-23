import c from 'chalk';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { absFromRoot } from '../utils/root';
import { log } from '../utils/log';

export const MainView = new (class {

  /** @type {Widgets.BlessedElement} */
  node;

  /** @type {BlessedContrib.grid} */
  grid;

  /** @type {boolean} */
  isModalOpen;

  /** @type {Widgets.Screen} */
  screen;

  constructor () {

    this.screen = blessed.screen({
      smartCSR: true,
      autoPadding: true,
      warnings: true
    });

    this.grid = new contrib.grid({
      screen: this.screen,
      rows: 12,
      cols: 12,
    });

    this.node = this.grid.set(0, 0, 12, 12, blessed.box, {
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

    this.setTitleClean();
  }

  setTitleClean = () => {
    this.node.setLabel(c.green(' OMEN RITUAL '));
    this.render();
  };

  setTitleDirty = () => {
    this.node.setLabel(c.red(' OMEN RITUAL '));
    this.render();
  };

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
    this.render();
  };

  /**
   *
   * @param {Widgets.BlessedElement} node
   */
  append = (node) => {
    this.node.append(node);
    if (node.options.shouldFocus) node.focus();
    this.render();
    node.emit('shown');
  };

  /**
   *
   */
  render = () => {
    this.screen.render();
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
    this.render();
    modal.node.emit('opened');
    this.isModalOpen = true;
  };

  closeModal = (modal) => {
    modal.node.destroy();
    modal.form.removeAllListeners();
    this.screen.restoreFocus();
    this.render();
    this.isModalOpen = false;
  }

})();
