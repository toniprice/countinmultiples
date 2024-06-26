// =============================================================================
/*! countinmultiples */
/*! author: Toni Price (https://toni.rbind.io) */
// =============================================================================

import { Level, ctxt, log } from './logging.js';

import { State } from './state.js';

/**
 * Class to handle media queries.
 * @typedef {Object} MediaHandler
 */
export class MediaHandler {

  #mediaThresholds = null;

  #numGrid = null;

  /**
   * Constructor for MediaHandler class.
   *
   * @param {NumberGrid} numGrid - The NumberGrid object for which to handle
   *   media queries.
   */
  constructor(numGrid) {

    this.#numGrid = numGrid;

    this.#mediaThresholds = {
      'grid--tiny-1'       : null,
      'grid--diminutive-1' : window.matchMedia('(min-width: 451px)'),
      'grid--small-1'      : window.matchMedia('(min-width: 751px)'),
      'grid--medium-1'     : window.matchMedia('(min-width: 1051px)'),
      'grid--large-1'      : window.matchMedia('(min-width: 1351px)'),
    };
  }

  /**
   * Sets the maximum number of columns according to the grid's current size.
   *
   * @param {string} currSize Media size name, e.g. 'grid--large'
   */
  #setMaxNCol = (currSize) => {

    if (!currSize) {
      log(Level.Debug, `-> Handling media query: curr size is 'null'`, ctxt());
      return;
    }

    log(Level.Debug, `-> Handling media query for: '${currSize}'`, ctxt());

    switch (currSize) {
    case 'grid--tiny-1':
      this.#numGrid.maxNCol = 6;
      break;
    case 'grid--diminutive-1':
      this.#numGrid.maxNCol = 8;
      break;
    case 'grid--small-1':
      this.#numGrid.maxNCol = 10;
      break;
    case 'grid--medium-1':
      this.#numGrid.maxNCol = 12;
      break;
    case 'grid--large-1':
      this.#numGrid.maxNCol = 25;
      break;
    default:
      break;
    }
  };

  /**
   * Sets the appropriate CSS class according to the grid's current size.
   *
   * @param {string} currSize Media size name, e.g. 'grid--large'
   */
  #setGridClass = (currSize) => {

    if (!currSize) {
      log(Level.Debug, `-> Handling media query: curr size is 'null'`, ctxt());
      return;
    }

    log(Level.Debug, `-> Handling media query for: '${currSize}'`, ctxt());

    // Remove any previously-applied media size class
    for (const sz of Object.keys(this.#mediaThresholds)) {
      // Note: No error will be thrown if the element does not have this class
      // See
      // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/remove
      // [viewed 26jan24]
      this.#numGrid.grid.classList.remove(sz);
    }
    // Add the current size class
    this.#numGrid.grid.classList.add(currSize);
  };

  /**
   * Handles a media query event by establishing the current grid size and
   *   resizing the grid for the current media.
   *
   * @param {boolean} resetHighlights - Whether to reset any potential
   *   highlights. Defaults: false
   */
  handleResize = (resetHighlights) => {

    resetHighlights = resetHighlights || false;

    let size = null;
    for (const [sz, mq] of Object.entries(this.#mediaThresholds)) {
      // Note that the smallest window size threshold is associated with a
      // media query of null
      if (mq == null || mq.matches) {
        size = sz;
      }
    }

    log(Level.Debug, `Media query triggered for size: '${size}'`, ctxt());

    this.#setMaxNCol(size);
    // TODO: Are the classes set in #setGridClass necessary/used at all -
    // possibly not? Remove if not needed.
    this.#setGridClass(size);

    // Reset the grid dimensions with current values of UI inputs
    this.#numGrid.resetGridDims();

    if (resetHighlights) {
      this.#numGrid.clearHighlights(State.Clear);
    }
  };

  /**
   * Adds media query listeners for the defined thresholds.
   */
  addMediaQueryListeners = () => {
    // See
    // A Thorough Guide to Using Media Queries in JavaScript
    // Craig Buckler
    // January 24, 2023
    // https://kinsta.com/blog/javascript-media-query/
    // [viewed 26jan24]

    // Media query change events
    for (const mq of Object.values(this.#mediaThresholds)) {
      if (mq) {
        mq.addEventListener('change', this.handleResize);
      }
    }
  };
}

// =============================================================================
