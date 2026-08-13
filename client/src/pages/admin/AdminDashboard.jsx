import { Link } from 'react-router-dom';
import AdminNavbar from './AdminNavbar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import '../../styles/admin.css';

/* Each destination is named for what is inside it and carries one line saying
   what you would come here to do — a grid of five identical blue buttons made
   you read all five labels every time. */
const SECTIONS = [
  {
    to: '/admin/users',
    icon: 'users',
    title: 'Users',
    desc: 'Everyone registered, their listing counts, and the ban control.',
  },
  {
    to: '/admin/properties',
    icon: 'building',
    title: 'Listings',
    desc: 'Every published property and who submitted it.',
  },
  {
    to: '/admin/verify-requests',
    icon: 'badgeCheck',
    title: 'Verification requests',
    desc: 'Pending identity documents awaiting approval or rejection.',
  },
  {
    to: '/admin/reports',
    icon: 'flag',
    title: 'Reports',
    desc: 'Listings that users have flagged as a problem.',
    caution: true,
  },
  {
    to: '/admin/banned',
    icon: 'ban',
    title: 'Banned owners',
    desc: 'Accounts currently banned, and the control to lift a ban.',
    caution: true,
  },
];

export default function AdminDashboard() {
  return (
    <div className="page-admin">
      <a className="pf-skip-link" href="#main">
        Skip to sections
      </a>
      <AdminNavbar />

      <main id="main" className="pf-below-appbar">
        <div className="pf-container admin">
          <header className="pf-page-head">
            <div>
              <h1 className="pf-page-head__title">Admin</h1>
              <p className="pf-page-head__sub">
                Moderation and account management for PropertyFinder.
              </p>
            </div>
          </header>

          <nav className="admin__grid" aria-label="Admin sections">
            {SECTIONS.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className={`admin__tile${s.caution ? ' admin__tile--caution' : ''}`}
              >
                <span className="admin__tile-icon">
                  <Icon name={s.icon} size={20} />
                </span>
                <span>
                  <span className="admin__tile-title">{s.title}</span>
                  <span className="admin__tile-desc">{s.desc}</span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </main>
    </div>
  );
}
