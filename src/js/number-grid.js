// =============================================================================
/*! countinmultiples */
/*! author: Toni Price (https://toni.rbind.io) */
// =============================================================================

import { Level, ctxt, log } from './logging.js';

import { Config } from './config.js';

import { Dims } from './dims.js';

import { GridAnimator } from './grid-animator.js';

import { GridHelpers } from './grid-helpers.js';

import { InputValidator } from './input-validator.js';

import { MediaHandler } from './media-handler.js';

import { State } from './state.js';

/**
 * Class to manage the number grid.
 * @typedef {Object} NumberGrid
 */
export class NumberGrid {

  // TODO: Make appropriate vars static and move into Config

  // Maximum number of cells in the table - slightly arbitrary value
  #maxNCell = 4000;

  // Maximum number of columns allowed as a user-input value
  #maxNColInput = 110;

  // Leeway for computing column numbers, i.e. how far up or down from an
  // 'ideal' number to go before giving up
  // TODO: Decide on a good value for #nColLeeway; could 3 be better?
  #nColLeeway = 6;

  // TODO: Remove #maxNCol once this is properly set according to media size
  // Maximum suggested number of columns in the table (for computed column
  // values)
  #maxNCol = 12;

  #multiple = null;
  #nCell = null;

  #prevNCell = null;

  // Initial font size: clamp(0.9rem, 2.0cqi + 0.4rem, 2.0rem)
  #fontSizeMin = Config.fontSizeMin; // rem
  #fontSizeSlope = Config.fontSizeSlope; // cqi
  #fontSizeIntercept = Config.fontSizeIntercept; // rem
  #fontSizeMax = Config.fontSizeMax; // rem

  // The number grid HTML element
  #grid = null;

  // The InputValidator
  #validator = null;

  // The GridAnimator for running the 'count along' animation
  #gridAnimator = null;

  // The MediaHandler for dealing with different media and screen resizing
  #mediaHandler = null;

  #state = State.Initialise;

  /**
   * Constructor for the NumberGrid.
   *
   * @param {number} initNCell - The initial value for the number of cells in
   *   the grid. Default: null which would be set to Config.initNCell in
   *   NumberGrid.initialise()
   * @param {number} initMultiple - The initial value for the multiple. Default:
   *   null which would be set to Config.initMultiple in NumberGrid.initialise()
   * @param {number} initNCols - The initial value for the number of columns in
   *   the grid, if this is not to be automatically computed. Default:
   *   null which would be set to Config.initNCols in NumberGrid.initialise()
   */
  constructor(initNCell, initMultiple, initNCols) {

    // --- --- ---
    // Initialise UI elements

    const computeColsChkLblId = Config.computeColsChkLblId;

    this.nCellInput = document.getElementById(Config.nCellInpId);
    this.multInput = document.getElementById(Config.multInpId);
    this.highMultChk = document.getElementById(Config.highMultChkId);
    this.highMultChkLbl = document.getElementById(Config.highMultChkLblId);
    this.highMultLbl = document.getElementById(Config.highMultLblId);
    this.speedInput = document.getElementById(Config.speedInpId);
    this.speedRange = document.getElementById(Config.speedRangeId);
    this.nColInput = document.getElementById(Config.nColInpId);
    this.computeColsChk = document.getElementById(Config.computeColsChkId);
    this.computeColsChkLbl = document.getElementById(computeColsChkLblId);
    this.nRowLbl = document.getElementById(Config.nRowLblId);

    this.startBtn = document.getElementById(Config.startBtnId);
    this.pauseContinueBtn = document.getElementById(Config.pauseContinueBtnId);
    this.clearBtn = document.getElementById(Config.clearBtnId);

    this.speedUpBtn = document.getElementById(Config.speedUpBtnId);
    this.speedResetBtn = document.getElementById(Config.speedResetBtnId);
    this.speedDownBtn = document.getElementById(Config.speedDownBtnId);

    this.sizeUpBtn = document.getElementById(Config.sizeUpBtnBtnId);
    this.sizeResetBtn = document.getElementById(Config.sizeResetBtnId);
    this.sizeDownBtn = document.getElementById(Config.sizeDownBtnBtnId);

    this.reloadLink = document.getElementById(Config.countinmultiplesId);

    // --- --- ---
    this.#grid = document.getElementById(Config.gridId);

    this.#gridAnimator = new GridAnimator(this);

    this.#mediaHandler = new MediaHandler(this);

    this.initialise(initNCell, initMultiple, initNCols);
  }

  /**
   * Getter for the number grid's state.
   */
  get state() {
    return this.#state;
  }

  /**
   * Setter for the number grid state.
   *
   * @param {State} state - The number grid state.
   */
  set state(state) {
    this.#state = state;
  }

  /**
   * Getter for the HTML grid object.
   */
  get grid() {
    return this.#grid;
  }

  /**
   * Getter for the number of cells in the grid.
   */
  get nCell() {
    return this.#nCell;
  }

  /**
   * Getter for the multiple to count in.
   */
  get multiple() {
    return this.#multiple;
  }

  /**
   * Setter for the multiple to count in.
   *
   * @param {number} num - The multiple to count in.
   */
  set multiple(num) {
    this.#multiple = parseInt(num);
  }

  /**
   * Getter for the number of rows in the grid.
   *
   * @return {number} Number of rows in the grid.
   */
  get nRow() {
    return this.nx;
  }

  /**
   * Getter for the number of columns in the grid.
   *
   * @return {number} Number of columns in the grid.
   */
  get nCol() {
    return this.ny;
  }

  /**
   * Setter for the number of cells in the grid.
   *
   * @param {number} num - The number of cells in the grid.
   */
  set nCell(num) {
    this.#prevNCell = this.#nCell;
    this.#nCell = num;
  }

  /**
  * Getter for the animation execution inteval.
  *
  * @return {number} The animation exec interval.
  */
  get execInterval() {
    return this._execInterval;
  }

  /**
  * Setter for the animation execution inteval.
  *
  * @param {number} num - The animation exec interval.
  */
  set execInterval(num) {
    this._execInterval = num;
  }

  /**
   * Getter for the column 'leeway' value.
   *
   * @return {number} An integer value denoting the distance to go
   *   in either direction (up or down) from the initial number of columns
   *   (which would be the ceiling of the square root of the number of cells)
   *   when computing column dimensions. If no values can be found within
   *   `nColLeeway` from either side of the starting point, the computed
   *   dimensions will not be a perfect rectangle.
   */
  get nColLeeway() {
    return this.#nColLeeway;
  }

  /**
   * Setter for the column 'leeway' value.
   *
   * @param {number} num - An integer value denoting the distance to go
   *   in either direction (up or down) from the initial number of columns
   *   (which would be the ceiling of the square root of the number of cells)
   *   when computing column dimensions. If no values can be found within
   *   `nColLeeway` from either side of the starting point, the computed
   *   dimensions will not be a perfect rectangle.
   */
  set nColLeeway(num) {
    this.#nColLeeway = num;
  }

  /**
   * Getter for the maximum number of columns in the grid.
   *
   * @return {number} Maximum number of columns in the grid.
   */
  get maxNCol() {
    return this.#maxNCol;
  }

  /**
   * Setter for the maximum number of columns in the grid.
   *
   * @param {number} num - Maximum number of columns in the grid.
   */
  set maxNCol(num) {
    this.#maxNCol = num;
  }

  /**
   * Getter for the number grid's 'media handler' (which manages media queries).
   *
   * @return {MediaHandler} The number grid's media handler.
   */
  get mediaHandler() {
    return this.#mediaHandler;
  }

  /**
   * Checks if the number grid's current state is the specified state.
   *
   * @param {State} state - The state to check for.
   * @return {boolean} true if the number grid's current state is the specified
   *   state, false otherwise.
   */
  stateIs = (state) => {
    return this.#state === state;
  };

  /**
   * Checks if the current grid state has been set to pause.
   *
   * @return {boolean} true if the state has been set to pause, false otherwise.
   */
  stateIsPause = () => {
    return this.stateIs(State.Pause);
  };

  /**
   * Checks if the current grid state has been set to complete.
   *
   * @return {boolean} true if the state has been set to complete, false
   *   otherwise.
   */
  stateIsComplete = () => {
    return this.stateIs(State.Complete);
  };

  /**
   * Retrieves the current state of validity for the field with given key.
   *
   * @param {string} key - The key for this field in the array of validity
   *   values.
   * @return {boolean} true if the multiple input is valid, false if not.
   */
  fieldIsValid = (key) => {
    return this.#validator.fieldIsValid(key);
  };

  /**
   * Sets the grid font size to the current clamp string for use with the CSS
   *   'font-size' property, consisting of three parts: a minimum, a linear
   *   scaling function and a maximum.
   *   For example, 'clamp(0.9rem, 2.0cqi + 0.4rem, 2.0rem)'.
   *
   * @param {boolean} initialise - Whether to initialise the font size to its
   *   default before setting the clamp string.
   */
  #setFontSize = (initialise) => {

    if (initialise) {
      log(Level.Debug, `-> Resetting font size to default`, ctxt());

      // Initial font size: clamp(0.9rem, 2.0cqi + 0.4rem, 2.0rem)
      this.#fontSizeMin = Config.fontSizeMin; // rem
      this.#fontSizeSlope = Config.fontSizeSlope; // cqi
      this.#fontSizeIntercept = Config.fontSizeIntercept; // rem
      this.#fontSizeMax = Config.fontSizeMax; // rem
    }

    const clamp = GridHelpers.getClampStr(
      this.#fontSizeMin,
      this.#fontSizeSlope,
      this.#fontSizeIntercept,
      this.#fontSizeMax,
    );
    log(Level.Debug, `-> Setting fontSize to clamp '${clamp}'`, ctxt());
    this.#grid.style.fontSize = clamp;
  };

  /**
   * Changes the grid font size.
   * @param {number} pct The percentage change to apply to the font size.
   * @param {number} minSize The minimum font size below which requests for font
   *   size changes will have no effect. Default: 0.6rem
   * @param {number} maxSize The maximum font size above which requests for font
   *   size changes will have no effect. Default: 6.0rem
   */
  changeFontSize = (pct, minSize, maxSize) => {

    // Absolute minimum and maximum font sizes (rem)
    minSize = minSize || 0.6;
    maxSize = maxSize || 6.0;

    const fac = 1 + pct / 100.0;

    const nextMin = fac * this.#fontSizeMin;
    const nextMax = fac * this.#fontSizeMax;

    if (nextMin >= minSize && nextMax <= maxSize) {

      const nextSlope = fac * this.#fontSizeSlope;
      const nextIntercept = fac * this.#fontSizeIntercept;

      this.#fontSizeMin = GridHelpers.roundToN(nextMin, 3);
      this.#fontSizeSlope = GridHelpers.roundToN(nextSlope, 3);
      this.#fontSizeIntercept = GridHelpers.roundToN(nextIntercept, 3);
      this.#fontSizeMax = GridHelpers.roundToN(nextMax, 3);

      const initialise = false;
      this.#setFontSize(initialise);
    }
  };

  /**
   * Resets the font size to its default.
   */
  resetFontSize = () => {
    log(Level.Debug, `-> Resetting font size to default`, ctxt());
    const initialise = true;
    this.#setFontSize(initialise);
  };

  /**
   * Initialises the app.
   *
   * @param {number} initNCell - The initial value for the number of cells in
   *   the grid. Default: Config.initNCell
   * @param {number} initMultiple - The initial value for the multiple. Default:
   *   Config.initMultiple
   * @param {number} initNCols - The initial value for the number of columns in
   *   the grid, if this is not to be automatically computed. Default:
   *   Config.initNCols
   */
  initialise = (initNCell, initMultiple, initNCols) => {

    initNCell = initNCell || Config.initNCell;
    initMultiple = initMultiple || Config.initMultiple;
    initNCols = initNCols || Config.initNCols;

    // TODO: Rename nx -> nRow and ny -> nCol for consistency & make private
    this.nx = null;
    this.ny = null;

    this.nCellInput.value = initNCell;
    this.multInput.value = initMultiple;

    this.#nCell = initNCell;
    this.#multiple = initMultiple;

    if (this.#validator !== null) {
      this.#validator = null;
    }
    this.#validator = this.constructInputValidator();

    // Initial value for number of columns in the grid
    if (Config.initComputeColsChecked) {
      this.computeColsChk.checked = true;
      // This value will be computed in NumberGrid.resetGridDims()
      this.nColInput.value = null;
    } else {
      this.computeColsChk.checked = false;
      this.nColInput.value = initNCols;
    }

    if (Config.initHighMultChecked) {
      this.highMultChk.checked = true;
    } else {
      this.highMultChk.checked = false;
    }

    this.speedRange.setAttribute('max', Config.maxSpeed);
    this.speedRange.setAttribute('min', Config.minSpeed);

    // this.#gridAnimator = new GridAnimator(this);
    const resetSpeed = true;
    this.#initialiseAnimationVars(resetSpeed);

    this.validateAllFields();

    const initialise = true;
    this.#setFontSize(initialise);

    log(Level.Debug, `nCell:        ${this.#nCell}`, ctxt());
    log(Level.Debug, `multiple:     ${this.#multiple}`, ctxt());
    log(Level.Debug, `(nRow, nCol): (${this.nx}, ${this.ny})`, ctxt());

    this.renderHighMultLbl();
    this.renderNRowLbl();

    this.setAndRenderState(State.Initialise);

    // Run the resize media handler
    const resetHighlights = true;
    this.#mediaHandler.handleResize(resetHighlights);
  };

  /**
   * Initialises animation variables.
   *
   * @param {boolean} resetSpeed - Whether to reset the speed to its default
   *   when initialising the animation variables. Default: false
   */
  #initialiseAnimationVars = (resetSpeed) => {

    log(Level.Debug, `-> Initialising animation vars`, ctxt());

    resetSpeed = resetSpeed || false;

    this.#gridAnimator.initialiseAnimationVars();

    if (resetSpeed) {
      this.resetSpeed();
    }

    this.nColInput.value = this.ny;

    if (this.#validator.stateIsValid()) {
      this.thawConfigInputs();
      this.thawRunCtrls();
    }
  };

  /**
   * Computes and sets a 'reasonable' number of rows and columns to set for the
   *   grid given a number of cells, also setting the grid values to the given
   *   number of cells.
   *
   * @param {number} nCell - The number of cells to set for the grid and use for
   *   computing the number of rows and columns.
   */
  setNCellAndDims = (nCell) => {

    if (!InputValidator.numIsPresent(nCell)) {

      this.#nCell = null;
      this.nx = null;
      if (this.computeColsChk.checked) {
        this.ny = null;
      }

    } else {

      this.#nCell = nCell;

      const gridDims = Dims.getGridDimsFromNCell(this.#nCell,
        this.#nColLeeway, this.#maxNCol);

      log(Level.Debug, `gridDims.nRow:  '${gridDims.nRow}'`, ctxt());
      log(Level.Debug, `gridDims.nCol:  '${gridDims.nCol}'`, ctxt());

      this.nx = gridDims.nRow;
      this.ny = gridDims.nCol;
    }

    this.nColInput.value = `${this.ny}`;
  };

  /**
   * Sets the implied number of rows from the specified values for number of
   *   cells and number of columns, also setting the grid values to the given
   *   number of cells and columns.
   *
   * @param {number} nCell - The number of cells to set for the grid.
   * @param {number} nCol - The number of columns to set for the grid.
   */
  setNColAndDims = (nCell, nCol) => {

    const nCellIsPresent = InputValidator.numIsPresent(nCell);
    const nColIsPresent = InputValidator.numIsPresent(nCol);

    if (!(nCellIsPresent && nColIsPresent)) {

      this.#nCell = null;
      this.nx = null;
      if (this.computeColsChk.checked) {
        this.ny = null;
      }

    } else {

      this.ny = nCol;
      this.#nCell = nCell;
      this.nx = Dims.getNRow(this.ny, this.#nCell);
    }

    this.nCellInput.value = `${this.#nCell}`;
    this.nColInput.value = `${this.ny}`;
  };

  /**
   * Sets the current UI state.
   *
   * @param {State} state - A valid `State` value which represents the current
   *   state of the UI to be set.
   */
  setState = (state) => {
    log(Level.Debug, `-> Setting state: ${this.#state.toString()}`, ctxt());
    this.#state = state;
  };

  /**
   * Renders the current UI state.
   */
  renderState = () => {

    log(Level.Debug, `-> Rendering state: ${this.#state.toString()}`, ctxt());

    switch (this.#state) {

    case State.Initialise:
      this.#renderStateInitialise();
      break;

    case State.Animate:
      this.#renderStateStart();
      break;

    case State.Stop:
      this.#renderStateStop();
      break;

    case State.Pause:
      this.#renderStatePause();
      break;

    case State.Continue:
      this.#renderStateContinue();
      break;

    case State.Complete:
      this.#renderStateComplete();
      break;

    case State.Restart:
      this.#renderStateClear();
      break;

    case State.Clear:
      this.#renderStateInitialise();
      break;

    case State.InputErr:
      this.#renderStateError();
      break;

    default:
      log(Level.Error, `No valid state defined`, ctxt());
      log(Level.Error, `  state = '${this.#state}`, ctxt());
      break;
    }
  };

  /**
   * Sets and renders the current UI state.
   *
   * @param {State} state - A valid `State` value which represents the current
   *   state of the UI to be set and rendered.
   */
  setAndRenderState = (state) => {
    this.setState(state);
    this.renderState();
  };

  /**
   * Set the run controls (e.g. stop/start/clear) as they should be before an
   *   animation starts.
   */
  #setInitControls = () => {

    if (this.#validator.stateIsValid()) {
      this.thawRunCtrls();
      this.thawConfigInputs();
    }

    // Now that all inputs/controls have been enabled, set individual
    // requirements

    // --- --- ---
    // Run controls

    this.startBtn.innerHTML = Config.btnStartText;
    this.pauseContinueBtn.innerHTML = Config.btnStopText;
    this.clearBtn.innerHTML = Config.btnClearText;

    this.disableCtrl(this.pauseContinueBtn);
    this.pauseContinueBtn.classList.remove(Config.btnAttentionClassName);
    this.pauseContinueBtn.style.display = 'none';

    this.disableCtrl(this.clearBtn);
    this.clearBtn.style.visibility = 'hidden';

    // --- --- ---
    // Config inputs

    // None with individual requirements
  };

  /**
   * Set the run controls (e.g. stop/start/clear) as they should be whilst an
   *   animation is running.
   */
  #setRunControls = () => {

    this.#gridAnimator.resetScrollPos();

    this.freezeRunCtrls();
    this.freezeConfigInputs();

    // Now that all inputs/controls have been disabled, set individual
    // requirements

    // --- --- ---
    // Run controls

    this.startBtn.innerHTML = Config.btnStartText;
    this.pauseContinueBtn.innerHTML = Config.btnPauseText;
    this.clearBtn.innerHTML = Config.btnClearText;

    this.enableCtrl(this.pauseContinueBtn);
    this.pauseContinueBtn.classList.remove(Config.btnAttentionClassName);
    this.pauseContinueBtn.style.display = 'block';

    this.clearBtn.style.visibility = 'hidden';

    // --- --- ---
    // Config inputs

    // Nothing extra to do here
  };

  /**
   * Renders the UI in its inital state.
   */
  #renderStateInitialise = () => {
    this.#setInitControls();
  };

  /**
   * Renders the UI when the user requests a running animation to stop (pause).
   */
  #renderStateStop = () => {
    // No action needed
    void(0);
  };

  /**
   * Renders the UI when the user requests an animation to start.
   */
  #renderStateStart = () => {
    this.#setRunControls();
  };

  /**
   * Renders the UI when the user has paused an animation.
   */
  #renderStatePause = () => {

    this.#setInitControls();

    this.startBtn.innerHTML = Config.btnRestartText;
    this.pauseContinueBtn.innerHTML = Config.btnContinueText;
    this.clearBtn.innerHTML = Config.btnClearText;

    this.enableCtrl(this.pauseContinueBtn);
    this.pauseContinueBtn.classList.add(Config.btnAttentionClassName);
    this.pauseContinueBtn.style.display = 'block';

    this.enableCtrl(this.clearBtn);
    this.clearBtn.style.visibility = 'visible';
  };

  /**
   * Renders the UI when the animation was in a paused state and the user
   *   requests for the animation to continue.
   */
  #renderStateContinue = () => {
    // No action needed
    void(0);
  };

  /**
   * Renders the UI when an animation has completed.
   */
  #renderStateComplete = () => {

    this.#setInitControls();
    this.startBtn.innerHTML = Config.btnRestartText;
    this.pauseContinueBtn.innerHTML = Config.btnStopText;
    this.clearBtn.innerHTML = Config.btnClearText;

    this.disableCtrl(this.pauseContinueBtn);
    this.pauseContinueBtn.style.display = 'none';

    this.enableCtrl(this.clearBtn);
    this.clearBtn.style.visibility = 'visible';

    // Once the animation is complete, we no longer want to observe where the
    // animated cells are and scroll the grid accordingly, as this would stop
    // the user from being able to scroll back to the top of the grid
    const selector = `.${Config.cellHighlightClassName}`;
    const highlightedCells = document.querySelectorAll(selector);
    this.#gridAnimator.unobserveAllElements(highlightedCells);
  };

  /**
   * Renders the UI when the user request the highlights to be cleared.
   */
  #renderStateClear = () => {
    // No action needed
    void(0);
  };

  /**
   * Renders the UI when there is a user input error.
   */
  #renderStateError = () => {
    this.#setInitControls();
    // this.freezeRunCtrls();
  };

  /**
   * Gets the tooltip element which is the sibling of the given element.
   *
   * @param {Object} elmt - The HTML element for which to find its sibling
   *   tooltip.
   * @param {string} containerClassName - The CSS class name of the element's
   *   container. Default: Config.tooltipContainerClassName
   * @param {string} textClassName - The CSS class name of the tooltip text
   *   element. Default: Config.tooltipTextClassName
   * @return {Object} The siblint HTML element which is the tooltip for the
   *   given element.
   */
  getToolipSibling = (elmt, containerClassName, textClassName) => {
    containerClassName = containerClassName || Config.tooltipContainerClassName;
    textClassName = textClassName = Config.tooltipTextClassName;
    const container = elmt.closest(`.${containerClassName}`);
    const tooltip = container.querySelector(`.${textClassName}`);
    return tooltip;
  };

  /**
   * Disables an HTML control.
   *
   * @param {Object} elmt - The HTML control to disable.
   * @param {boolean} hasTooltip - Whether the element to disable has a tooltip
   *   associated with it. Default: false
   */
  disableCtrl = (elmt, hasTooltip) => {

    hasTooltip = hasTooltip || false;

    elmt.disabled = true;
    elmt.classList.add(Config.disabledClassName);

    if (hasTooltip) {
      const tooltip = this.getToolipSibling(elmt);
      tooltip.disabled = true;
      tooltip.classList.add(Config.disabledClassName);
    }
  };

  /**
   * Enables an HTML control.
   *
   * @param {Object} elmt - The HTML control to enable.
   * @param {boolean} hasTooltip - Whether the element to disable has a tooltip
   *   associated with it. Default: false
   */
  enableCtrl = (elmt, hasTooltip) => {

    hasTooltip = hasTooltip || false;

    elmt.disabled = false;
    elmt.classList.remove(Config.disabledClassName);

    if (hasTooltip) {
      const tooltip = this.getToolipSibling(elmt);
      tooltip.disabled = false;
      tooltip.classList.remove(Config.disabledClassName);
    }
  };

  /**
   * Disables ('freezes') the run controls to stop them from being accessed.
   *
   * @param {boolean} includeSettings Whether to also disable the settings
   *   buttons, e.g. speed up/down etc.
   */
  freezeRunCtrls = (includeSettings) => {

    includeSettings = includeSettings || true;

    log(Level.Debug, `-> Freezing controls`, ctxt());

    this.disableCtrl(this.startBtn);
    this.disableCtrl(this.pauseContinueBtn);
    this.disableCtrl(this.clearBtn);

    if (includeSettings) {
      const hasTooltip = true;

      this.disableCtrl(this.speedUpBtn, hasTooltip);
      this.disableCtrl(this.speedDownBtn, hasTooltip);
      this.disableCtrl(this.speedResetBtn, hasTooltip);

      this.disableCtrl(this.sizeUpBtn, hasTooltip);
      this.disableCtrl(this.sizeDownBtn, hasTooltip);
      this.disableCtrl(this.sizeResetBtn, hasTooltip);
    }
  };

  /**
   * Enables ('thaws') the run controls to allow them to be accessed.
   *
   * @param {boolean} includeSettings Whether to also enable the settings
   *   buttons, e.g. speed up/down etc.
   */
  thawRunCtrls = (includeSettings) => {

    includeSettings = includeSettings || true;

    log(Level.Debug, `-> Thawing controls`, ctxt());

    this.enableCtrl(this.startBtn);
    this.enableCtrl(this.pauseContinueBtn);
    this.enableCtrl(this.clearBtn);

    if (includeSettings) {
      const hasTooltip = true;

      this.enableCtrl(this.speedUpBtn, hasTooltip);
      this.enableCtrl(this.speedDownBtn, hasTooltip);
      this.enableCtrl(this.speedResetBtn, hasTooltip);

      this.enableCtrl(this.sizeUpBtn, hasTooltip);
      this.enableCtrl(this.sizeDownBtn, hasTooltip);
      this.enableCtrl(this.sizeResetBtn, hasTooltip);
    }
  };

  /**
   * Disables ('freezes') all config inputs to stop user input.
   */
  freezeConfigInputs = () => {
    this.disableCtrl(this.nCellInput);
    this.disableCtrl(this.multInput);
    this.disableCtrl(this.highMultChk);
    this.disableCtrl(this.speedInput);
    this.disableCtrl(this.speedRange);
    this.disableCtrl(this.nColInput);
    this.disableCtrl(this.computeColsChk);
  };

  /**
   * Enables ('thaws') all config inputs to allow user input.
   */
  thawConfigInputs = () => {
    this.enableCtrl(this.nCellInput);
    this.enableCtrl(this.multInput);
    this.enableCtrl(this.highMultChk);
    this.enableCtrl(this.speedInput);
    this.enableCtrl(this.speedRange);

    if (!this.computeColsChk.checked) {
      this.enableCtrl(this.nColInput);
    } else {
      this.disableCtrl(this.nColInput);
    }
    this.enableCtrl(this.computeColsChk);
  };

  /**
   * Renders the 'no. of rows' label.
   */
  renderNRowLbl = () => {
    // If this config group has an error, do not re-render the label as this
    // would overwrite the error message
    const container = InputValidator.getClosestColContainer(this.nColInput);
    if (container.classList.contains(Config.inputErrClassName)) {
      return;
    }

    let lbl = '';

    let fieldsAreValid = this.fieldIsValid(Config.multInpId);
    fieldsAreValid = fieldsAreValid && this.fieldIsValid(Config.nCellInpId);

    if (Config.showNRowLbl && fieldsAreValid) {
      lbl = `Rows: ${this.nx}`;
    }
    this.nRowLbl.innerHTML = lbl;
  };

  /**
   * Renders the 'highest multiple' label based on the 'count to' and 'multiple'
   *   values.
   */
  renderHighMultLbl = () => {
    // If this config group has an error, do not re-render the label as this
    // would overwrite the error message
    const container = InputValidator.getClosestColContainer(this.multInput);
    if (container.classList.contains(Config.inputErrClassName)) {
      return;
    }

    let lbl = '';

    let fieldsAreValid = this.fieldIsValid(Config.multInpId);
    fieldsAreValid = fieldsAreValid && this.fieldIsValid(Config.nCellInpId);

    if (this.highMultChk.checked && fieldsAreValid) {

      const v1 = this.multInput.value;
      const v2 = this.nCellInput.value;
      const pair = GridHelpers.getHighMultPair(v1, v2);

      lbl = `highest: <span class="emph">${pair.highMult}</span>`;
      lbl = `${lbl} (next is ${pair.highPlusOneMult})`;

    }
    this.highMultLbl.innerHTML = lbl;
  };

  /**
   * Handles check/uncheck of the 'show highest multiple' label.
   */
  handleHighMultChk = () => {
    this.renderHighMultLbl();
  };

  /**
   * Handles check/uncheck of the 'compute cols' label.
   */
  handleComputeColsCheck = () => {

    this.enableCtrl(this.highMultChk);

    if (this.computeColsChk.checked) {
      this.disableCtrl(this.nColInput);
    } else {
      this.enableCtrl(this.nColInput);
    }
    this.resetGridDims();
    const chkNCell = true;
    this.validateNColInput(chkNCell);
  };

  /**
   * Sets the animation execution interval from the human-understandable
   *   animation speed value.
   *
   * @param {number} invertedSpeed - The speed of animation as would be
   *   intuitively interpretable to a human being. This is related to the
   *   exec interval which is the time between animation execution steps.
   */
  setExecIntervalFrom = (invertedSpeed) => {
    this.#gridAnimator.setExecIntervalFrom(
      invertedSpeed,
      Config.minSpeed,
      Config.maxSpeed,
    );
  };

  /**
   * Resets the animation speed to its default.
   */
  resetSpeed = () => {
    log(Level.Debug, `-> Resetting speed to default`, ctxt());

    const minSpeed = Config.minSpeed;
    const maxSpeed = Config.maxSpeed;

    this.#gridAnimator.execInterval = Config.defaultExecInterval;
    const initSpeed = this.#gridAnimator.computeSpeed(minSpeed, maxSpeed);

    this.speedInput.value = initSpeed;
    this.speedRange.value = initSpeed;

    log(Level.Debug, `minExecInterval: ${Config.minExecInterval}`, ctxt());
    log(Level.Debug, `maxExecInterval: ${Config.maxExecInterval}`, ctxt());
    log(Level.Debug, `speed:           ${initSpeed}`, ctxt());
  };

  /**
   * Changes the animation speed.
   *
   * @param {number} step The step change to apply to the animation speed.
   */
  changeSpeed = (step) => {

    log(Level.Debug, `-> Changing speed`, ctxt());

    let invertedSpeed = parseFloat(this.speedInput.value);
    invertedSpeed = Math.min(invertedSpeed + step, Config.maxSpeed);
    invertedSpeed = Math.max(invertedSpeed, Config.minSpeed);
    invertedSpeed = Math.round(invertedSpeed);

    log(Level.Debug, `invertedSpeed: ${invertedSpeed}`, ctxt());

    this.setExecIntervalFrom(invertedSpeed);
    this.speedInput.value = invertedSpeed;
    this.speedRange.value = invertedSpeed;
  };

  /**
   * Adds content (i.e. the actual numbers) to the number grid.
   */
  addGridContent = () => {

    log(Level.Debug, `-> Adding grid content`, ctxt());
    log(Level.Vbose, `nCell=${this.#nCell}, nCol=${this.ny}`, ctxt());

    const cells = this.#grid.querySelectorAll('div');

    // Note that this.#nCell might *not* be equal to nRow * nCol (as it may not
    // always be feasible to construct a grid of square or perfectly rectangular
    // dims, depending on the value of nCell)

    cells.forEach((cell, cellIndex) => {
      if (cellIndex < this.#nCell) {
        cell.appendChild(document.createTextNode(cellIndex + 1));
      }
    });
  };

  /**
   * Constructs an appropriate string for setting the CSS
   * 'grid-template-columns'.
   *
   * @return {string} The CSS 'grid-template-columns' setting.
   */
  getGridTemplateCols = () => {

    const nCellStr = `${this.#nCell}`;

    log(Level.Debug, `nCellStr:            '${nCellStr}'`, ctxt());
    log(Level.Debug, `max nCell digits:    ${nCellStr.length}`, ctxt());

    // Config.cellHorzPadding & Config.horzCellSlack units are em
    let cellMinWidth = nCellStr.length + Config.horzCellSlack;
    cellMinWidth = cellMinWidth + 2 * Config.cellHorzPadding;

    const nTimes = `${this.ny}`;
    const templateCols = `repeat(${nTimes}, ${cellMinWidth}em)`;

    log(Level.Debug, `gridTemplateColumns: '${templateCols}'`, ctxt());
    return templateCols;
  };

  /**
   * Sets the HTML number grid's CSS 'grid-template-columns'.
   */
  setGridTemplateCols = () => {

    // E.g. 'repeat(12, 3.3em)'
    const gridTemplateCols = this.getGridTemplateCols();

    this.#grid.style.gridTemplateColumns = gridTemplateCols;
  };

  /**
   * Checks if the font size is too large for the current viewport and reduces
   *   it if so.
   *
   * @param {number} adjustPct - Percentage value by which to decrease the font
   *   size.
   * @param {number} maxSteps - The maximum number of times to reduce the font
   *   size (if the grid overshoots the right-hand side of the viewport) before
   *   stopping.
   */
  adjustFontSize = (adjustPct, maxSteps) => {

    adjustPct = adjustPct || Config.fontSizeChangePct / 2;

    maxSteps = maxSteps || 16;

    // Space on right-hand side of grid in pixels
    const rightMargin = 10;

    let adjust = true;
    let count = 0;

    while (adjust && count <= maxSteps) {

      count += 1;
      const bounding = this.#grid.getBoundingClientRect();

      // Maximum pixel number on the right-hand side of the window (if the grid
      // which goes past this, the font size should be decreased)
      const rightMax = Math.ceil(window.innerWidth - rightMargin);

      // Check whether the element is partially outside the viewport
      const overshootsRight = bounding.right > rightMax;

      log(Level.Debug, 'grid width [${count}]:', ctxt());
      log(Level.Debug, `  ${Math.ceil(bounding.right)} / ${rightMax}`, ctxt());
      log(Level.Debug, `  grid overshoots RHS? ${overshootsRight}`, ctxt());

      // Adjust font size if need be
      if (overshootsRight) {
        log(Level.Debug, `  adjust font size by ${-adjustPct}%`, ctxt());

        this.changeFontSize(-adjustPct);
      } else {
        adjust = false;
      }
    }
  };

  /**
   * Checks if the current grid size is smaller than the previous grid size.
   *
   * @return {boolean} true if the current grid size is smaller than the
   *   previous grid size, false otherwise.
   */
  #gridSizeHasShrunk = () => {
    return (this.#nCell || 0) < (this.#prevNCell || 0);
  };

  /**
   * Handles adding or removing of the number grid's border, for use when there
   *   is an error which prevents the grid from being drawn.
   *
   * @param {boolean} remove Whether to remove the border. If true, the border
   *   will be removed; if false the border will be set to its usual value.
   */
  #addOrRemoveGridBorder = (remove) => {
    const grid = document.querySelector(`#${Config.gridId}`);

    if (remove) {
      // Set the grid's border to 'none' so as not to show a collapsed border
      // when there is an error that prevents the grid from being drawn
      grid.style.border = 'none';
    } else {
      // Reset the grid's border to its usual value
      grid.style.border = Config.gridBorderStyle;
    }
  };

  /**
   * Draws the grid.
   *
   * @param {boolean} reinitialise - Whether to reinitialise the grid config or
   *   to redraw the grid using current config values. Default: false
   * @param {boolean} retainHighlights - Whether to retain current highlights on
   *   the grid or to clear them. Default: true
   */
  #draw = (reinitialise, retainHighlights) => {

    log(Level.Info, `---> Drawing grid`, ctxt());

    // /**
    //  * Checks if none of the number of rows, columns or cells are 0, NaN or
    //  *   null.
    //  *
    //  * @return {boolean} true if none of the number of rows, columns or cells
    //  *   are 0, NaN or null.
    //  */
    // gridDimsArePresent = function() {
    //   const nRowIsOk = InputValidator.numIsPresent(this.nx);
    //   const nColIsOk = InputValidator.numIsPresent(this.ny);
    //   const nCellIsOk = InputValidator.numIsPresent(this.#nCell);

    //   return nRowIsOk && nColIsOk && nCellIsOk;
    // };

    this.#gridAnimator.resetScrollPos();

    reinitialise = reinitialise || false;
    retainHighlights = retainHighlights || true;

    const gridHasShrunk = this.#gridSizeHasShrunk();

    log(Level.Debug, `Prev nCell: ${this.#prevNCell}`, ctxt());
    log(Level.Debug, `Curr nCell: ${this.#nCell}`, ctxt());
    log(Level.Debug, `Grid size shrunk? ${gridHasShrunk}`, ctxt());

    let nCell = null;
    let nRow = null;
    let nCol = null;

    let dimsAreValid = this.fieldIsValid(Config.nCellInpId);
    dimsAreValid = dimsAreValid && this.fieldIsValid(Config.nColInpId);
    dimsAreValid = dimsAreValid && InputValidator.numIsPresent(this.nx);

    if (dimsAreValid) {
      nCell = this.#nCell;
      nRow = this.nx;
      nCol = this.ny;
    }

    let highlightedCellNums = [];
    if (retainHighlights || reinitialise || !dimsAreValid || gridHasShrunk) {
      highlightedCellNums = this.#gridAnimator.getHighlightedCellNums();
    }

    if (reinitialise) {
      this.#initialiseAnimationVars();
    }

    if (reinitialise || !dimsAreValid) {

      // If the grid is being replaced altogether, stop observing any previously
      // highlighted cells
      const highlighted = highlightedCellNums.toHighlight;
      highlighted.concat(highlightedCellNums.prevHighlighted);
      this.#gridAnimator.unobserveAll(highlighted);

    } else if (gridHasShrunk) {

      // If the grid has shrunk, stop observing any previously highlighted cells
      this.#gridAnimator.unobserveAll(
        highlightedCellNums.prevHighlighted,
      );
    }

    GridHelpers.replaceGrid(this.#grid, nCell, nRow, nCol);

    if (!dimsAreValid) {
      const removeGridBorder = true;
      this.#addOrRemoveGridBorder(removeGridBorder);
      return;
    }

    const keepGridBorder = false;
    this.#addOrRemoveGridBorder(keepGridBorder);

    GridHelpers.setCellIds(this.#grid, Config.cellIdClassPrefix);

    this.addGridContent();
    // TODO: Could this be replaced by using better css (e.g. auto-fill??)
    this.setGridTemplateCols();

    if (retainHighlights) {
      this.#gridAnimator.reapplyHighlights(highlightedCellNums.toHighlight);

      const isInitialising = this.stateIs(State.Initialise);
      const nextHighlight = this.#gridAnimator.computeNextHighlight();
      if (!isInitialising && (nextHighlight <= nCell) && !reinitialise) {
        if (this.#validator.stateIsValid()) {
          this.setAndRenderState(State.Pause);
        } else {
          this.setAndRenderState(State.Error);
        }
      }
    }

    this.adjustFontSize();
  };

  /**
   * Redraws the grid.
   */
  redrawGrid = () => {

    log(Level.Debug, `======> Redrawing grid`, ctxt());

    // If the grid should only be reinitialised if the state is not pause or
    // complete. If the state is pause then the grid should remain as-is; if the
    // state is complete, the grid size could have been changed by the user in
    // which case the animation may need to be continued, not restarted, and the
    // grid should also remain as-is.

    const reinitialise = !(this.stateIsPause() || this.stateIsComplete());

    const retainHighlights = !this.stateIs(State.Clear);

    this.#draw(reinitialise, retainHighlights);
  };

  /**
   * Resets (or, if during initialisation, sets) the grid column and row
   *   dimensions and redraws the grid. These may be automatically computed
   *   from the number of cells or the implied number of rows may be computed
   *   from a given number of columns if the UI is configured to do so.
   *
   * @param {number} nCell - Number of cells in the grid. Default: Current value
   *   of HTML input for the number of cells.
   * @param {number} nCol - Number of columns to use for computing the number
   *   of rows in the event that 'compute cols' is unchecked. Default: Current
   *   value of HTML input for the number of columns.
   */
  resetGridDims = (nCell, nCol) => {

    const currNCellIsValid = this.fieldIsValid(Config.nCellInpId);
    if (currNCellIsValid) {
      // In this case, compute a 'reasonable' number of columns from the
      // number of grid cells
      nCell = nCell || parseInt(this.nCellInput.value);
    }

    if (this.computeColsChk.checked) {

      if (currNCellIsValid) {
        // In this case, compute a 'reasonable' number of columns from the
        // number of grid cells
        this.setNCellAndDims(nCell);

        // Since we have now potentially changed the no. of columns we must also
        // reset its validation flag (this will be important if the number of
        // columns was in error before resetting the grid dimensions)
        const chkNCell = true;
        this.validateNColInput(chkNCell);
      }

    } else {

      // Check if the user-input value for no. of columns is valid
      const currNColIsValid = this.fieldIsValid(Config.nColInpId);
      if (currNColIsValid) {
        // In this case, use the current number of columns to set the implied
        // number of rows
        nCol = nCol || parseInt(this.nColInput.value);

        this.setNColAndDims(nCell, nCol);

      }
    }

    if (!this.#validator.stateIsValid()) {
      this.#setInitControls();
    }

    this.redrawGrid();
  };

  /**
   * Initialises the current cell to be animated.
   */
  initialiseCurrCell = () => {
    this.#gridAnimator.initialiseCurrCell();
  };

  /**
   * Resets cell highlights.
   */
  resetHighlights = () => {
    this.#gridAnimator.resetHighlights();
  };

  /**
   * Clears cell highlights.
   */
  clearHighlights = () => {
    this.#gridAnimator.clearHighlights(State.Clear);
  };

  /**
   * Initialises and constructs an input validator for the validatable fields.
   *
   * @return {InputValidator} An input validator object.
   */
  constructInputValidator = () => {

    const keyOrder = [
      Config.nCellInpId,
      Config.multInpId,
      Config.speedInpId,
      Config.nColInpId,
    ];

    const fields = {};
    fields[Config.nCellInpId] = this.nCellInput;
    fields[Config.multInpId] = this.multInput;
    fields[Config.speedInpId] = this.speedInput;
    fields[Config.nColInpId] = this.nColInput;

    return new InputValidator(keyOrder, fields);
  };

  /**
   * Checks if the value of the no. of cells input is a counting integer within
   *   the required range.
   * @return {boolean} true if the no. of cells input is valid, false if not.
   */
  validateNCellInput = () => {

    const isValid = this.#validator.validateCountField(
      Config.nCellInpId, 1, this.#maxNCell, 'range',
    );

    if (!isValid) {
      this.nx = null;
      if (this.computeColsChk.checked) {
        this.ny = null;
      }
    } else if (this.computeColsChk.checked) {
      this.setNCellAndDims(parseInt(this.nCellInput.value));
    }

    this.renderHighMultLbl();
    this.renderNRowLbl();

    return isValid;
  };

  /**
   * Checks if the value of the multiple input is a counting integer within the
   *   required range. Optionally also checks if its value is less than the
   *   number of cells in the grid.
   * @param {boolean} chkNCell - Set to true to check the multiple against the
   *   no. of cells (i.e. if it is less than or equal to the number of cells).
   * @return {boolean} true if the multiple input is valid, false if not.
   */
  validateMultInput = (chkNCell) => {

    // const key = Config.multInpId;

    const minVal = 1;
    let maxVal = null;
    if (chkNCell) {
      maxVal = parseInt(this.nCellInput.value);
    } else {
      maxVal = this.#maxNCell;
    }

    // // If `chkNCell` is true and the value of the multiple input is a valid
    // // number but larger than the number of cells, reset it to its max
    // const resetToMax = chkNCell;
    const resetToMax = false;
    const isValid = this.#validator.validateCountField(
      Config.multInpId, minVal, maxVal, 'max', resetToMax,
    );
    // Since the field value could have been reset, we need to sync it here
    if (resetToMax) {
      this.multiple = parseInt(this.multInput.value);
    }

    // Note that validating the field could have reset the info label (as the
    // space for this is shared with error messages); further, the field could
    // have been reset to its max possible value so it may need to be
    // re-rendered
    this.renderHighMultLbl();

    return isValid;
  };

  /**
   * Checks if the value of the speed input is a counting integer within the
   *   required range.
   * @return {boolean} true if the speed input is valid, false if not.
   */
  validateSpeedInput = () => {

    // const key = Config.speedInpId;

    return this.#validator.validateCountField(
      Config.speedInpId, Config.minSpeed, Config.maxSpeed, 'range',
    );
  };

  /**
   * Checks if the value of the no. of columns input is a counting integer
   *   within the required range. Optionally also checks if its value is less
   *   than the number of cells in the grid.
   * @param {boolean} chkNCell Set to true to check the no. of columns against
   *   no. of cells (i.e. if it is less than or equal to the number of cells).
   * @return {boolean} true if the no. of columns input is valid, false if not.
   */
  validateNColInput = (chkNCell) => {

    const minVal = 1;
    let maxVal = null;
    if (chkNCell) {
      maxVal = this.nCellInput.value;
    } else {
      maxVal = this.#maxNColInput;
    }

    const nCellIsValid = this.#validator.fieldIsValid(Config.nCellInpId);
    let isValid = true;

    const resetToMax = false;
    isValid = this.#validator.validateCountField(
      Config.nColInpId, minVal, maxVal, 'max', resetToMax,
    );

    if (nCellIsValid) {
      // Since the field value could have been reset, we need to sync it here
      this.ny = parseInt(this.nColInput.value);
    }

    // Note that validating the field could have reset the info label (as the
    // space for this is shared with error messages); further, the field could
    // have been reset to its max possible value so it may need to be
    // re-rendered
    this.renderNRowLbl();

    return isValid;
  };

  /**
   * Validates all input fields.
   *
   * @param {boolean} chkNCell Set to true to check other values against the
   *   no. of cells (i.e. if the multiple and no. of columns are less than or
   *   equal to the number of cells).
   * @return {boolean} true if all input fields are valid, false otherwise.
   */
  validateAllFields = (chkNCell) => {

    log(Level.Vbose, `-> validating all fields`, ctxt());

    // Note that validity of multiple & no. of cols depend on validity of no. of
    // cells, hence no. of cells must be validated before these
    this.validateNCellInput();
    this.validateMultInput(chkNCell);
    this.validateSpeedInput();
    this.validateNColInput(chkNCell);

    return this.#validator.stateIsValid();
  };

  /**
   * Sets the number grid's state according to its validator status.
   *
   * @param {State} stateToSetIfValid - A valid `State` value for setting the
   *   number grid's state if it is valid.
   */
  setGridState = (stateToSetIfValid) => {

    stateToSetIfValid = stateToSetIfValid || State.Initialise;

    if (this.#validator.stateIsValid()) {

      this.#state = stateToSetIfValid;

    } else {

      this.#state = State.InputErr;

      const firstInvalid = this.#validator.getFirstInvalidField();

      log(Level.Debug, `this.#validator.valid:`, ctxt());
      log(Level.Debug, this.#validator.valid, ctxt(), 'dir');
      log(Level.Debug, `first invalid: ${firstInvalid}`, ctxt());

      this.#validator.setFieldFocus(firstInvalid);
    }
  };

  /**
   * Checks if the number grid is in a state such that it can proceed
   *   with animation, according to whether its fields are valid.
   *
   * @return {boolean} true if it is okay for animation to proceed, false
   *   otherwise.
   */
  #canProceed = () => {

    let stateOk = true;

    if (!this.stateIsComplete()) {

      log(Level.Debug, `-> Checking if okay to proceed`, ctxt());

      const chkNCell = true;
      stateOk = this.validateAllFields(chkNCell);
    }

    if (!stateOk) {
      log(Level.Debug, `At least one field is invalid`, ctxt());
      log(Level.Debug, `Animation cannot proceed.`, ctxt());
    }
    return stateOk;
  };

  /**
   * Runs an animation.
   *
   * @param {boolean} restart Whether to restart an animation from the beginning
   *   or to continue from the current position.
   */
  animate = (restart) => {
    if (this.#canProceed()) {
      this.#gridAnimator.animate(restart);
    } else {
      // TODO: Could this logical branch ever be called? Remove if not!
      const stateToSetIfValid = State.Initialise;
      this.setGridState(stateToSetIfValid);
    }
  };

  /**
   * Pauses or continues an animation, depending on the current state of the
   *   number grid.
   */
  pauseOrContinueAnimation = () => {
    if (this.#canProceed()) {
      this.#gridAnimator.pauseOrContinueAnimation();
    } else {
      // TODO: Could this logical branch ever be called? Remove if not!
      const stateToSetIfValid = this.#state;
      this.setGridState(stateToSetIfValid);
    }
  };
}

// =============================================================================
