import { useLocation, Link } from 'react-router-dom';

const routeLabels = {
  '/': 'Dashboard',
  '/search': 'Search',
  '/browse': 'Browse',
  '/timeline': 'Timeline',
};

export default function Breadcrumbs({ archiveTitle }) {
  const location = useLocation();
  const path = location.pathname;

  const crumbs = [];

  if (path === '/') {
    crumbs.push({ label: 'Dashboard', to: '/' });
  } else if (path === '/search') {
    crumbs.push({ label: 'Dashboard', to: '/' });
    crumbs.push({ label: 'Search', to: '/search' });
  } else if (path === '/browse') {
    crumbs.push({ label: 'Dashboard', to: '/' });
    crumbs.push({ label: 'Browse', to: '/browse' });
  } else if (path === '/timeline') {
    crumbs.push({ label: 'Dashboard', to: '/' });
    crumbs.push({ label: 'Timeline', to: '/timeline' });
  } else if (path.startsWith('/view/')) {
    crumbs.push({ label: 'Dashboard', to: '/' });
    crumbs.push({ label: 'Browse', to: '/browse' });
    crumbs.push({ label: archiveTitle || 'View', to: path });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.to} className="breadcrumb-item">
            {i > 0 && <span className="breadcrumb-sep">›</span>}
            {isLast ? (
              <span className="breadcrumb-current">{crumb.label}</span>
            ) : (
              <Link to={crumb.to} className="breadcrumb-link">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
