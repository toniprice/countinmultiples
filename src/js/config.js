// =============================================================================
/*! countinmultiples */
/*! author: Toni Price (https://toni.rbind.io) */
// =============================================================================

/**
 * Class to manage static configuration information for the number grid and
 *   associated classes.
 * @typedef {Object} Config
 */
export class Config {

  // Note: Set to false to disable the title animation
  static enableTitleAnimator = true;

  // Whether to show the no. of rows (computed from no. of columns)
  static showNRowLbl = true;

  // Initial value for number of cells in the grid
  static initNCell = 100;

  // Initial value for the multiple to count
  static initMultiple = 5;

  // Initial value for whether 'compute the number of columns' is checked or not
  static initComputeColsChecked = true;

  // Initial value for number of columns in the grid - only actually used when
  // the UI is set to *not* compute the number of columns on initialisation
  static initNCols = 10;

  // Initial value for whether 'show high multiple' is checked or not
  static initHighMultChecked = true;

  // -----------------------------------
  // Animation vars

  // Set initial animation speed
  //
  // Default animation execution interval in milliseconds
  // (500 is moderate; 700 would probably be reasonable for counting along; 250
  // is fast for testing)
  //
  // For Config.minExecInterval=100 and Config.maxExecInterval=1200, an exec
  // interval of 633 corresponds to a speed of 52; 660 to a speed of 50.
  // Note: Set Config.defaultExecInterval to 250 for a faster default
  static defaultExecInterval = 660;

  // Minimum and maximum speed to display for range slider (and limits for speed
  // input). Note that these will be converted into an exec interval according
  // to the scale specified by Config.minExecInterval and
  // Config.maxExecInterval.
  static minSpeed = 1;
  static maxSpeed = 100;

  // Step change for animation speed (up or down)
  static speedChangeStep = 10.0;

  // When the currently animated cell goes past the end of the vertical
  // viewport, this is the autoscroll distance in pixels (px)
  static autoScrollDistance = 220;

  // Config.minExecInterval and Config.maxExecInterval determine the scale of
  // the animation speed range
  static minExecInterval = 100;
  static maxExecInterval = 1200;

  // -----------------------------------
  // Font size settings
  // Default font size clamp string: clamp(0.9rem, 2.0cqi + 0.4rem, 2.0rem)
  static fontSizeMin = 0.9; // rem
  static fontSizeSlope = 2.0; // cqi
  static fontSizeIntercept = 0.4; // rem
  static fontSizeMax = 2.0; // rem

  // Percentage change for sizing grid font (up or down)
  static fontSizeChangePct = 10.0;

  // -----------------------------------
  // UI display text

  // Start and Stop button text for various State values
  static btnStartText = 'Start';
  static btnStopText = 'Stop';
  static btnPauseText = 'Stop';
  static btnContinueText = 'Continue';
  static btnRestartText = 'Restart';
  static btnClearText = 'Clear';

  // -----------------------------------
  // HTML element ids

  static gridId = 'num-grid';

  static multInpId = 'mult-inp';
  static highMultChkId = 'high-mult-chk';
  static highMultChkLblId = 'high-mult-chk-lbl';
  static highMultLblId = 'high-mult-lbl';
  static nCellInpId = 'ncell-inp';
  static speedRangeId = 'speed-range';
  static speedInpId = 'speed-inp';
  static nColInpId = 'ncol-inp';
  static computeColsChkId = 'compute-ncol-chk';
  static computeColsChkLblId = 'compute-ncol-chk-lbl';
  static nRowLblId = 'nrow-lbl';

  static startBtnId = 'start-btn';
  static pauseContinueBtnId = 'pause-continue-btn';
  static clearBtnId = 'clear-btn';

  static speedUpBtnId = 'speed-up-btn';
  static speedResetBtnId = 'speed-reset-btn';
  static speedDownBtnId = 'speed-down-btn';

  static sizeUpBtnBtnId = 'size-up-btn';
  static sizeResetBtnId = 'size-reset-btn';
  static sizeDownBtnBtnId = 'size-down-btn';

  // -----------------------------------
  // CSS-related vars

  // Note: Config.cellHorzPadding must correspond with css var
  // '--cell-h-padding' in style.scss
  static cellHorzPadding = 0.1; // em

  // The amount of slack to allow on each size of the grid number in a cell
  static horzCellSlack = 0.5; // em

  // Grid border style
  // Note that this must match the css style rule for #num-grid border
  static gridBorderStyle = '1px solid var(--table-border-clr)';

  // Prefix for cell class names in the HTML
  static cellIdClassPrefix = 'cell-';

  static cellHighlightClassName = 'cell-hilite';

  static disabledClassName = 'disabled';

  static btnAttentionClassName = 'attention';

  // Link for countinmultiples page
  static countinmultiplesId = 'countinmultiples';

  // Container class name for the config form (for config user inputs)
  static configContainerClassName = 'config-fields';
  // Container class name for columns in the config form
  static configColClassName = 'col';

  // Class name of HTML element that holds error messages in the UI
  static errContainerClassName = 'col__extra-info';
  static inputErrClassName = 'input-err';

  // Id of container for the run controls form (e.g. stop/start/clear etc.)
  static controlsContainerId = 'run-controls';
  // Id of run controls form (for stop/start/clear etc.)
  static controlsId = 'controls';

  // Class name of tooltip container element
  static tooltipContainerClassName = 'tooltip';
  // Class name of element which holds the actual tooltip text
  static tooltipTextClassName = 'tooltip__text';
}

// -----------------------------------------------------------------------------
