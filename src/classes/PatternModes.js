/**
 * Enum for Track Modes
 *
 * @readonly
 * @typedef {string} TrackMode
 * @enum {TrackMode}
 */
export const PatternModes = {

  LOOP: 'LOOP',

  ONCE: 'ONCE',

  STEP: 'STEP',

  TOGL: 'TOGL',

  TRIG: 'TRIG'

};

/**
 *
 * @type {(PatternModes|TrackMode)[]}
 */
export const PatternModesList = [
  PatternModes.LOOP,
  PatternModes.ONCE
];
