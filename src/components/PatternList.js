import c from 'chalk';
import blessed from 'blessed';
import contrib from 'blessed-contrib';

import { MainView } from '../views/MainView';
import { Pattern } from '../classes/Pattern';
import { PatternListRow } from './PatternListRow';
import { ModalFormSingleInput } from './ModalFormSingleInput';
import { clone } from '../utils/clone';
import { log } from '../utils/log';

export class PatternList {

  /** @type {number} */
  focusedCol;

  /** @type {number} */
  focusedRow;

  /** @type {Widgets.BoxElement} */
  node;

  /** @type {PatternListRow[]} */
  rows;

  constructor (props) {

    this.rows = [];
    this.focusedCol = 0;
    this.focusedRow = 0;

    this.node = blessed.box({
      keys: true,
      shouldFocus: true,
      width: '100%-3',
      height: 'shrink',
      left: 1,
    });

    // Focus on the first row/col on initial render

    this.node.on('shown', () => {
      if (!this.rows[0]) return;
      if (!this.rows[0].cols[0]) return;
      this.rows[0].colFocus(0);
    });

    this.node.key(['up'], () => {
      log('UPPP');
    });

  }

  /**
   *
   * @param {Pattern} pattern
   * @returns {PatternListRow}
   */
  addPattern(pattern) {

    const index = this.rows.length;
    const row = new PatternListRow(pattern, index);

    this.rows.push(row);
    row.node.top = this.rows.length;

    // bubble up the "rerender" event to the parent
    row.node.on('rerender', () => this.rerender());

    row.node.on('selectRow', () => {
      this.rows[this.focusedRow].colFocus(0);
      this.focusedCol = 0;
    });

    row.node.on('deleteRow', (index) => {
      log('delete row', index);
    });

    row.node.on('insertRow', (index) => {
      this.insertPattern();
    });

    // attach the row to the list box
    this.node.append(row.node);

    return row;
  }

  insertPattern() {
    const row = this.addPattern(new Pattern());

    const prevTrig = this.rows[row.index - 1].pattern.trigNote;
    row.pattern.setTrigNote(prevTrig + 2);
    row.updateProps();

    this.rows[row.index].colFocus(0);
    this.focusedRow = row.index;
    this.focusedCol = 0;
    this.rerender();
  }

  cursorUp = () => {
    if (this.focusedRow === 0) return;
    this.rows[--this.focusedRow].colFocus(this.focusedCol);
  };

  cursorDown = () => {
    if (this.focusedRow === this.rows.length - 1) return;
    this.rows[++this.focusedRow].colFocus(this.focusedCol);
  };

  cursorLeft = () => {
    if (this.focusedCol === 0) return;
    this.rows[this.focusedRow].colFocus(--this.focusedCol);
  };

  cursorRight = () => {
    if (this.focusedCol === this.rows[this.focusedRow].cols.length - 1) return;
    this.rows[this.focusedRow].colFocus(++this.focusedCol);
  };

  rerender = () => {
    this.node.emit('rerender');
  }

}
