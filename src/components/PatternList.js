import c from 'chalk';
import assert from 'assert';
import blessed from 'blessed';
import contrib from 'blessed-contrib';

import { MainView } from '../views/MainView';
import { Events } from '../classes/Events';
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
      this.emitPatternSelected();
    });

    this.drawPatternRows();

  }

  drawPatternRows = () => {
    // Destroy all rows and empty the array
    this.rows.forEach(row => row.destroy());
    this.rows.length = 0;

    // Create all the rows from scratch
    this.song.patterns.forEach(this.createRowFromPattern);
    this.render();
  };

  /**
   *
   * @param {Pattern} pattern
   * @param {number} i
   */
  createRowFromPattern = (pattern, i) => {

    const row = new PatternListRow(this.song, pattern, i);

    this.rows.push(row);
    row.node.top = this.rows.length;

    row.node.on('selectPattern', (i) => this.selectPattern(i));
    row.node.on('removePattern', (i) => this.removePattern(i));
    row.node.on('insertPattern', (i) => this.insertPattern(i));

    // attach the row to the list box
    this.node.append(row.node);

  };

  removePattern = (i) => {
    this.song.removePattern(i);
    if (this.song.patterns.length === 0) {
      this.insertPattern();
      return;
    }
    const len = this.song.patterns.length;
    this.selectPattern(i < len ? i : len - 1);
  };

  insertPattern = (i) => {
    const pattern = this.song.addPattern();
    this.selectPattern(pattern.index);
  };

  selectPattern = (i) => {
    this.focusedRow = i;
    this.focusedCol = 0;
    this.rows[i].colFocus(0);
    this.emitPatternSelected();
  };

  /**
   * @returns {Pattern}
   */
  getSelectedPattern = () => {
    return this.song.patterns[this.focusedRow];
  };

  emitPatternSelected = () => {
    Events.emit('patternSelected', this.getSelectedPattern());
  };

  cursorUp = () => {
    if (this.focusedRow === 0) return;
    this.rows[--this.focusedRow].colFocus(this.focusedCol);
    this.emitPatternSelected();
  };

  cursorDown = () => {
    if (this.focusedRow === this.rows.length - 1) return;
    this.rows[++this.focusedRow].colFocus(this.focusedCol);
    this.emitPatternSelected();
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
