// =============================================================================
/*! countinmultiples */
/*! author: Toni Price (https://toni.rbind.io) */
// =============================================================================

/**
 * Class to manage animating the HTML title.
 * @typedef {Object} TitleAnimator
 */
export class TitleAnimator {

  // See:
  // Vanilla Javascript Text Animation Tutorial
  // developedbyed
  // Dec 28, 2019
  // https://www.youtube.com/watch?v=GUEB9FogoP8
  // [13sep23]

  // TODO: Initialise with execInterval param and perhaps other vars
  /**
   * Constructor for TitleAnimator.
   */
  constructor() {
    this.execInterval = 50;
  }

  /**
   * Animates the HTML title.
   */
  animate = () => {

    const text = document.querySelector('.notice-me');

    const strText = text.textContent;
    const splitText = strText.split('');

    text.textContent = '';

    splitText.forEach(function(letter) {
      text.innerHTML += `<span>${letter}</span>`;
    });

    let char = 0;
    let titleTimer = setInterval(onTick, this.execInterval);

    /**
     * Fades the next character in the HTML title.
     */
    function onTick() {
      const span = text.querySelectorAll('span')[char];
      span.classList.add('fade');
      char++;
      if (char == splitText.length) {
        stopTimer();
        return;
      }
    }

    /**
     * Stops the animation timer.
     */
    function stopTimer() {
      clearInterval(titleTimer);
      titleTimer = null;
    }
  };
}

// =============================================================================
