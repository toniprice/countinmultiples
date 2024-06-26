// =============================================================================
/*! countinmultiples */
/*! author: Toni Price (https://toni.rbind.io) */
// =============================================================================

import { Level, ctxt, log } from './logging.js';

import { Config } from './config.js';

import { NumberGrid } from './number-grid.js';

import { State } from './state.js';

import { TitleAnimator } from './title-animator.js';

/**
 * Class for managing and coordinating the countinmultiples components.
 */
class CountInMultiples {

  #titleAnimator = null;

  // The NumberGrid object
  #numGrid = null;

  #reloadLink = null;

  /**
   * Constructor for CountInMultiples class.
   */
  constructor() {

    if (Config.enableTitleAnimator) {
      this.#titleAnimator = new TitleAnimator();
    }

    // Note: You could override the defaults for arguments
    //   (initNCell, initMultiple, initNCols)
    // when constructing the number grid here
    this.#numGrid = new NumberGrid();

    // --- --- ---
    // Initialise UI HTML elements

    this.nCellInput = this.#numGrid.nCellInput;
    this.multInput = this.#numGrid.multInput;
    this.highMultChk = this.#numGrid.highMultChk;
    this.highMultChkLbl = this.#numGrid.highMultChkLbl;
    this.highMultLbl = this.#numGrid.highMultLbl;
    this.speedInput = this.#numGrid.speedInput;
    this.speedRange = this.#numGrid.speedRange;
    this.nColInput = this.#numGrid.nColInput;
    this.computeColsChk = this.#numGrid.computeColsChk;
    this.computeColsChkLbl = this.#numGrid.computeColsChkLbl;
    this.nRowLbl = this.#numGrid.nRowLbl;
    this.recalcDimsBtn = this.#numGrid.recalcDimsBtn;

    this.startBtn = this.#numGrid.startBtn;
    this.pauseContinueBtn = this.#numGrid.pauseContinueBtn;
    this.clearBtn = this.#numGrid.clearBtn;

    this.speedUpBtn = this.#numGrid.speedUpBtn;
    this.speedResetBtn = this.#numGrid.speedResetBtn;
    this.speedDownBtn = this.#numGrid.speedDownBtn;

    this.sizeUpBtn = this.#numGrid.sizeUpBtn;
    this.sizeResetBtn = this.#numGrid.sizeResetBtn;
    this.sizeDownBtn = this.#numGrid.sizeDownBtn;

    // --- --- ---
    this.#reloadLink = this.#numGrid.reloadLink;

    // Add listeners for media queries and form input elements
    this.#addListeners();

    if (Config.enableTitleAnimator) {
      this.#titleAnimator.animate();
    }
  }

  /**
   * Adds listeners for media queries and form input elements.
   */
  #addListeners = () => {

    // ---------------------------------
    this.#numGrid.mediaHandler.addMediaQueryListeners();

    // ---------------------------------
    this.#reloadLink.addEventListener('click', this.#onReload);

    // ---------------------------------
    this.nCellInput.addEventListener('input', this.#onRecalcDimsInput);

    this.nCellInput.addEventListener('change', this.#onNCellInputChange);

    // ---------------------------------
    this.multInput.addEventListener('input', this.#numGrid.freezeRunCtrls);

    this.multInput.addEventListener('change', this.#onMultInputChange);

    this.highMultChk.addEventListener('change', this.#onHighMultCheck);

    // ---------------------------------
    this.speedInput.addEventListener('input', this.#numGrid.freezeRunCtrls);

    this.speedInput.addEventListener('change', this.#onSpeedInputChange);

    this.speedRange.addEventListener('change', this.#onSpeedRangeChange);

    // ---------------------------------
    this.nColInput.addEventListener('input', this.#onRecalcDimsInput);

    this.nColInput.addEventListener('change', this.#onNColInputChange);

    // ---------------------------------
    this.computeColsChk.addEventListener('change', this.#onComputeColsCheck);

    // ---------------------------------
    this.recalcDimsBtn.addEventListener('click', this.#onRecalcDims);

    // ---------------------------------
    this.startBtn.addEventListener('click', this.#onStart);

    this.pauseContinueBtn.addEventListener('click', this.#onPauseOrContinue);

    this.clearBtn.addEventListener('click', this.#onClear);

    // ---------------------------------
    this.speedUpBtn.addEventListener('click', this.#onSpeedUp);

    this.speedDownBtn.addEventListener('click', this.#onSlowDown);

    this.speedResetBtn.addEventListener('click', this.#onResetSpeed);

    // ---------------------------------
    this.sizeUpBtn.addEventListener('click', this.#onIncreaseFontSize);

    this.sizeDownBtn.addEventListener('click', this.#onDecreaseFontSize);

    this.sizeResetBtn.addEventListener('click', this.#onResetFontSize);
  };

  /**
   * Reloads the page, thereby reinitialising and setting the UI back to its
   * default values.
   */
  #onReload = () => {
    this.#numGrid.initialise();
    if (Config.enableTitleAnimator) {
      this.#titleAnimator.animate();
    }
  };

  /**
   * Handles input for config fields which could result in the user clicking the
   *   'recalculate columns and rows' button.
   */
  #onRecalcDimsInput = () => {
    this.#numGrid.freezeRunCtrls();

    const hasTooltip = true;
    this.#numGrid.enableCtrl(this.recalcDimsBtn, hasTooltip);
  };

  /**
   * Handles changes for the 'count to' input for number of cells in the grid.
   */
  #onNCellInputChange = () => {

    log(Level.Debug, `nCellInput: '${this.nCellInput.value}'`, ctxt());

    if (this.#numGrid.validateNCellInput()) {

      if (this.#numGrid.stateIs(State.Error)) {
        this.#numGrid.state = State.Initialise;
      }

      const chkNCell = true;
      this.#numGrid.validateMultInput(chkNCell);
      this.#numGrid.validateNColInput(chkNCell);

      // this.#numGrid.enableCtrl(this.highMultChk);

      this.#numGrid.thawConfigInputs();
      this.#numGrid.thawRunCtrls();

    } else {

      this.#numGrid.state = State.Error;

      this.#numGrid.freezeConfigInputs();
      this.#numGrid.freezeRunCtrls();

      this.#numGrid.enableCtrl(this.nCellInput);
      // TODO: Replace these calls to focus() and select() with
      // InputValidator.setFieldFocus()
      this.nCellInput.select();
      this.nCellInput.focus();

      // this.#numGrid.disableCtrl(this.multInput);
      // this.#numGrid.disableCtrl(this.nColInput);

      // this.#numGrid.disableCtrl(this.highMultChk);
    }

    this.#numGrid.resetGridDims();
  };

  /**
   * Handles changes to the 'multiples of' input field.
   */
  #onMultInputChange = () => {

    log(Level.Debug, `multInput: '${this.multInput.value}'`, ctxt());

    const chkNCell = true;
    if (this.#numGrid.validateMultInput(chkNCell)) {

      if (this.#numGrid.stateIs(State.Error)) {
        this.#numGrid.state = State.Initialise;
      }

      this.#numGrid.clearHighlights(State.Initialise);
      this.#numGrid.multiple = this.multInput.value;

      this.#numGrid.thawConfigInputs();
      this.#numGrid.thawRunCtrls();

    } else {
      this.#numGrid.state = State.Error;

      this.#numGrid.freezeConfigInputs();
      this.#numGrid.freezeRunCtrls();

      this.#numGrid.enableCtrl(this.multInput);
      this.multInput.select();
      this.multInput.focus();

      // this.#numGrid.disableCtrl(this.highMultChk);
    }

    this.#numGrid.renderHighMultLbl();
  };

  /**
   * Handles check/uncheck for the 'show highest multiple' checkbox.
   */
  #onHighMultCheck = () => {
    this.#numGrid.handleHighMultChk();
  };

  /**
   * Handles changes to the speed value input by computing the animation
   *   execution interval corresponding to the speed.
   */
  #onSpeedInputChange = () => {

    log(Level.Debug, `speedInput: '${this.speedInput.value}'`, ctxt());

    if (this.#numGrid.validateSpeedInput()) {

      if (this.#numGrid.stateIs(State.Error)) {
        this.#numGrid.state = State.Initialise;
      }

      const invertedSpeed = parseFloat(this.speedInput.value);
      this.#numGrid.setExecIntervalFrom(invertedSpeed);
      this.speedRange.value = invertedSpeed;

      this.#numGrid.thawConfigInputs();
      this.#numGrid.thawRunCtrls();

    } else {
      this.#numGrid.state = State.Error;

      // this.#numGrid.freezeConfigInputs();
      // this.#numGrid.freezeRunCtrls();

      this.#numGrid.setExecIntervalFrom(Config.minSpeed);
      this.speedRange.value = Config.minSpeed;

      this.#numGrid.enableCtrl(this.speedInput);
      this.speedInput.select();
      this.speedInput.focus();

      // this.#numGrid.disableCtrl(this.highMultChk);
    }
  };

  /**
   * Handles changes to the speed range input by computing the animation
   *   execution interval corresponding to the speed.
   */
  #onSpeedRangeChange = () => {
    log(Level.Debug, `speedRange: '${this.speedRange.value}'`, ctxt());

    const stateIsError = this.#numGrid.stateIs(State.Error);

    if (stateIsError) {
      this.#numGrid.State = State.Initialise;
    }

    const invertedSpeed = parseFloat(this.speedRange.value);
    this.#numGrid.setExecIntervalFrom(invertedSpeed);
    this.speedInput.value = invertedSpeed;

    // This validation needs to be done to reset any potential error messages
    this.#numGrid.validateSpeedInput();

    if (stateIsError) {
      this.#numGrid.setAndRenderState(State.Initialise);
    }
  };

  /**
   * Handles changes to the columns (i.e. no. of columns) input.
   */
  #onNColInputChange = () => {

    log(Level.Debug, `nColInput: '${this.nColInput.value}'`, ctxt());

    const chkNCell = true;
    if (this.#numGrid.validateNColInput(chkNCell)) {

      if (this.#numGrid.stateIs(State.Error)) {
        this.#numGrid.state = State.Initialise;
      }

      this.#numGrid.thawConfigInputs();
      this.#numGrid.thawRunCtrls();

    } else {
      this.#numGrid.state = State.Error;

      this.#numGrid.freezeConfigInputs();
      this.#numGrid.freezeRunCtrls();

      this.#numGrid.enableCtrl(this.nColInput);
      this.nColInput.select();
      this.nColInput.focus();
    }

    this.#numGrid.resetGridDims();

    this.#numGrid.renderNRowLbl();

    this.#numGrid.enableCtrl(this.computeColsChk);
  };

  /**
   * Handles check/uncheck of the 'compute cols' checkbox. If the user unchecks
   * this then it would stop the number of columns from being automatically
   * computed according to the number of cells (it would be left as specified).
   */
  #onComputeColsCheck = () => {
    this.#numGrid.handleComputeColsCheck();
  };

  /**
   * Handles button clicks for the 'recalculate dims' (rows and columns) button.
   */
  #onRecalcDims = () => {
    this.#numGrid.resetGridDims();
  };

  /**
   * Handles button clicks for the Start button (which could be Start or
   * Restart).
   */
  #onStart = () => {

    // Should only reinitialise if the state is paused or complete, otherwise
    // keep the grid as-is

    const isPause = this.#numGrid.stateIsPause();
    const isComplete = this.#numGrid.stateIsComplete();

    const shouldReinitialise = isPause || isComplete;
    this.#numGrid.animate(shouldReinitialise);
  };

  /**
   * Handles button clicks for the Stop/Continue button.
   */
  #onPauseOrContinue = () => {
    this.#numGrid.pauseOrContinueAnimation();
  };

  /**
   * Handles button clicks for the Clear button.
   */
  #onClear = () => {
    this.#numGrid.clearHighlights(State.Clear);
  };

  /**
   * Increases the animation speed by a step change.
   */
  #onSpeedUp = () => {
    this.#numGrid.changeSpeed(Config.speedChangeStep);
  };

  /**
   * Decreases the animation speed by a step change.
   */
  #onSlowDown = () => {
    this.#numGrid.changeSpeed(-1 * Config.speedChangeStep);
  };

  /**
   * Resets the animation speed to its default.
   */
  #onResetSpeed = () => {
    this.#numGrid.resetSpeed();
  };

  /**
   * Increases the font size by a percentage value.
   */
  #onIncreaseFontSize = () => {
    this.#numGrid.changeFontSize(Config.fontSizeChangePct);
  };

  /**
   * Decreases the font size by a percentage value.
   */
  #onDecreaseFontSize = () => {
    this.#numGrid.changeFontSize(-1 * Config.fontSizeChangePct);
  };

  /**
   * Resets the font size to its default.
   */
  #onResetFontSize = () => {
    this.#numGrid.resetFontSize();
  };
}

// =============================================================================

/**
 * Initialises the CountInMultiples engine on window load.
 */
window.addEventListener('load', (event) => {

  log(Level.Vbose, `Event '${event.type}' target: ${event.target}`, ctxt());

  new CountInMultiples();
});

// =============================================================================
