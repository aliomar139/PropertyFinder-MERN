/* ============================================================================
   A small spring + gesture toolkit.

   Springs, not fixed-duration curves, for anything the user can touch: a spring
   always animates from wherever the value currently is, so a moving element can
   be grabbed and reversed mid-flight without a jump, and new input just changes
   the target rather than restarting the animation.

   Parameterised the way a designer thinks rather than the way a physics
   textbook does:
     damping  — overshoot. 1 = critically damped (no bounce). < 1 bounces.
     response — how quickly the value reaches the target, in seconds.
   ========================================================================= */

const REDUCED = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.(REDUCED).matches;
}

/* A running spring. `set` re-targets from the current position AND the current
   velocity, so a reversal blends instead of hitting a velocity brick wall. */
export function spring({
  from = 0,
  to = 0,
  velocity = 0,
  damping = 1,
  response = 0.35,
  restDelta = 0.05,
  onUpdate,
  onRest
}) {
  let value = from;
  let target = to;
  let v = velocity;
  let raf = null;
  let last = null;
  let done = false;

  // If the user asked for reduced motion, skip the travel: land on the target
  // immediately and let colour/opacity carry the feedback instead.
  if (prefersReducedMotion()) {
    onUpdate?.(target, 0);
    onRest?.(target);
    return { set: (t) => { target = t; onUpdate?.(t, 0); onRest?.(t); }, stop() {}, get value() { return target; }, get velocity() { return 0; } };
  }

  const step = (now) => {
    if (done) return;
    if (last == null) last = now;
    // Clamp dt so a backgrounded tab does not fling the spring on return.
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;

    const omega = (2 * Math.PI) / response;
    const k = omega * omega;
    const c = 2 * damping * omega;

    // Semi-implicit Euler: stable at the frame rates a display actually runs at.
    const a = -k * (value - target) - c * v;
    v += a * dt;
    value += v * dt;

    onUpdate?.(value, v);

    if (Math.abs(value - target) < restDelta && Math.abs(v) < restDelta * 10) {
      value = target;
      v = 0;
      done = true;
      onUpdate?.(value, 0);
      onRest?.(value);
      return;
    }
    raf = requestAnimationFrame(step);
  };

  raf = requestAnimationFrame(step);

  return {
    set(nextTarget, opts = {}) {
      target = nextTarget;
      if (opts.velocity != null) v = opts.velocity;
      if (opts.response != null) response = opts.response;
      if (opts.damping != null) damping = opts.damping;
      if (done) {
        done = false;
        last = null;
        raf = requestAnimationFrame(step);
      }
    },
    stop() {
      done = true;
      if (raf) cancelAnimationFrame(raf);
    },
    get value() {
      return value;
    },
    get velocity() {
      return v;
    }
  };
}

/* Where a flick would come to rest if it decelerated like a scroll view. Snap
   to the target nearest this projection, not to the one nearest the release
   point — that is what makes a flick feel like it throws the element. */
export function project(initialVelocity, decelerationRate = 0.998) {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/* Progressive resistance past a boundary. A hard stop reads as frozen; this
   reads as "still responsive, but there is nothing more here". */
export function rubberband(overshoot, dimension, constant = 0.55) {
  if (!dimension) return 0;
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/* Keeps a short position history so release velocity comes from the last few
   moves rather than a single noisy frame. */
export function createVelocityTracker(historyMs = 100) {
  let samples = [];
  return {
    reset(position, time) {
      samples = [{ position, time }];
    },
    add(position, time) {
      samples.push({ position, time });
      while (samples.length > 2 && time - samples[0].time > historyMs) samples.shift();
    },
    /** px per second */
    velocity() {
      if (samples.length < 2) return 0;
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = (last.time - first.time) / 1000;
      if (dt <= 0) return 0;
      return (last.position - first.position) / dt;
    }
  };
}

/* Apple's shipped values, kept in one place so every gesture in the app settles
   with the same character. Bounce is only ever used where a gesture carried
   momentum into the animation. */
export const SPRINGS = {
  /** Default UI move — graceful, never distracting. */
  move: { damping: 1, response: 0.4 },
  /** Sheet / drawer released from a drag. */
  sheet: { damping: 0.82, response: 0.3 },
  /** Snap after a flick. */
  flick: { damping: 0.8, response: 0.4 }
};
