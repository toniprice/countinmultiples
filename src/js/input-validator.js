// =============================================================================
/*! countinmultiples */
/*! author: Toni Price (https://toni.rbind.io) */
// =============================================================================

import { Level, ctxt, log } from './logging.js';

import { Config } from './config.js';

/**
 * Class to handle input validation for the grid configuration.
 * @typedef {object} InputValidator
 * @property {Array<object>} configCols - An array of HTML elements which are
 *   the containers for columns in the config form.
 * @property {Array<string>} keyOrder - An array of strings which are the HTML
 *   id's of the fields to validate.
 * @property {Array<object>} fields - An associative array of HTMLInputElement
 *   objects which are the input fields to validate. The keys must match those
 *   in `keyOrder`.
 * @property {Array<object>} valid - An associative array of boolean values,
 *   one for each of the input fields to validate, named according to the keys
 *   in `keyOrder`.
 */
export class InputValidator {

  #configCols = null;

  #keyOrder = null;
  #fields = null;

  #valid = null;

  /**
   * Sets the focus and selected text for an HTML input.
   * @param {object} field - HTMLInputElement for which to set the focus.
   */
  static setFieldFocus = (field) => {
    // TODO: Check if this is working properly, is selection always being set
    // as intended?
    if (field != null) {
      field.select();
      field.focus();
    }
  };

  /**
   * Constructor for the InputValidator.
   * @param {Array<string>} keyOrder - An array of strings which are the HTML
   *   id's of the fields to validate.
   * @param {Array<object>} fields - An associative array of HTMLInputElement
   *   objects which are the input fields to validate. The keys must match those
   *   in `keyOrder`.
   */
  constructor(keyOrder, fields) {

    log(Level.Debug, `-> Constructing input validator`, ctxt());

    const containerSel = `.${Config.configContainerClassName}`;
    const colSel = `.${Config.configColClassName}`;

    const configContainer = document.querySelector(containerSel);
    this.#configCols = configContainer.querySelectorAll(colSel);

    this.#keyOrder = keyOrder;
    this.#fields = fields;

    this.#valid = {};
    for (const key of keyOrder) {
      this.#valid[key] = true;
    }

    log(Level.Debug, 'key order:', ctxt());
    log(Level.Debug, this.#keyOrder, ctxt(), 'dir');
    log(Level.Debug, 'validity status:', ctxt());
    log(Level.Debug, this.#valid, ctxt(), 'dir');
  }

  /**
   * Checks if a number is integer.
   * @param {number} num - The number to check.
   * @returns {boolean} true if the number is integer, false otherwise.
   */
  static isInt = function(num) {
    if (num % 1 === 0) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Checks if a number is not any of 0, NaN or null.
   * @param {number} num - The number to check.
   * @returns {boolean} true if the number is not any of 0, NaN or null; false
   *   otherwise.
   */
  static numIsPresent = function(num) {
    return !(num === null || isNaN(num) || num === 0);
  };

  /**
   * Gets the closest HTML container (with the specified class name) to the
   *   given element.
   * @param {object} field - The HTMLInputElement for which to get the closest
   *   container.
   * @param {string} containerClassNm - The class name of the HTML element's
   *   container to retrieve. Default: Config.configColClassName
   * @returns {object} The closest container with the specfied class name to the
   *   given element.
   */
  static getClosestColContainer = function(field, containerClassNm) {
    containerClassNm = containerClassNm || Config.configColClassName;
    return field.closest(`.${containerClassNm}`);
  };

  /**
   * Getter for the input validation flag.
   * @returns {Array<object>} An associative array of boolean values, one for
   *   each of the input fields to validate, named according to the keys in
   *   `keyOrder`.
   */
  get valid() {
    return this.#valid;
  }

  /**
   * Retrieves the current state of validity for the field with given key.
   * @param {string} key - The key for this field in the array of validity
   *   values.
   * @returns {boolean} true if the multiple input is valid, false if not.
   */
  fieldIsValid = (key) => {
    return this.#valid[key];
  };

  /**
   * Checks if every validatable input field is valid.
   * @returns {boolean} true if all fields are valid, false if at least one is
   *   invalid.
   */
  stateIsValid = () => {
    return Object.keys(this.#valid).every(this.fieldIsValid);
  };

  /**
   * Using the predefined order of keys which exist in the InputValidator, finds
   *   the key for the first invalid field (if any fields are invalid).
   * @returns {string} The key (which is the HTML id) of the first invalid
   *   field, according to the key order. If no fields are invalid, returns
   *   null.
   */
  getFirstInvalidKey = () => {
    let firstInvalidKey = null;
    for (const key of this.#keyOrder) {

      log(Level.Debug, `checking key '${key}'`, ctxt());

      if (!this.fieldIsValid(key)) {
        log(Level.Debug, `found invalid field for '${key}'`, ctxt());
        firstInvalidKey = key;
        break;
      }
    }

    log(Level.Debug, `first invalid html id: ${firstInvalidKey}`, ctxt());

    return firstInvalidKey;
  };

  /**
   * Using the predefined order of keys which exist in the InputValidator, finds
   *   the first invalid field (if any fields are invalid).
   * @returns {object} The first invalid HTMLInputElement field (according to
   *   the key order), named by its key. If no fields are invalid, returns null.
   */
  getFirstInvalidField = () => {

    const firstInvalidKey = this.getFirstInvalidKey();
    let firstInvalidField = null;

    if (firstInvalidKey != null) {
      firstInvalidField = this.#fields[firstInvalidKey];
    }

    log(Level.Debug, 'first invalid field:', ctxt());
    log(Level.Debug, firstInvalidField, ctxt(), 'dir');

    return firstInvalidField;
  };

  /**
   * Sets the validation status for the given field.
   * @param {object} field - The HTMLInputElement for which to set the status.
   * @param {string} fieldLbl - The field's label.
   * @param {string} errMsg - The error message to display if the field is not
   *   valid.
   * @param {string} status - The validation status indicator: 'success' for
   *   valid, 'error' for invalid.
   * @param {boolean} showLbl - Whether to prefix the error message with the
   *   given field label.
   */
  setStatus = (field, fieldLbl, errMsg, status, showLbl) => {

    const closestContainer = InputValidator.getClosestColContainer(field);

    // Get the container object which will hold the error
    const selector = `.${Config.errContainerClassName}`;
    const currErrField = closestContainer.querySelector(selector);

    // TODO: Change the status into an enum-style object
    if (status === 'success') {

      closestContainer.classList.remove(Config.inputErrClassName);

      currErrField.innerText = '';

    } else if (status === 'error') {

      closestContainer.classList.add(Config.inputErrClassName);

      if (showLbl) {
        currErrField.innerText = `${fieldLbl} ${errMsg}`;
      } else {
        currErrField.innerText = errMsg;
      }
    }
  };

  /**
   * Checks if the value of the specified field is a counting integer within a
   *   range.
   * @param {string} key - The key for this field which is the HTML id of the
   *   input element.
   * @param {number} v1 - Lower bound (an integer).
   * @param {number} v2 - Upper bound (an integer).
   * @param {string} msgType - Style of message if the input field violates.
   *   range restrictions. Valid options: 'range', 'max'. Default: 'range'
   * @param {boolean} resetToMax - If the field is a valid number but larger
   *   than the upper bound, should it be reset to its maximum value or left
   *   as-is? Default: false
   * @returns {boolean} true if the input field is valid, false if not.
   */
  validateCountField = (key, v1, v2, msgType, resetToMax) => {

    // TODO: In general this input validator could use some improvement!

    resetToMax = resetToMax || false;

    msgType = msgType || 'range';

    const field = this.#fields[key];

    const basicNumMsg = 'Must be a number';

    const fieldLbl = field.previousElementSibling.innerText;
    // For now don't include the field label but ideally make includeFieldLbl
    // into a parameter so as to provide the choice
    const includeFieldLbl = false;

    let isValid = true;
    let msg = '';

    const digitPattern = /^[-]?[0-9]+$/;

    // if (field.value.trim() === '')

    if (!field.value.match(digitPattern)) {
      isValid = false;
      msg = basicNumMsg;

    } else {

      const val = parseInt(field.value);

      if (isNaN(val)) {
        isValid = false;
      } else if (val < 0) {
        isValid = false;
        msg = 'Must not be negative';
      } else if (val == 0) {
        isValid = false;
        msg = 'Must not be zero';
      } else if (val < v1 || val > v2) {
        if (resetToMax && val > v2) {
          // TODO: Is resetToMax ever set to true? Remove if not.
          // TODO: Display a message (animated/transient?) in the UI to make it
          // clear that the value has been reset to its maximum possible value
          field.value = v2;
          isValid = true;
        } else {
          isValid = false;
        }
      }
    }

    log(Level.Debug, `${field.id}: '${field.value}'`, ctxt());
    log(Level.Debug, `${field.id} is valid? ${isValid}`, ctxt());

    this.#valid[key] = isValid;

    if (isValid) {
      this.setStatus(field, `'${fieldLbl}'`, null, 'success', includeFieldLbl);
    } else {
      if (msg === '') {
        msg = basicNumMsg;
        if (InputValidator.numIsPresent(v2)) {
          switch (msgType) {
          case 'range':
            if (InputValidator.numIsPresent(v1)) {
              msg = `Must be a number between ${v1} and ${v2}`;
            }
            break;
          case 'max':
            msg = `Must be a number less than or equal to ${v2}`;
            break;
          default:
            break;
          }
        }
      }
      this.setStatus(field, `'${fieldLbl}'`, msg, 'error', includeFieldLbl);
    }

    return isValid;
  };
}

// -----------------------------------------------------------------------------
