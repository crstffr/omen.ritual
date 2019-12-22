import {PatternModes} from '../classes/PatternModes';
import {PatternTypes} from '../classes/PatternTypes';

export class PatternOpts {

  /** @type {boolean} */
  active;

  /** @type {boolean} */
  autoPlay;

  /** @type {number} */
  channel;

  /** @type {string} */
  file;

  /** @type {PatternMode} */
  mode;

  /** @type {number} */
  padEnd;

  /** @type {number} */
  padStart;

  /** @type {number} */
  tempo;

  /** @type {number} */
  trigNote;

  /** @type {number} */
  transpose;

  /** @type {PatternType} */
  type;

}
