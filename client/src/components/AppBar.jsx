import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from './ui/Icon.jsx';
import Button, { IconButton } from './ui/Button.jsx';
import { ConfirmDialog } from './ui/Modal.jsx';
import Sheet from './ui/Sheet.jsx';
import { ThemePicker, ThemeToggle } from './ui/ThemeControl.jsx';

/* Wordmark. Rendered as text rather than an image so it inherits the user's
   text size and stays crisp at any zoom. (The old @font-face pointed at
   /KumarOne-Regular.ttf, which is not in the build — it silently fell back to
   the default sans everywhere.) */
export function Wordmark({ to = '/home', className = 'pf-appbar__brand' }) {
  return (
    <Link to={to} className={className}>
      Property<em>Finder</em>
    </Link>
  );
}

/* The single piece of app chrome. It is a translucent floating layer with page
   content scrolling underneath, rather than an opaque strip that permanently
   eats a slice of the viewport.

   Below 720px the inline links collapse into a bottom sheet, keeping every
   destination one tap away without cramming eight targets into 56px. */
export default function AppBar({ items, showLogout = true, brandTo = '/home', collapse }) {
  const collapseAt = collapse || (items.length > 4 ? 'wide' : 'narrow');
  const { logout, setFlash } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const barRef = useRef(null);

  // Deepen the material once content has moved underneath the bar.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function doLogout() {
    setConfirmLogout(false);
    setMenuOpen(false);
    setFlash('You have been signed out.');
    logout();
    navigate('/login');
  }

  const links = items.map((item) => (
    <NavLink key={item.to} to={item.to} end={item.end} className="pf-navlink">
      <Icon name={item.icon} size={17} />
      {item.label}
    </NavLink>
  ));

  return (
    <>
      <header
        className="pf-appbar"
        ref={barRef}
        data-collapse={collapseAt}
        data-scrolled={scrolled || undefined}
      >
        <Wordmark to={brandTo} />

        <nav className="pf-appbar__nav pf-appbar__nav--inline" aria-label="Main">
          {links}
        </nav>

        {/* Appearance and session sit in their own group, separated from
            navigation by a rule: they act on the app, not on where you are. */}
        <div className="pf-appbar__end">
          <ThemeToggle />
          {showLogout && (
            <IconButton label="Sign out" icon="logOut" onClick={() => setConfirmLogout(true)} />
          )}
        </div>

        <IconButton
          className="pf-appbar__menu-btn"
          label={menuOpen ? 'Close menu' : 'Open menu'}
          icon={menuOpen ? 'x' : 'menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        />
      </header>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <nav className="pf-sheet__group" aria-label="Main" onClick={() => setMenuOpen(false)}>
          {links}
        </nav>
        {/* Room to state the appearance choice in full, including "follow the
            system", which the bar's single toggle cannot express. */}
        <div className="pf-sheet__sep" />
        <ThemePicker />

        {showLogout && (
          <>
            {/* Session-ending action, spatially separated from navigation. */}
            <div className="pf-sheet__sep" />
            <Button
              variant="danger-quiet"
              icon="logOut"
              block
              onClick={() => {
                setMenuOpen(false);
                setConfirmLogout(true);
              }}
            >
              Sign out
            </Button>
          </>
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={doLogout}
        title="Sign out of PropertyFinder?"
        description="You will need to sign in again to manage your listings and favourites."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        destructive={false}
      />
    </>
  );
}
