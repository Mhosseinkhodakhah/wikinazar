import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { useEffect, useRef, useState } from 'react';

const menuItems = [
  { path: '/', labelKey: 'dashboard', permission: 'dashboard', icon: '📊' },
  { path: '/admins', labelKey: 'admins', permission: 'admins', icon: '👤' },
  { path: '/users', labelKey: 'users', permission: 'users', icon: '👥' },
  { path: '/subjects', labelKey: 'subjects', permission: 'subjects', icon: '📚' },
  { path: '/experiences', labelKey: 'experiences', permission: 'experiences', icon: '✍️' },
  { path: '/requests', labelKey: 'requests', permission: 'requests', icon: '📋' },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const { t, lang, toggleLang, dir } = useI18n();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const hasPermission = (permission: string) => {
    if (!admin) return false;
    return admin.isSuperAdmin || admin.permissions.includes(permission);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const s = {
    overlay: {
      position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40,
      display: sidebarOpen ? 'block' : 'none',
    },
    sidebar: {
      width: 280, height: '100vh', background: '#0f172a', color: '#fff',
      display: 'flex', flexDirection: 'column' as const, position: 'fixed' as const,
      left: dir === 'rtl' ? (sidebarOpen ? 0 : -280) : (sidebarOpen ? 0 : -280),
      top: 0, zIndex: 50, transition: 'left 0.3s ease',
      boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
    },
    sidebarDesktop: {
      width: 280, height: '100vh', background: '#0f172a', color: '#fff',
      display: 'flex', flexDirection: 'column' as const,
    },
    header: {
      padding: '1.5rem 1.25rem', borderBottom: '1px solid #1e293b',
    },
    logo: {
      fontSize: '1.25rem', fontWeight: 700, color: '#fff',
      display: 'flex', alignItems: 'center', gap: 8,
    },
    logoDot: {
      width: 8, height: 8, borderRadius: '50%', background: '#6366f1', display: 'inline-block',
    },
    adminInfo: {
      display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
      fontSize: '0.8rem', color: '#94a3b8',
    },
    superBadge: {
      fontSize: '0.65rem', background: '#6366f1', color: '#fff',
      padding: '2px 8px', borderRadius: 10, fontWeight: 600,
    },
    nav: {
      flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column' as const, gap: 2,
      overflowY: 'auto' as const,
    },
    link: (isActive: boolean) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0.65rem 0.85rem', borderRadius: 8,
      textDecoration: 'none', fontSize: '0.875rem',
      color: isActive ? '#fff' : '#94a3b8',
      background: isActive ? '#1e293b' : 'transparent',
      transition: 'all 0.15s ease',
      borderLeft: isActive ? `3px solid #6366f1` : '3px solid transparent',
    }),
    footer: {
      padding: '1rem 1.25rem', borderTop: '1px solid #1e293b',
      display: 'flex', flexDirection: 'column' as const, gap: 8,
    },
    langBtn: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '0.5rem', borderRadius: 8, border: '1px solid #334155',
      background: 'transparent', color: '#94a3b8', cursor: 'pointer',
      fontSize: '0.8rem', transition: 'all 0.15s ease',
    },
    logoutBtn: {
      padding: '0.6rem', borderRadius: 8, border: 'none',
      background: '#ef4444', color: '#fff', cursor: 'pointer',
      fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.15s ease',
    },
    hamburger: {
      display: 'block', background: 'none', border: 'none', color: '#64748b',
      fontSize: '1.5rem', cursor: 'pointer', padding: 4,
    },
    main: {
      flex: 1,
      minHeight: '100vh', background: '#f1f5f9',
      transition: 'margin 0.3s ease',
    },
    mainContent: {
      padding: '1.5rem 2rem',
    },
    topBar: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #e2e8f0',
    },
  };

  const sidebarContent = (
    <>
      <div style={s.header}>
        <div style={s.logo}>
          <span style={s.logoDot} />
          WikiNazar
        </div>
        <div style={s.adminInfo}>
          <span>{admin?.displayName || admin?.username}</span>
          {admin?.isSuperAdmin && <span style={s.superBadge}>{t.sidebar.super}</span>}
        </div>
      </div>
      <nav style={s.nav}>
        {menuItems
          .filter((item) => hasPermission(item.permission))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => s.link(isActive)}
            >
              <span>{item.icon}</span>
              <span>{t.sidebar[item.labelKey as keyof typeof t.sidebar] as string}</span>
            </NavLink>
          ))}
      </nav>
      <div style={s.footer}>
        <button onClick={toggleLang} style={s.langBtn}>
          {lang === 'fa' ? '🇬🇧 English' : '🇮🇷 فارسی'}
        </button>
        <button onClick={handleLogout} style={s.logoutBtn}>
          {t.app.logout}
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={s.overlay} onClick={() => setSidebarOpen(false)} />
      <div ref={sidebarRef} style={s.sidebar}>
        {sidebarContent}
      </div>
      <div style={s.main}>
        <div style={s.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={s.hamburger}
            >
              ☰
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
              {t.app.title}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={toggleLang} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b' }}>
              {lang === 'fa' ? 'English' : 'فارسی'}
            </button>
          </div>
        </div>
        <div style={s.mainContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
