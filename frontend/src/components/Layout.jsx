import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Receipt, CreditCard, BarChart3, Settings, LogOut, Sun, Moon, Menu, X, Bell } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/expenses', icon: Receipt, label: 'Expenses' },
  { path: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ mobile = false, user, sidebarOpen, setMobileOpen, handleLogout, initials }) => (
  <div style={{
    width: mobile ? '280px' : sidebarOpen ? '240px' : '72px',
    height: '100vh',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    transition: 'width 0.3s ease',
    overflow: 'hidden',
    flexShrink: 0,
  }}>
    {/* Logo */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 6px', marginBottom: '28px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>💹</div>
      {(sidebarOpen || mobile) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ overflow: 'hidden' }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: '800', fontSize: '16px', whiteSpace: 'nowrap' }} className="gradient-text">FinTracker</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Pro Edition</div>
        </motion.div>
      )}
    </div>

    {/* Nav Items */}
    <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {navItems.map(({ path, icon: IconItem, label }) => (
        <NavLink key={path} to={path} end={path === '/'} onClick={() => mobile && setMobileOpen(false)}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          style={{ justifyContent: sidebarOpen || mobile ? 'flex-start' : 'center' }}
        >
          <IconItem size={18} style={{ flexShrink: 0 }} />
          {(sidebarOpen || mobile) && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
        </NavLink>
      ))}
    </nav>

    {/* Bottom section */}
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {/* User avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px', borderRadius: '10px', marginBottom: '4px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
          {initials}
        </div>
        {(sidebarOpen || mobile) && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
        )}
      </div>

      <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', justifyContent: sidebarOpen || mobile ? 'flex-start' : 'center', color: '#ef4444' }}>
        <LogOut size={18} />
        {(sidebarOpen || mobile) && <span>Logout</span>}
      </button>
    </div>
  </div>
);

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <div className="animated-bg" />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} sidebarOpen={sidebarOpen} setMobileOpen={setMobileOpen} handleLogout={handleLogout} initials={initials} />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }} className="lg:hidden" />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 30 }}
              style={{ position: 'fixed', left: 0, top: 0, zIndex: 50 }} className="lg:hidden">
              <Sidebar mobile user={user} sidebarOpen={sidebarOpen} setMobileOpen={setMobileOpen} handleLogout={handleLogout} initials={initials} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{ height: '64px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setMobileOpen(true)} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '4px' }}>
              <Menu size={22} />
            </button>
            <button onClick={toggleSidebar} className="hidden lg:block" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
              <Menu size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={toggleTheme} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', position: 'relative' }}>
              <Bell size={16} />
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }} />
            </button>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: 'white', cursor: 'pointer' }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
