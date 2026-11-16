/* The knobs of the "send it over" animation. The fields fly into a ball of light one after the other,
   in the order of the form: name, email, phone, message. The ball waits and breathes while the
   message goes out. When it is gone the ball shrinks to a small point, the scene zooms out, and in
   the distance you see the Earth: the small ball flies into it like a signal, the Earth answers with
   a ripple, and then the thank-you shows. Change a number here and the animation follows. It is a
   plain object that is read each time the animation starts. */
export const SEND = {
  /** the animation is at least this long, however fast the server answers (ms) */
  minDurationMs: 1800,
  /** how long one field takes to fly into the ball (s) */
  collapseSec: 0.45,
  /** the delay between one field and the next (s) */
  collapseStagger: 0.17,
  /** how out of focus the fields get on the way (px) */
  collapseBlur: 4,
  /** 1: the message is an envelope that opens for the fields and shuts; 0: a ball of light */
  envelope: 1,
  /** the radius of the ball, as a share of the height of the page (the envelope is drawn as big as this) */
  ballSize: 0.07,
  /** how much the ball squashes and stretches while it floats, as a share of its size */
  ballBreathe: 0.07,
  /** how far the ball drifts around while it waits (px) */
  floatPx: 22,
  /** how bouncy the ball is: the pull back before it leaves, the stretch in flight, the squash and bounce on landing, 0 to 1.5 */
  bounce: 1,
  /** how visible the thin line behind the signal is, 0 to 1 */
  trail: 0.8,
  /** how long the ball takes to shrink to a small point (s) */
  shrinkSec: 0.5,
  /** how long the page recedes to the left while the Earth comes in from the right (s) */
  zoomOutSec: 0.9,
  /** how long the signal takes to fly into the Earth (s) */
  flightSec: 1.15,
  /** how long the camera pans on to the right, with the Earth gliding to the left (s) */
  panSec: 1.4,
  /** how big the Earth is, as a share of the smallest side of the screen */
  earthSize: 0.13,
  /** how hard the stars streak to the right while the camera moves, 0 to 1 */
  zoomWarp: 0.3,
};
