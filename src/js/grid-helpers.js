// =============================================================================
/*! countinmultiples */
/*! author: Toni Price (https://toni.rbind.io) */
// =============================================================================

import { Level, ctxt, log } from './logging.js';

import { Config } from './config.js';

/**
 * A collection of static helpers for the number grid.
 */
export class GridHelpers {

  /**
   * Constructor for GridHelpers.
   *
   */
  constructor() {
  }

  /**
   * Constructs a CSS clamp string for scaling a font linearly as the enclosing
   *   container resizes, setting both minimum and maximum limits.
   *
   * @param {number} minVal - The minimum font size in rem units.
   * @param {number} slope - The slope parameter for the linear scaling
   *   function in cqi units.
   * @param {number} intercept - The intercept parameter for the linear scaling
   *   function in rem units.
   * @param {number} maxVal - The maximum font size in rem units.
   * @return {string} The constructed clamp string for use with the CSS
   *   'font-size' property consisting of three parts: a minimum, a linear
   *   scaling function and a maximum.
   *   For example, 'clamp(0.9rem, 2.0cqi + 0.4rem, 2.0rem)'.
   */
  static getClampStr = function(minVal, slope, intercept, maxVal) {
    const minStr = `${minVal}rem`;
    const linearStr = `${slope}cqi + ${intercept}rem`;
    const maxStr = `${maxVal}rem`;
    return `clamp(${minStr}, ${linearStr}, ${maxStr})`;
  };

  /**
   * Rounds a number to n decimal places.
   *
   * @param {number} x The number to round.
   * @param {number} n The number of decimal places to which to round x.
   * @return {number} The given number, rounded to n decimal places.
   */
  static roundToN = function(x, n) {
    return Math.round(x * (10 ** n)) / (10 ** n);
  };

  /**
   * Gets the HTML cell id for a cell given its cell number.
   *
   * @param {number} cellNum Number of cell for which to retrieve the id.
   * @param {string} prefix The character prefix to use when constructing the
   *   HTML cell id for a cell. Default: `Config.cellIdClassPrefix` ('cell-')
   * @return {string} The HTML cell id.
   *
   * @example
   * GridHelpers.getCellId(24) # => 'cell-24';
   * GridHelpers.getCellId(24, 'cell-') # => 'cell-24';
   * GridHelpers.getCellId(24, 'cell-id-') # => 'cell-id-24';
   */
  static getCellId = function(cellNum, prefix) {
    return `${(prefix || Config.cellIdClassPrefix)}${cellNum}`;
  };

  /**
   * Sets the HTML cell id for each cell in the grid.
   *
   * @param {Object} grid The number grid HTML element.
   * @param {string} prefix The character prefix to use when constructing the
   *   HTML cell id for a cell. Default: `Config.cellIdClassPrefix` ('cell-')
   */
  static setCellIds = function(grid, prefix) {

    const cells = grid.querySelectorAll('div');

    cells.forEach((cell, cellIndex) => {
      // Set cell id
      cell.setAttribute('id', GridHelpers.getCellId(cellIndex + 1, prefix));
    });
  };

  /**
   * Gets the highest possible multiple for the given multiple and number of
   *   cells.
   *
   * @param {number} mult An integer value which is the multiple to count.
   * @param {number} nCell - Number of cells in the grid.
   * @return {Array<number>} Named array of 2 integers which are the highest
   *   multiple and the next multiple ofter that.
   */
  static getHighMultPair = function(mult, nCell) {

    const highMult = nCell - (nCell % mult);
    const highPlusOneMult = (highMult / mult + 1) * mult;

    return {
      highMult: highMult,
      highPlusOneMult: highPlusOneMult,
    };
  };

  /**
   * Removes all rows in given grid and adds new rows for the required no. of
   * rows and cols.
   *
   * @param {Object} grid The number grid HTML element.
   * @param {number} nCell - Number of cells in the grid.
   * @param {number} nRow - Number of rows.
   * @param {number} nCol - Number of columns.
   */
  static replaceGrid = function(grid, nCell, nRow, nCol) {

    log(Level.Debug, `-> Replacing grid with new contents`, ctxt());

    let cell;
    let i;

    // --- --- ---
    // Remove any existing grid content

    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }

    log(Level.Debug, `nRow=${nRow}, nCol=${nCol}`, ctxt());

    if (isNaN(nRow) || isNaN(nCol)) {
      return;
    }

    // --- --- ---
    // Add new grid content

    log(Level.Debug, `nCell=${nCell}`, ctxt());

    for (i = 0; i < nCell; i += 1) {
      cell = document.createElement('div');
      grid.appendChild(cell);
    }
  };
}
