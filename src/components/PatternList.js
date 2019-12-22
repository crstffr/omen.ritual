import c from 'chalk';
import assert from 'assert';
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

  /** @type {Song} */
  song;

  /**
   *
   * @param {PatternListOpts} opts
   */
  constructor (opts) {

    assert.ok(opts !== undefined, 'PatternListOpts are required');

    this.focusedCol = 0;
    this.focusedRow = 0;
    this.rows = [];
    this.song = opts.song;

    this.node = blessed.box({
      keys: true,
      shouldFocus: true,
      width: '100%-3',
      height: 'shrink',
      left: 1,
    });

    this.song.on('updated', this.drawPatternRows);

    // Focus on the first row/col on initial render

    this.node.on('shown', () => {
      if (!this.rows[0]) return this.insertPattern();
      this.rows[0].colFocus(0);
    });

  }

  drawPatternRows = () => {

    this.rows.forEach((row, i) => {
      row.destroy();
      delete row[i];
    });

    this.rows.length = 0;

    this.song.patterns.forEach(this.renderPatternRow);

    this.render();

  };

  /**
   *
   * @param {Pattern} pattern
   * @param {number} i
   */
  renderPatternRow = (pattern, i) => {

    const row = new PatternListRow(pattern, i);

    this.rows.push(row);
    row.node.top = this.rows.length;

    row.node.on('selectRow', () => {
      this.rows[this.focusedRow].colFocus(0);
      this.focusedCol = 0;
    });

    row.node.on('deleteRow', (i) => this.removePattern(i));
    row.node.on('insertRow', (i) => this.insertPattern(i));

    // attach the row to the list box
    this.node.append(row.node);

  };

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
    
    row.node.on('selectRow', () => {
      this.rows[this.focusedRow].colFocus(0);
      this.focusedCol = 0;
    });

    row.node.on('deleteRow', (i) => this.removePattern(i));
    row.node.on('insertRow', (i) => this.insertPattern(i));

    // attach the row to the list box
    this.node.append(row.node);

    return row;
  }

  removePattern(i) {
    this.song.removePattern(i);
    if (this.song.patterns.length === 0) {
      this.insertPattern();
      return;
    }
    this.selectPattern(i > 0 ? i - 1 : 0);
  }

  insertPattern() {
    const pattern = this.song.addPattern();
    this.selectPattern(pattern.index);
  }

  selectPattern = (i) => {
    this.focusedRow = i;
    this.focusedCol = 0;
    this.rows[i].colFocus(0);
  };

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

  render = () => {
    MainView.screen.render();
  }

}
