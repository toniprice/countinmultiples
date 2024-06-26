// =============================================================================
/*! countinmultiples */
/*! author: Toni Price (https://toni.rbind.io) */
// =============================================================================

import { Level, ctxt, log } from './logging.js';

/**
 * A collection of static functions relating dimensions for `NumberGrid`.
 * @typedef {Object} Dims
 */
export class Dims {

  /**
   * Constructor for Dims.
   *
   */
  constructor() {
  }

  /**
   * Checks if a number is prime.
   *
   * @param {number} num - The number to check for primeness (an integer).
   * @returns {boolean} - true if the number is prime, false if not.
   * @example
   * isPrime(-5)    // => false
   * isPrime(0)     // => false
   * isPrime(1)     // => false
   * isPrime(2)     // => true
   * isPrime(3)     // => true
   * isPrime(4)     // => false
   * isPrime(11)    // => true
   * isPrime(15)    // => false
   * isPrime(567)   // => false
   * isPrime(1231)  // => true
   */
  static isPrime = function(num) {

    // See
    // Algorithm of checking if the number is prime [duplicate]
    // asked Jun 2, 2020 at 10:39
    // NixoN
    // answered Jun 2, 2020 at 10:50
    // Parth Sharma
    // https://stackoverflow.com/questions/62150130/
    //   algorithm-of-checking-if-the-number-is-prime
    // [23sep23]

    // Corner cases
    if (num <= 1) return false;
    // If num is now <= 3 then it must be 2 or 3
    if (num <= 3) return true;

    // Check this so that we can skip the in-between five numbers in below loop
    if (num % 2 == 0 || num % 3 == 0) return false;

    for (let i = 5; i * i <= num; i = i + 6) {
      if (num % i == 0 || num % (i + 2) == 0) return false;
    }

    return true;
  };

  /**
   * Checks if a number is a perfect square.
   *
   * @param {number} num - The number to check.
   * @returns {boolean} true if the number is a perfect square, false otherwise.
   * @example
   * isSquare(25) // => true
   * isSquare(22) // => false
   */
  static isSquare = function(num) {
    return (num % Math.sqrt(num) === 0);
  };

  /**
   * Computes 'square-ish' dimensions for a grid, given a number of cells. This
   *   means that when computing the number of rows and columns, the ideal is
   *   taken to be a square. If a square is not possible, this function searches
   *   for row and column dimensions which are perfectly rectangular but close
   *   to a square (favouring a wide rather than long grid, i.e. more columns
   *   than rows, though within the constraint of the maximum number of columns
   *   - which could mean that the final grid has more rows than columns).
   *
   * @param {number} nCell - Number of cells in the grid.
   * @param {number} nColLeeway - An integer value denoting the distance to go
   *   in either direction (up or down) from the initial number of columns
   *   (which would be the ceiling of the square root of the number of cells)
   *   when computing column dimensions. If no values can be found within
   *   `nColLeeway` from either side of the starting point, the computed
   *   dimensions will not be a perfect rectangle.
   * @param {number} maxNCol - Maximum number of columns.
   * @returns {Array<number>} An associative array of 2 integers which are the
   *   row and column dimensions (named nRow and nCol respectively).
   * @example
   * getSquarishDims(96, 6, 15) // => { "nRow": 8, "nCol": 12 }
   * getSquarishDims(51, 6, 15) // => { "nRow": 7, "nCol": 8 }
   */
  static getSquarishDims = function(nCell, nColLeeway, maxNCol) {

    log(Level.Debug, `-> computing 'square-ish' dims for ${nCell}`, ctxt());

    // See
    // Input an integer, find the two closest integers which, when multiplied,
    // equal the input
    // asked Apr 28, 2013 at 19:35
    // user1909612
    // https://stackoverflow.com/questions/16266931/
    //   input-an-integer-find-the-two-closest-integers-which-
    //   when-multiplied-equal-th
    // [10sep23]
    //
    // Since nCell will always be (relatively) small, work downwards from the
    // square root:
    //
    // 1) Take the square root of the number X; we'll call it N.
    // 2) Set N equal to the ceiling of N (round up to the nearest integer).
    // 3) Test for (X % N). If N divides evenly into X, we found our first
    //    number.
    //   if 0, divide X by N to get M. M and N are our numbers
    //   if not 0, increment N by 1 and start step 3 over.

    /**
     * Given grid dimensions for number of rows and columns, ensures that the
     * number of columns is always greater than or equal to the number of rows.
     *
     * @param {number} nRow - Number of rows.
     * @param {number} nCol - Number of columns.
     * @returns {Array<number>} Named array of 2 integers which are the row and
     *   column dimensions (named nRow and nCol respectively).
     * @example
     * ensureWideDims(12, 10) // => { nRow: 10, nCol: 12 }
     * ensureWideDims(4, 6)   // => { nRow: 4, nCol: 6 }
     * ensureWideDims(5, 5)   // => { nRow: 5, nCol: 5 }
     */
    function ensureWideDims(nRow, nCol) {
      if (nRow > nCol) {
        const tmpNRow = nRow;
        nRow = nCol;
        nCol = tmpNRow;
      }
      const dims = {
        nRow: nRow,
        nCol: nCol,
      };
      return dims;
    }

    /**
     * Given grid dimensions for number of rows and columns, ensures that the
     * number of rows is always greater than or equal to the number of columns.
     *
     * @param {number} nRow - Number of rows.
     * @param {number} nCol - Number of columns.
     * @returns {Array<number>} An associative array of 2 integers which are the
     *   row and column dimensions (named nRow and nCol respectively).
     * @example
     * ensureLongDims(12, 10) // => { nRow: 12, nCol: 10 }
     * ensureLongDims(4, 6)   // => { nRow: 6, nCol: 4 }
     * ensureLongDims(5, 5)   // => { nRow: 5, nCol: 5 }
     */
    function ensureLongDims(nRow, nCol) {
      ({ nRow, nCol } = ensureWideDims(nRow, nCol));
      return {
        nRow: nCol,
        nCol: nRow,
      };
    }

    /**
     * Given a number of cells and one dimension, computes the other and
     * validates whether this is a valid solution.
     *
     * @param {number} nCell - Number of cells in the grid.
     * @param {number} dim1 - One of the grid dimensions from which to compute
     *   the other. Must be an integer.
     * @param {number} maxNCol - Maximum number of columns.
     * @param {boolean} perfectGrid - true if the grid needs to be a perfect
     *   rectangle, false if it is allowed to have empty cells at the end.
     * @returns {Array<number>} Named array of size 3:
     *   1. isFound: A boolean (true if acceptable dimensions have been found)
     *   2. nRow:    An integer which is the number of rows
     *   3. nCol:    An integer which is the number of columns
     */
    function getValidDims(nCell, dim1, maxNCol, perfectGrid) {

      log(Level.Debug, `nCell: ${nCell}, maxNCol: ${maxNCol}`, ctxt());
      log(Level.Debug, `dim1: ${dim1}`, ctxt());

      const dim2 = Math.ceil(nCell / dim1);

      log(Level.Debug, `dims: [${dim1}, ${dim2}]`, ctxt());

      let isFound = false;
      let nRow = null;
      let nCol = null;

      ({ nRow, nCol } = ensureWideDims(dim1, dim2));

      if (perfectGrid && (nCell % nCol !== 0)) {
        nRow = null;
        nCol = null;
      } else {
        if (nCol <= maxNCol) {
          isFound = true;
        } else {
          ({ nRow, nCol } = ensureLongDims(dim1, dim2));
          if (nCol <= maxNCol) {
            isFound = true;
          }
        }
      }

      log(Level.Debug, ` nRow: ${nRow}, nCol: ${nCol}`, ctxt());

      return {
        isFound: isFound,
        nRow: nRow,
        nCol: nCol,
      };
    }

    /**
     * Computes a heuristic 'reasonable' option for grid dimensions (number of
     *   columns and rows), attempting to balance some common sense criteria.
     *
     * @param {number} nCell - Number of cells in the grid.
     * @param {number} nColInit - An initial value for the number of columns.
     * @param {number} nColLeeway - An integer value denoting the distance to go
     *   in either direction (up or down) from the initial number of columns
     *   when computing adjusted dimensions.
     * @param {number} maxNCol - The maximum number of columns in the computed
     *   dimensions.
     * @returns {Array<number>} An Associative array of 2 integers which are the
     *   row and column dimensions (named nRow and nCol respectively).
     * @example
     * getHeuristicDims(95) // => { nRow: 5, nCol: 6 }
     */
    function getHeuristicDims(nCell, nColInit, nColLeeway, maxNCol) {

      log(Level.Debug, `==== === getting heuristic grid dims === ===`, ctxt());
      log(Level.Debug, `nColInit: ${nColInit}, maxNCol: ${maxNCol}`, ctxt());
      log(Level.Debug, `nColLeeway: ${nColLeeway}`, ctxt());

      let isFound = false;
      let nRow = null;
      let nCol = null;

      let perfectGrid = true;

      // Check if we are already at a solution
      ({ isFound, nRow, nCol } =
        getValidDims(nCell, nColInit, maxNCol, perfectGrid));

      let nextStep = null;
      if (!isFound) {
        // Try a step of 1 in both directions, up and down, for steps from 1 up
        // to nColLeeway
        const steps = Array.from({ length: nColLeeway }, (_, j) => j + 1);
        for (const step of steps) {

          // Check if we have reached an acceptable solution
          if (isFound) {
            break;
          }

          // direction is an integer value representing the direction to go when
          // adjusting up or down. This is either 1 (upwards direction) or -1
          // (downwards direction)
          for (const direction of [1, -1]) {
            const adjust = step * direction;
            nextStep = nColInit + adjust;

            log(Level.Vbose, `--- --- trying ${nextStep} --- ---`, ctxt());
            log(Level.Vbose, `adjust: ${adjust}`, ctxt());

            ({ isFound, nRow, nCol } =
              getValidDims(nCell, nextStep, maxNCol, perfectGrid));
            if (isFound) {
              break;
            }
          }
        }
      }

      if (!isFound) {
        log(Level.Debug, `no soln found with col leeway ${nColLeeway}`, ctxt());
        // Compute the next best option for dims, now allowing an imperfect grid
        // (i.e. one which has empty cells in the last row)
        perfectGrid = false;
        ({ nRow, nCol } = getValidDims(nCell, nColInit, maxNCol, perfectGrid));
      }

      log(Level.Debug, `final dims: nRow: ${nRow},  nCol: ${nCol}`, ctxt());

      return {
        nRow: nRow,
        nCol: nCol,
      };
    }
    // -----------------------------------

    // As a starting point, compute the ceiling of sqrt(no. of cells)
    const baseCeilSqrt = Math.ceil(Math.sqrt(nCell));

    log(Level.Debug, `baseCeilSqrt: '${baseCeilSqrt}'`, ctxt());

    // If the number of cells is a square, we are done
    if (Dims.isSquare(nCell)) {
      return {
        nRow: baseCeilSqrt,
        nCol: baseCeilSqrt,
      };
    }

    // If the number of cells is prime (in other words there aren't any useful
    // factors), compute grid dimensions which are close to rectangular
    if (Dims.isPrime(nCell)) {
      const perfectGrid = false;
      return getValidDims(nCell, baseCeilSqrt, maxNCol, perfectGrid);
    }

    // Given that the number of cells is not square or prime, find rectangular
    // dimensions which form a 'reasonable' rectangle (with number of rows and
    // being computed as dimensions which are as similar in size as possible).
    // Note that this may or may not turn out to be a perfect rectangle, i.e.
    // the solution could result in some empty cells in the last row.
    return getHeuristicDims(nCell, baseCeilSqrt, nColLeeway, maxNCol);
  };

  /**
   * Given the number of columns and the number of cells in a grid, computes the
   *   corresponding number of rows required.
   *
   * @param {number} nCol - The number of columns in the grid (an integer).
   * @param {number} nCell - The number of cells in the grid (an integer).
   * @returns {number} The number of rows required for the given number of
   *   columns and cells.
   */
  static getNRow = function(nCol, nCell) {
    return Math.ceil(nCell / nCol);
  };

  /**
   * Given the number of cells in a grid, computes grid dimensions (i.e. number
   * of rows and columns) which are as close to being square as is practical,
   * within specified constraints.
   *
   * @param {number} nCell - Number of cells in the grid.
   * @param {number} nColLeeway - An integer value denoting the distance to go
   *   in either direction (up or down) from the initial number of columns
   *   (which would be the ceiling of the square root of the number of cells)
   *   when computing column dimensions. If no values can be found within
   *   `nColLeeway` from either side of the starting point, the computed
   *   dimensions will not be a perfect rectangle.
   * @param {number} maxNCol - Maximum number of columns.
   * @returns {Array<number>} An associative array of 2 integers which are the
   *   row and column dimensions (named nRow and nCol respectively).
   */
  static getGridDimsFromNCell = function(nCell, nColLeeway, maxNCol) {

    nColLeeway = nColLeeway || 6;
    maxNCol = maxNCol || 15;

    const squarishDims = Dims.getSquarishDims(nCell, nColLeeway, maxNCol);

    log(Level.Debug, 'square-ish dims:', ctxt());
    log(Level.Debug, squarishDims, ctxt(), 'dir');

    return squarishDims;
  };

}

// =============================================================================
