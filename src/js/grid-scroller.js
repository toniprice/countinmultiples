// =============================================================================
/*! countinmultiples */
/*! author: Toni Price (https://toni.rbind.io) */
// =============================================================================

import { Level, ctxt, log } from './logging.js';

// =============================================================================

/**
 * Class to handle scrolling of the grid if the animation goes vertically
 *   outside of the current viewport.
 * @typedef {Object} GridScroller
 */
export class GridScroller {

  #observerOpts = null;

  #observer = null;

  /**
   * Constructor for GridScroller class.
   */
  constructor() {
    this.#observerOpts = {
      // Set root to null to make it the viewport
      root: null,
      rootMargin: '0px',
      // Set to 1 so that the callback will fire when even 1px is outside of the
      // viewport
      threshold: 1,
    };
  }

  /**
   * Resets the window scroll position to the top left.
   */
  resetScrollPos = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  /**
   * Handles scrolling when an element goes vertically outside of the current
   *   viewport.
   *
   * @param {string} targetId - HTML id of the target element to observe.
   * @param {number} vScroll - An integer value for the number of pixels to
   *   to scroll along the Y axis when the currently animated cell goes past
   *   the end of the vertical viewport. Default: 100.
   */
  initialise = (targetId, vScroll) => {

    // Vertical scroll distance in pixels
    vScroll = vScroll || 220;

    log(Level.Vbose, `-> Initialising GridScroller for '${targetId}'`, ctxt());

    // IntersectionObserver: find out when element is outside viewport
    // asked May 12, 2019 at 13:51
    // Helenesh
    // https://stackoverflow.com/questions/56099931/intersectionobserver-find-out-when-element-is-outside-viewport
    // [31jan24]

    /**
     * Checks if any of the given HTML elements are outside the viewport.
     *
     * @param {Array<Object>} entries An array of HTML elements to check.
     * @param {Object} observer The observer object for which to check the
     *   entries.
     */
    function onAnimate(entries) {
      entries.forEach((entry) => {

        const isInView = entry.isIntersecting;

        if (!isInView) {
          log(Level.Vbose, `'${entry.target.id}' is not in view`, ctxt());
          window.scrollBy({
            top: vScroll,
            left: 0,
            behavior: 'smooth',
          });
        }
      });
    }

    this.#observer = new IntersectionObserver(onAnimate, this.#observerOpts);
  };

  /**
   * Sets the observer to observe a particular target element.
   *
   * @param {string} targetId - HTML id of the target element to observe.
   */
  startObserving = (targetId) => {
    if (this.#observer != null) {
      const target = document.querySelector(`#${targetId}`);
      if (target != null) {
        log(Level.Vbose, `-> Starting to observe ${targetId}`, ctxt());
        this.#observer.observe(target);
      }
    }
  };

  /**
   * Stops the observer from observing a particular target element.
   * Note that no exception is thrown if the specified element is not being
   * observed so it is safe to call this function multiple times.
   * (See Mozilla MDN Web APIs: Intersection Observer API at
   * https://developer.mozilla.org/en-US/docs/Web/API)
   *
   * @param {Object} targetElmt - The target HTML element to unobserve.
   */
  stopObservingElmt = (targetElmt) => {
    if (this.#observer != null) {
      if (targetElmt != null) {
        this.#observer.unobserve(targetElmt);
      }
    }
  };

  /**
   * Stops the observer from observing the element with the given target id.
   * Note that no exception is thrown if the specified element is not being
   * observed so it is safe to call this function multiple times.
   * (See Mozilla MDN Web APIs: Intersection Observer API at
   * https://developer.mozilla.org/en-US/docs/Web/API)
   *
   * @param {string} targetId - HTML id of the target element to unobserve.
   */
  stopObserving = (targetId) => {
    if (this.#observer != null) {
      const target = document.querySelector(`#${targetId}`);
      if (target != null) {
        this.#observer.unobserve(target);
      }
    }
  };
}

// =============================================================================
