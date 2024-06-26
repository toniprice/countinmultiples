// =============================================================================
/*! countinmultiples */
/*! author: Toni Price (https://toni.rbind.io) */
// =============================================================================

/**
 * Class to represent possible number grid states.
 * @typedef {Object} State
 */
export const State = Object.freeze({
  Initialise: Symbol('Initialise'),
  Animate:    Symbol('Animate'),
  Stop:       Symbol('Stop'),
  Pause:      Symbol('Pause'),
  Continue:   Symbol('Continue'),
  Complete:   Symbol('Complete'),
  Restart:    Symbol('Restart'),
  Clear:      Symbol('Clear'),
  InputErr:   Symbol('InputErr'),
});

// -----------------------------------------------------------------------------
