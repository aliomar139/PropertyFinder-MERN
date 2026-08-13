import { useAuth } from '../context/AuthContext.jsx';
import AppBar from './AppBar.jsx';

/* Main navigation. Destinations are named for their contents rather than a
   vague umbrella, and the set adapts to the signed-in role. */
export default function Navbar({ showLogout = true }) {
  const { user } = useAuth();

  const items = [{ to: '/home', label: 'Browse', icon: 'search' }];

  if (user?.role === 1) {
    items.push({ to: '/admin', label: 'Admin', icon: 'shield' });
  }

  if (user?.role === 0) {
    items.push(
      { to: '/my-properties', label: 'My listings', icon: 'building' },
      { to: '/favorites', label: 'Favourites', icon: 'heart' },
      { to: '/user', label: 'Profile', icon: 'user' }
    );
  }

  return <AppBar items={items} showLogout={showLogout} />;
}
