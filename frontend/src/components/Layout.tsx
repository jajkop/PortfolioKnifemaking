import { Link, Outlet, useLocation } from 'react-router-dom';
import { siteConfig } from '../config/site';

export default function Layout() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="" className="logo-mark" aria-hidden="true" />
            <span className="logo-text">{siteConfig.logoText}</span>
          </Link>
          <nav className="site-nav">
            <Link to="/" className={location.pathname === '/' ? 'active' : undefined}>
              Portfolio
            </Link>
            <Link to="/kontakt" className={location.pathname === '/kontakt' ? 'active' : undefined}>
              Kontakt
            </Link>
          </nav>
        </div>
      </header>

      <main className={`page-content ${isAdminArea ? 'page-content-admin' : 'page-content-public'}`}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p>{siteConfig.footerText}</p>
        </div>
      </footer>
    </div>
  );
}
