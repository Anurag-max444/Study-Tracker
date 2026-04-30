import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const S = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #0d2d2a 50%, #0c1a2e 100%)', padding: '1rem', position: 'relative', overflow: 'hidden' },
  glow1: { position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
  glow2: { position: 'absolute', bottom: '-20%', left: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', pointerEvents: 'none' },
  card: { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 },
  logo: { textAlign: 'center', marginBottom: '2rem' },
  logoIcon: { width: 56, height: 56, background: 'linear-gradient(135deg, var(--teal), var(--blue))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 26 },
  logoTitle: { fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'var(--mono)' },
  logoSub: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 },
  tabs: { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4, marginBottom: '1.5rem' },
  tab: (active) => ({ flex: 1, padding: '8px', textAlign: 'center', fontSize: 14, fontWeight: 600, borderRadius: 8, cursor: 'pointer', border: 'none', transition: 'all 0.2s', background: active ? 'rgba(13,148,136,0.8)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.45)' }),
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 15, outline: 'none', transition: 'border 0.2s', marginBottom: '1rem' },
  btn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, var(--teal-dark), var(--blue-dark))', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4, letterSpacing: '0.3px' },
  err: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: '1rem' },
  ok: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 14px', color: '#6ee7b7', fontSize: 13, marginBottom: '1rem' },
}

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signIn, signUp } = useAuth()
  const nav = useNavigate()

  async function handle(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
        nav('/')
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setSuccess('Account ban gaya! Ab login karo.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message || 'Kuch gadbad hui. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      <div style={S.glow1} /><div style={S.glow2} />
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoIcon}>📚</div>
          <div style={S.logoTitle}>StudyVault</div>
          <div style={S.logoSub}>Teri private government job preparation</div>
        </div>
        <div style={S.tabs}>
          <button style={S.tab(mode === 'login')} onClick={() => setMode('login')}>Login</button>
          <button style={S.tab(mode === 'signup')} onClick={() => setMode('signup')}>Sign Up</button>
        </div>
        {error && <div style={S.err}>⚠️ {error}</div>}
        {success && <div style={S.ok}>✅ {success}</div>}
        <form onSubmit={handle}>
          <label style={S.label}>Email</label>
          <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tera@email.com" required onFocus={e => e.target.style.borderColor='var(--teal)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Strong password likho" required minLength={6} onFocus={e => e.target.style.borderColor='var(--teal)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
          <button style={S.btn} type="submit" disabled={loading}>
            {loading ? 'Wait karo...' : mode === 'login' ? '🚀 Dashboard kholo' : '✨ Account banao'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: '1.5rem' }}>
          🔒 Tera data fully private aur secure hai
        </p>
      </div>
    </div>
  )
}
