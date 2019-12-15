import c from 'chalk';
import blessed from 'blessed';
import contrib from 'blessed-contrib';

const screen = blessed.screen({
  smartCSR: true,
  autoPadding: true,
});

const grid = new contrib.grid({
  rows: 12,
  cols: 12,
  screen: screen
});

const box = grid.set(0, 0, 12, 12, blessed.box, {
  label: ' ' + c.red('§') + ' ' + c.green('OMEN RITUAL') + ' ' + c.red('§') + ' ',
  padding: {
    left: 0,
    right: 0,
    top: 1,
    bottom: 1
  },
  style: {
    fg: 'green',
    border: {
      fg: 'green'
    }
  }
});

const table = contrib.table({
  keys: true,
  parent: box,
  fg: 'white',
  selectedFg: 'white',
  selectedBg: 'gray',
  interactive: true,
  columnSpacing: 3,
  columnWidth: [3, 5, 3, 5, 5, 50]
});

const TABLE_DATA = [
  [' *', 'DRUM', '01', 'LOOP', ' 39', 'drums/odd-signatures/dark-glitch'],
  [' *', 'BASS', '06', 'LOOP', ' 41', 'chords/minor/ionic/c1-c2-c1-c3'],
  [' *', 'KEYS', '02', 'STEP', ' 44', 'melodies/minor/c-g-c-f-g-c-g'],
  ['','','','','','']
];

const updateTable = () => {
  table.setData({
    headers: ['  *', ' TYPE', ' CH', ' MODE', ' TRIG', ' FILE'].map(v => c.green(v)),
    data: TABLE_DATA
  });
  screen.render();
};


table.rows.key('a', () => {
  const i = table.rows.selected;
  const val = TABLE_DATA[i][0];
  TABLE_DATA[i][0] = (val === '') ? ' *' : '';
  updateTable();
});

screen.key(['q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

updateTable();
table.focus();

screen.render();
