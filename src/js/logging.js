// =============================================================================
/*! countinmultiples */
/*! author: Toni Price (https://toni.rbind.io) */
// =============================================================================

/**
 * A simplistic logging system.
 */

/**
 * Logging levels.
 */
export const Level = Object.freeze({
  None:  0,
  Error: 1,
  Warn:  2,
  Info:  3,
  Debug: 4,
  Vbose: 5,
});

/**
 * Logging formats which are suitable for general messages (usually strings) as
 * 'log', arrays as 'tab' or 'dir' and objects as 'dir'.
 */
export const LogFmt = Object.freeze({
  log: 'log',
  dir: 'dir',
  tab: 'table',
});

// The global log level
export let LOGLEV;

if (typeof (LOGLEV) === 'undefined') { LOGLEV = Level.None; }

/**
 * Gets name of calling function name for logging purposes.
 * @param {RegExp} replacePattern - Pattern to replace from start of function
 *   name as it is returned from the stack trace.
 *   Default: /http.*\/js\//
 * @param {string} replaceStr - Replacement string for pattern from start of
 *   function name as it is returned from the stack trace. Default: ''
 * @param {number} padLen - Length for left-padding function name. Default: 52
 * @returns {string} The caller function name, filtered as specified.
 * @example
 * // Example import:
 * import { Level, loggingAt, logging, ctxt, log } from './logging.js';
 *
 * // Example usage:
 * LOGLEV = Level.Debug;
 * function someFunc() {
 *   log(Level.Info, `The current log level is '${LOGLEV}'`, ctxt());
 *   log(Level.Debug, `This is a debugging message`, ctxt());
 * }
 *
 * // Specifying non-default args:
 * // Note: Set args to 'undefined' for default parameter values
 * const ctxt1 = ctxt(/.*[@].*\/js\//);
 * const ctxt2 = ctxt(undefined, ':');
 * const ctxt3 = ctxt(undefined, undefined, 60);
 */
export function ctxt(replacePattern, replaceStr, padLen) {
  replacePattern = replacePattern || /http.*\/js\//;

  replaceStr = replaceStr || '';

  padLen = padLen || 52;

  // Note: You cannot use 'ctxt.caller.name' in strict mode.
  // The following is a completely hacky option - See:
  // Get current function name in strict mode
  // asked Jul 18, 2016 at 11:22
  // by exebook
  // https://stackoverflow.com/questions/
  //   38435450/get-current-function-name-in-strict-mode
  // [16spe23]

  const stack = new Error().stack;
  let caller = stack.split('\n')[1].trim();

  if (replacePattern !== undefined) {
    caller = caller.replace(replacePattern, replaceStr);
  }

  return caller.padStart(padLen, ' ');
}

/**
 * Checks if the logging level is enabled, i.e. if it is above 'Level.None'.
 * @returns {boolean} true if logging is enabled, false if not.
 * @example
 * if (logging()) { log(Level.Info, 'Logging is enabled.'); }
 */
export function logging() {
  return ((LOGLEV || 0) > Level.None);
}

/**
 * Checks if the logging level is enabled at or above the specified level.
 * @param {object} level - The `Level` value to check.
 * @returns {boolean} true if logging is enabled at or above the specified
 *   level, false if not.
 * @example
 * if (loggingAt(Level.Info)) { log(Level.Info, 'Logging at info level.'); }
 * if (loggingAt(Level.Debug)) { log(Level.Info, 'Logging at debug level.'); }
 */
export function loggingAt(level) {
  return ((LOGLEV || 0) >= level);
}

/**
 * Logs the given message at the current global logging level.
 * @param {object} level - A valid `Level` value which is the logging level
 *   at which to log this message.
 * @param {object} obj - The object to log at the specified logging level. this
 *   would typically be a string (message) but could also be, e.g., an array
 *   or class object, particularly if used in conjunction with a non-defualt
 *   value for `logFmt`.
 * @param {string} logCtxt - The logging context. Can be any string but would
 *   usually contain information about the calling function.
 * @param {object} logFmt - A valid `LogFmt` value. Valid options: 'log', 'dir',
 *   'tab'. 'log' will log as one of console.log, console.warn or console.error;
 *   'dir' will log as console.dir; 'tab' will log as console.table.
 *   Default: 'log'
 * @example
 * LOGLEV = Level.Info;
 * log(Level.Info, `The current log level is '${LOGLEV}'`, ctxt());
 *
 * const value = { 1: 'one', 2: 'two', 3: 'three' };
 * log(Level.Debug, value, ctxt(), 'tab');
 * log(Level.Debug, value, ctxt(), 'dir');
 *
 * class Fruit {
 *   constructor(type, colour) {
 *     this.type = type;
 *     this.colour = colour;
 *   }
 *  }
 * log(Level.Vbose, new Fruit('avo', 'green'), ctxt(), 'dir');
 */
export function log(level, obj, logCtxt, logFmt) {

  if ((LOGLEV || 0) < level) { return; }

  logFmt = logFmt || 'log';

  let msg = null;

  switch (logFmt) {

  case 'log':
    logCtxt = (logCtxt || '').length === 0 ? '' : `[${logCtxt}]`;
    msg = `${logCtxt} ${level}: ${obj}`;

    switch (level) {
    case Level.Error:
      console.error(msg);
      break;
    case Level.Warn:
      console.warn(msg);
      break;
    default:
      console.log(msg);
      break;
    }
    break;

  case 'dir':
    console.dir(obj);
    break;

  case 'tab':
    console.table(obj);
    break;

  default:
    break;
  }
}

// =============================================================================
