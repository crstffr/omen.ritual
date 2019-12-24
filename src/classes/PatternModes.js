/**
 * Enum for Track Modes
 *
 * @readonly
 * @typedef {string} PatternMode
 * @enum {PatternMode}
 */
export const PatternModes = {

  LOOP: 'LOOP',

  ONCE: 'ONCE',

  GATE: 'GATE',

  STEP: 'STEP',

  TOGL: 'TOGL',

  TRIG: 'TRIG'

};

/**
 *
 * @type {(PatternModes|PatternMode)[]}
 */
export const PatternModesList = [
  PatternModes.LOOP,
  PatternModes.ONCE,
  PatternModes.GATE,
];
