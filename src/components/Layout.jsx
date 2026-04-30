import { useTheme } from '../hooks/useTheme'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠', exact: true },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { to: '/timer', label: 'Timer', icon: '⏱️' },
  { to: '/subjects', label: 'Subjects', icon: '📚' },
  { to: '/notes', label: 'Notes', icon: '📝' },
  { to: '/goals', label: 'Goals', icon: '🎯' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
  { to: '/tests', label: 'Mock Tests', icon: '🧪' },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const nav = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggle } = useTheme()

  async function handleSignOut() {
    await signOut()
    nav('/auth')
  }

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--teal), var(--blue))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📚</div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 16, color: 'var(--teal-dark)' }}>StudyVault</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Gov Job Prep</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.exact}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--teal-dark)' : 'var(--gray-600)',
              background: isActive ? 'var(--teal-bg)' : 'transparent',
              transition: 'all 0.15s',
            })}>
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--gray-100)' }}>
        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8, padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </div>
        <button onClick={handleSignOut} style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 13, color: 'var(--gray-500)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={toggle}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid var(--gray-200)',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--gray-500)',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8
          }}>
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
          🚪 Logout
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Desktop Sidebar */}
      <aside style={{ width: 220, background: '#fff', borderRight: '1px solid var(--gray-100)', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50, display: 'none', flexDirection: 'column' }} className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: 12, zIndex: 40 }}>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4 }}>☰</button>
        <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--teal-dark)', fontSize: 16 }}>📚 StudyVault
        <button
          onClick={toggle}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: '1px solid var(--gray-200)',
            borderRadius: 8,
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: 16,
            color: 'var(--gray-600)'
          }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 60 }} />
          <aside style={{ position: 'fixed', top: 0, left: 0, width: 240, height: '100vh', background: '#fff', zIndex: 70, boxShadow: 'var(--shadow-lg)' }}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <main style={{ flex: 1, marginTop: 56, padding: '1.5rem 1rem', maxWidth: '100%' }}>
        <Outlet />
      </main>

      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar { display: flex !important; }
          main { margin-left: 220px; margin-top: 0 !important; padding: 2rem 2rem !important; }
          header { display: none !important; }
        }
      `}</style>
    </div>
  )
}
