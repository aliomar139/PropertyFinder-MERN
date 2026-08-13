import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import { prefersReducedMotion } from '../lib/motion.js';
import '../styles/welcome.css';

/* The knock-on-the-door intro. The metaphor is the product's identity, so it
   stays — but the door is now a real <button>, so it is reachable by keyboard
   and announced properly, and the copy no longer relies on percentage-offset
   absolute positioning that broke below 480px.

   Explicit "Sign in" / "Create account" links sit alongside the door: the
   playful path is offered, not imposed. */
export default function Welcome() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  function knock() {
    if (leaving) return;
    setLeaving(true);
    // Long enough for the scene to clear; skipped entirely when the user has
    // asked for reduced motion.
    setTimeout(() => navigate('/login'), prefersReducedMotion() ? 0 : 280);
  }

  return (
    <div className="page-welcome">
      <main className={`welcome${leaving ? ' is-leaving' : ''}`}>
        <div className="welcome__inner">
          <div className="welcome__copy">
            <p className="welcome__eyebrow">
              <Icon name="mapPin" size={14} />
              Lebanon · houses, apartments, villas &amp; cabins
            </p>
            <h1 className="welcome__title">
              Welcome to Property<em>Finder</em>
            </h1>
            <p className="welcome__lede">
              Browse verified listings, save the ones you love, and list your own place in a
              few minutes.
            </p>

            <div className="welcome__actions">
              <button type="button" className="pf-btn pf-btn--contrast pf-btn--lg" onClick={knock}>
                <Icon name="key" size={18} />
                <span>Knock on the door</span>
              </button>
              <Link to="/signup" className="pf-btn pf-btn--lg welcome__ghost">
                Create an account
              </Link>
            </div>

            <p className="welcome__signin">
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          </div>

          {/* The door itself: the same affordance as the button beside it, kept
              because it is the thing people remember about this screen. */}
          <button type="button" className="welcome__door" onClick={knock} aria-label="Knock on the door to sign in">
            <img src="/pictures/only-door.jpeg" alt="" width="340" height="520" />
            <span className="welcome__door-hint">
              <Icon name="chevronRight" size={16} />
              Knock
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}
