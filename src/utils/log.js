import fs from 'fs';
import { stringify } from 'flatted/esm';

export function log(...args) {

  const str = args.map(arg => {
    let out = '';
    if (arg === undefined) return 'undefined';
    if (arg.toString) out = arg.toString();
    if (out && out !== '[object Object]') return out;
    return JSON.stringify(arg, null, 4);
  }).join(' ');

  fs.writeFile('./debug.log', str + '\n', { flag: 'a+' }, err => {});

}

log.inspect = (something) => {
  log(typeof something);
  for (let i in something) {
    if (!something.hasOwnProperty(i)) continue;
    let val = something[i];
    val = (typeof val === 'object')   ? 'object'   : val;
    val = (typeof val === 'function') ? 'function' : val;
    log(` ${i}:`, val);
  }
};
