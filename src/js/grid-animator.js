// =============================================================================
/*! countinmultiples */
/*! author: Toni Price (https://toni.rbind.io) */
// =============================================================================

import { Level, ctxt, log } from './logging.js';

import { Config } from './config.js';

import { GridHelpers } from './grid-helpers.js';

import { GridScroller } from './grid-scroller.js';

import { State } from './state.js';

/**
 * Class to handle grid animation, i.e. the animated 'counting along'.
 * @typedef {Object} GridAnimator
 */
export class GridAnimator {

  #numGrid = null;

  #multiple = null;
  #nCell = null;

  #currCell = null;
  // #prevAnimatedCell = null;

  #lastHighlight = null;
  #nextHighlight = null;

  // Note: gridTimer needs to be delcared *before* calling
  // initialiseAnimationVars()
  #gridTimer = null;

  #execInterval = null;

  #gridScroller = null;

  /**
   * Constructor for GridAnimator.
   *
   * @param {NumberGrid} numberGrid The number grid.
   */
  constructor(numberGrid) {
    log(Level.Debug, `-> constructing GridAnimator`, ctxt());

    this.#numGrid = numberGrid;
    // this.#grid = numberGrid.grid;

    this.#multiple = this.#numGrid.multiple;
    this.#nCell = this.#numGrid.nCell;

    // A GridScroller to monitor whether the animated cell is outside of the
    // viewport width and to scroll if so
    this.#gridScroller = new GridScroller();
    this.#gridScroller.initialise(Config.gridId, Config.autoScrollDistance);
  }

  /**
   * Getter for the animation execution interval.
   *
   * @return {number} The animation execution interval in milliseconds.
   */
  get execInterval() {
    return this.#execInterval;
  }

  /**
   * Setter for the animation execution interval.
   *
   * @param {number} num - The animation execution interval in milliseconds.
   */
  set execInterval(num) {
    this.#execInterval = num;
  }

  /**
   * Computes the scale of the animation speed adjusted by the execution
   *   interval range.
   *
   * @param {number} minSpeed - The minimum valid speed (an integer).
   * @param {number} maxSpeed - The maximum valid speed (an integer).
   * @param {number} minExecInterval - The minimum valid animation execution
   *   interval.
   * @param {number} maxExecInterval - The maximum valid animation execution
   *   interval.
   * @return {number} The scale of the animation speed.
   */
  static computeSpeedScale = function(minSpeed, maxSpeed, minExecInterval,
    maxExecInterval) {

    const diff = maxSpeed - minSpeed;
    return (diff / (maxExecInterval - minExecInterval));
  };

  /**
   * Computes the scale of the execution interval adjusted by the animation
   *   speed.
   *
   * @param {number} minSpeed - The minimum valid speed (an integer).
   * @param {number} maxSpeed - The maximum valid speed (an integer).
   * @param {number} minExecInterval - The minimum valid animation execution
   *   interval.
   * @param {number} maxExecInterval - The maximum valid animation execution
   *   interval.
   * @return {number} The scale of the execution interval.
   */
  static computeExecIntervalScale = function(minSpeed, maxSpeed,
    minExecInterval, maxExecInterval) {

    const diff = maxExecInterval - minExecInterval;
    return (diff / (maxSpeed - minSpeed));
  };

  /**
   * Computes the animation speed from the execution interval.
   *
   * @param {number} execInterval - The animation execution interval in
   *   milliseconds.
   * @param {number} minSpeed - The minimum valid speed (an integer).
   * @param {number} maxSpeed - The maximum valid speed (an integer).
   * @param {number} minExecInterval - The minimum valid animation execution
   *   interval.
   * @param {number} maxExecInterval - The maximum valid animation execution
   *   interval.
   * @return {number} The animation speed corresponding to the given execution
   *   interval.
   */
  static computeSpeedFrom = function(execInterval, minSpeed, maxSpeed,
    minExecInterval, maxExecInterval) {

    const execRange = execInterval - minExecInterval;

    const speedScale = GridAnimator.computeSpeedScale(minSpeed, maxSpeed,
      minExecInterval, maxExecInterval);

    const speed = minSpeed + execRange * speedScale;
    const invertedSpeed = maxSpeed - speed + 1;
    return Math.round(invertedSpeed);
  };

  /**
   * Computes the execution interval from the 'inverted' speed.
   *
   * @param {number} invertedSpeed - The speed of animation as would be
   *   intuitively interpretable to a human being. This is related to the
   *   exec interval which is the time between animation execution steps.
   * @param {number} minSpeed - The minimum valid speed (an integer).
   * @param {number} maxSpeed - The maximum valid speed (an integer).
   * @param {number} minExecInterval - The minimum valid animation execution
   *   interval.
   * @param {number} maxExecInterval - The maximum valid animation execution
   *   interval.
   * @return {number} The animation speed corresponding to the given execution
   *   interval.
   */
  static computeExecIntervalFrom = function(invertedSpeed, minSpeed, maxSpeed,
    minExecInterval, maxExecInterval) {

    const speed = maxSpeed - invertedSpeed + 1;

    const execIntervalScale = GridAnimator.computeExecIntervalScale(
      minSpeed,
      maxSpeed,
      minExecInterval,
      maxExecInterval,
    );

    const speedStep = (speed - minSpeed) * execIntervalScale;
    const execInterval = minExecInterval + speedStep;
    return Math.round(execInterval);
  };

  /**
   * Computes the current animation speed.
   *
   * @param {number} minSpeed - The minimum valid speed (an integer).
   * @param {number} maxSpeed - The maximum valid speed (an integer).
   * @return {number} - The animation speed corresponding to the current
   *   execution interval.
   */
  computeSpeed = (minSpeed, maxSpeed) => {
    return GridAnimator.computeSpeedFrom(
      this.#execInterval,
      minSpeed,
      maxSpeed,
      Config.minExecInterval,
      Config.maxExecInterval,
    );
  };

  /**
   * Sets the animation execution interval from the 'inverted' speed.
   *
   * @param {number} invertedSpeed - The speed of animation as would be
   *   intuitively interpretable to a human being. This is related to the
   *   exec interval which is the time between animation execution steps.
   * @param {number} minSpeed - The minimum valid speed (an integer).
   * @param {number} maxSpeed - The maximum valid speed (an integer).
   */
  setExecIntervalFrom = (invertedSpeed, minSpeed, maxSpeed) => {
    this.#execInterval = GridAnimator.computeExecIntervalFrom(
      invertedSpeed,
      minSpeed,
      maxSpeed,
      Config.minExecInterval,
      Config.maxExecInterval,
    );
    log(Level.Vbose, `execInterval: ${this.#execInterval}`, ctxt());
  };

  /**
   * Computes the number of the next cell which would be highlighted.
   *
   * @return {number} The number of the next cell which would be highlighted.
   */
  computeNextHighlight = () => {

    const nextHighlight = this.#lastHighlight + this.#multiple;

    log(Level.Vbose, `lastHighlight: ${this.#lastHighlight}`, ctxt());
    log(Level.Vbose, `multiple:      ${this.#multiple}`, ctxt());
    log(Level.Vbose, `nextHighlight: ${nextHighlight}`, ctxt());

    return nextHighlight;
  };

  /**
   * Resets the grid animation timer.
   */
  #clearGridTimer = () => {
    if (this.#gridTimer) {
      clearInterval(this.#gridTimer);
      this.#gridTimer = null;
      log(Level.Debug, `-> stopped grid animation timer`, ctxt());
    }
  };

  /**
   * Initialises the current cell number to be animated.
   */
  initialiseCurrCell = () => {
    this.#currCell = 0;
    // this.#prevAnimatedCell = null;
  };

  /**
   * Initialises animation variables.
   */
  initialiseAnimationVars = () => {

    this.#clearGridTimer();

    log(Level.Debug, `-> initialising animation vars`, ctxt());

    this.initialiseCurrCell();
    this.#lastHighlight = null;
    this.#nextHighlight = this.computeNextHighlight();
  };

  /**
   * Resets the window scroll position.
   */
  resetScrollPos = () => {
    this.#gridScroller.resetScrollPos();
  };

  /**
   * Gets a list of currently highlighted cell numbers as well as (where the
   * largest grid number has been reduced in size) cell numbers for cells
   * that were previously highlighted; it also sets the last highlighted cell
   * number as appropriate.
   *
   * @return {Array<Array>} An associative array of 2 arrays which are the
   *   currently highlighted cells ('toHighlight') and the previously
   *   highlighted cells ('prevHighlighted'), as determined by whether these
   *   are now past the cutoff point for the number of cells in the grid (this
   *   could become relevant if the number of cells in the grid has been
   *   decreased, for example).
   */
  getHighlightedCellNums = () => {

    log(Level.Debug, `-> creating list of highlighted cell numbers`, ctxt());

    this.#nCell = this.#numGrid.nCell;

    // TODO: Rename toHighlight as just highlighted
    const toHighlight = [];
    const prevHighlighted = [];

    const selector = `.${Config.cellHighlightClassName}`;
    const highlightedCells = document.querySelectorAll(selector);

    const parseCellId = (txt, prefix) => {
      prefix = prefix || Config.cellIdClassPrefix;
      return parseInt(txt.replace(prefix, ''));
    };

    highlightedCells.forEach((cell) => {

      const cellNum = parseCellId(cell.id);

      log(Level.Vbose, `cellNum=${cellNum}; nCell=${this.#nCell}`, ctxt());

      if (cellNum <= this.#nCell) {
        log(Level.Vbose, `${cellNum} =>+ hilighted cell nums`, ctxt());
        toHighlight.push(cellNum);
      } else {
        log(Level.Vbose, `${cellNum} =>+ remove highlight cell nums`, ctxt());
        prevHighlighted.push(cellNum);
      }
    });

    if (toHighlight.length > 0) {
      this.#lastHighlight = toHighlight[toHighlight.length - 1];
    } else {
      this.#lastHighlight = null;
    }
    this.#currCell = this.#lastHighlight;
    log(Level.Debug, `lastHighlight: '${this.#lastHighlight}'`, ctxt());
    log(Level.Debug, `currCell:      '${this.#currCell}'`, ctxt());

    return {
      toHighlight: toHighlight,
      prevHighlighted: prevHighlighted,
    };
  };

  /**
   * Reapplies highlights to elements in a newly-created grid which were
   *   highlighted in the old grid.
   *
   * @param {Array<string>} toHighlight - An array of cell numbers for cells
   *   which were highlighted and need to have their highlighting reapplied in
   *   a new grid that replaces the old one.
   */
  reapplyHighlights = (toHighlight) => {

    log(Level.Debug, `-> Reapplying previous highlights to new grid`, ctxt());

    toHighlight.forEach((cellNum) => {
      const cellId = GridHelpers.getCellId(cellNum);
      const cell = document.getElementById(cellId);
      cell.classList.add(Config.cellHighlightClassName);
    });
  };

  /**
   * Clears highlights from all highlighted cells in the grid by removing the
   *   css highlight class from them; also unobserves all cells which are being
   *   observed because they were highlighted.
   */
  resetHighlights = () => {

    log(Level.Debug, `-> Resetting all highlights`, ctxt());

    const selector = `.${Config.cellHighlightClassName}`;
    const highlightedCells = document.querySelectorAll(selector);

    if (!this.#numGrid.stateIs(State.Complete)) {
      this.unobserveAllElements(highlightedCells);
    }

    highlightedCells.forEach((cell) => {
      cell.classList.remove(Config.cellHighlightClassName);
    });

    this.#lastHighlight = null;
    this.#nextHighlight = null;
  };

  /**
   * Clears highlights from all highlighted cells in the grid, reinitialises
   *   the current animation pointers and sets the grid state to clear.
   *
   * @param {State} state - The state to set and render after clearing
   *   highlights.
   */
  clearHighlights = (state) => {
    this.resetHighlights();
    this.initialiseCurrCell();
    this.#numGrid.setAndRenderState(state);
  };

  /**
   * Gets the HTML id's for the given array of elements.
   *
   * @param {Array<Object>} elements - HTML elements for which to get the id's.
   * @return {Array<string>} An array of strings which are the HTML id's
   *   corresponding to the given array of elements.
   */
  #idsFor = (elements) => {
    // TODO: Could perhaps use Array.map here instead? (Couldn't get to work)
    const ids = [];
    elements.forEach((elmt) => {
      ids.push(elmt.id);
    });
    return ids;
  };

  /**
   * Stops observing the specified elements.
   *
   * @param {Array<Object>} elements - An array of HTML elements which should be
   *   unobserved.
   */
  unobserveAllElements = (elements) => {
    log(Level.Vbose, `-> Unobserving elements:`, ctxt());
    log(Level.Vbose, this.#idsFor(elements), ctxt(), 'tab');

    elements.forEach((elmt) => {
      this.#gridScroller.stopObservingElmt(elmt);
    });
  };

  /**
   * Stops observing the elements with specified cell numbers.
   *
   * @param {Array<string>} cellNums - An array of cell numbers for which the
   *   corresponding HTML elements should be unobserved.
   */
  unobserveAll = (cellNums) => {
    log(Level.Debug, `-> Unobserving cells: ${cellNums}`, ctxt());

    cellNums.forEach((cellNum) => {
      const cellId = GridHelpers.getCellId(cellNum);
      this.#gridScroller.stopObserving(cellId);
    });
  };

  /**
   * Animates the 'counting along' for the number grid.
   *
   * @param {boolean} restart true if the animation should be restarted,
   *   false otherwise.
   */
  animate = (restart) => {

    this.#multiple = this.#numGrid.multiple;
    this.#nCell = this.#numGrid.nCell;

    restart = restart || false;

    log(Level.Debug, `multiple:     ${this.#multiple}`, ctxt());
    log(Level.Debug, `nCell:        ${this.#nCell}`, ctxt());
    log(Level.Debug, `currCell:     ${this.#currCell}`, ctxt());
    log(Level.Debug, `execInterval: ${this.#execInterval} (millisecs)`, ctxt());

    if (restart) {
      this.resetScrollPos();
      this.#numGrid.clearHighlights(State.Restart);
    }

    this.#numGrid.setAndRenderState(State.Animate);

    // Note: this.#currCell may not start at zero (if the animation is
    // currently paused)

    log(Level.Debug, `Curr cell is ${this.#currCell}`, ctxt());
    log(Level.Debug, `Multiple: ${this.#multiple}`, ctxt());

    /**
     * Sets up the next cell animation.
     */
    const animateNext = () => {

      this.#currCell += this.#multiple;

      log(Level.Vbose, `-> Checking next cell: ${this.#currCell}`, ctxt());

      if (this.#currCell <= this.#nCell) {

        log(Level.Vbose, `-> Animating cell ${this.#currCell}`, ctxt());

        const currCellId = GridHelpers.getCellId(this.#currCell);

        this.#gridScroller.startObserving(currCellId);

        const cell = document.getElementById(currCellId);
        cell.classList.add(Config.cellHighlightClassName);

        this.#lastHighlight = this.#currCell;
      }

      if (this.#currCell >= this.#nCell) {
        log(Level.Debug, `Next cell should not be animated`, ctxt());
        log(Level.Debug, `Next: ${this.#currCell} (>= ${this.#nCell})`, ctxt());
        log(Level.Debug, `-> Halting animation as next cell >= nCell`, ctxt());

        this.#numGrid.setState(State.Complete);
        this.pauseOrContinueAnimation();
        return;
      }
    };

    this.#gridTimer = setInterval(animateNext, this.#execInterval);
  };

  /**
   * Toggles the animation between running and paused states. When running,
   * would toggle to a paused state (i.e. with the option to continue); when
   * paused, would toggle to a running state.
   */
  pauseOrContinueAnimation = () => {

    this.#clearGridTimer();

    this.#multiple = this.#numGrid.multiple;
    this.#nCell = this.#numGrid.nCell;

    switch (this.#numGrid.state) {

    case State.Animate:
      this.#numGrid.setAndRenderState(State.Pause);
      break;

    case State.Pause:
      this.#numGrid.setAndRenderState(State.Continue);
      break;

    case State.Complete:
      this.#numGrid.setAndRenderState(State.Complete);
      break;

    default:
      log(Level.Error, `Unexpected state '${this.#numGrid.state}'`, ctxt());
    }

    // If the current state was not complete, check if the animation has just
    // completed
    if (!this.#numGrid.stateIs(State.Complete)) {

      let isComplete = this.#lastHighlight === this.#nCell;

      // Check if the next highlight would be outside of the grid
      this.#nextHighlight = this.computeNextHighlight();
      isComplete = isComplete || (this.#nextHighlight > this.#nCell);

      if (isComplete) {
        this.#numGrid.setAndRenderState(State.Complete);
      }
    }

    log(Level.Debug, '', ctxt());
    log(Level.Debug, `multiple:      '${this.#multiple}'`, ctxt());
    log(Level.Debug, `nCell:         '${this.#nCell}'`, ctxt());
    log(Level.Debug, `currCell:      '${this.#currCell}'`, ctxt());
    log(Level.Debug, `lastHighlight: '${this.#lastHighlight}'`, ctxt());
    log(Level.Debug, `nextHighlight: '${this.#nextHighlight}'`, ctxt());
    log(Level.Debug, '', ctxt());

    if (this.#numGrid.stateIs(State.Continue)) {
      // Restart the animation from where it left off previously
      this.animate();
    }
  };
}

// =============================================================================
