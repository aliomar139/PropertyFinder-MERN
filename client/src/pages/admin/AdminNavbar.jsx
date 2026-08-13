import AppBar from '../../components/AppBar.jsx';

/* Admin navigation. The five admin destinations are listed here as well as on
   the dashboard, so a deep admin page never traps you into going back twice. */
export default function AdminNavbar() {
  return (
    <AppBar
      items={[
        { to: '/home', label: 'Browse', icon: 'search' },
        { to: '/admin', label: 'Overview', icon: 'shield', end: true },
        { to: '/admin/users', label: 'Users', icon: 'users' },
        { to: '/admin/properties', label: 'Listings', icon: 'building' },
        { to: '/admin/verify-requests', label: 'Verification', icon: 'badgeCheck' },
        { to: '/admin/reports', label: 'Reports', icon: 'flag' },
        { to: '/admin/banned', label: 'Banned', icon: 'ban' }
      ]}
    />
  );
}
