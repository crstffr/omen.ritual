import fs from 'fs';
import { stringify } from 'flatted/esm'

export function log(...args) {

  const str = args.map(arg => {
    let out = '';
    if (arg === undefined) return 'undefined';
    if (arg.toString) out = arg.toString();
    if (out && out !== '[object Object]') return out;
    return typeof arg + ' ' + stringify(arg, null, 4);
  }).join(' ');

  fs.writeFile('./debug.log', str + '\n', { flag: 'a+' }, err => {});

}
