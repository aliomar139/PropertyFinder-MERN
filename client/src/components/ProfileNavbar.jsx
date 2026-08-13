import AppBar from './AppBar.jsx';

/* Account section navigation. Same chrome, same position, different contents —
   so the bar never moves or changes shape between sections. */
export default function ProfileNavbar() {
  return (
    <AppBar
      items={[
        { to: '/home', label: 'Browse', icon: 'search' },
        { to: '/user', label: 'Profile', icon: 'user' },
        { to: '/user/change-pass', label: 'Password', icon: 'key' }
      ]}
    />
  );
}
