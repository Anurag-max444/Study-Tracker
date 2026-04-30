import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'

const PRESETS = [{ label: '25 min', s: 1500 }, { label: '45 min', s: 2700 }, { label: '1 hour', s: 3600 }, { label: '5 min break', s: 300 }]

export default function TimerPage() {
  const { user } = useAuth()
  const [secs, setSecs] = useState(1500)
  const [total, setTotal] = useState(1500)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [todayHours, setTodayHours] = useState(0)
  const [logStatus, setLogStatus] = useState('')
  const ivRef = useRef(null)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    if (!user) return
    supabase.from('study_logs').select('*').eq('user_id', user.id).eq('date', today).single()
      .then(({ data }) => { if (data) setTodayHours(data.hours || 0) })
  }, [user])

  useEffect(() => {
    if (running) {
      ivRef.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) {
            clearInterval(ivRef.current)
            setRunning(false)
            const hrs = total / 3600
            setSessions(n => n + 1)
            logStudyTime(hrs)
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('StudyVault ⏱️', { body: 'Session khatam! Break lo bhai.' })
            }
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(ivRef.current)
    }
    return () => clearInterval(ivRef.current)
  }, [running])

  async function logStudyTime(hrs) {
    if (!user) return
    setLogStatus('Saving...')
    const { data: existing } = await supabase.from('study_logs').select('*').eq('user_id', user.id).eq('date', today).single()
    if (existing) {
      const newHours = Math.round((existing.hours + hrs) * 100) / 100
      await supabase.from('study_logs').update({ hours: newHours, sessions: (existing.sessions || 0) + 1 }).eq('id', existing.id)
      setTodayHours(newHours)
    } else {
      await supabase.from('study_logs').insert([{ user_id: user.id, date: today, hours: Math.round(hrs * 100) / 100, sessions: 1 }])
      setTodayHours(Math.round(hrs * 100) / 100)
    }
    setLogStatus('✓ Saved!')
    setTimeout(() => setLogStatus(''), 2000)
  }

  function setPreset(s) {
    setRunning(false)
    setSecs(s)
    setTotal(s)
  }
  function toggle() { setRunning(r => !r) }
  function reset() { setRunning(false); setSecs(total) }

  const pct = Math.round(((total - secs) / total) * 100)
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  const r = 90, circ = 2 * Math.PI * r
  const dash = circ - (pct / 100) * circ

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Focus Timer ⏱️</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: '1.5rem' }}>Pomodoro technique — distraction-free padhai</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Timer circle */}
        <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
            <svg width={220} height={220} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={110} cy={110} r={r} fill="none" stroke="var(--gray-100)" strokeWidth={10} />
              <circle cx={110} cy={110} r={r} fill="none" stroke={running ? 'var(--teal)' : 'var(--blue)'} strokeWidth={10}
                strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 38, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: 2 }}>{m}:{s}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{running ? '🔴 Focus mode' : '⏸ Paused'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: '1rem' }}>
            <button onClick={toggle} style={{ padding: '12px 32px', background: running ? '#fff' : 'var(--teal)', color: running ? 'var(--teal)' : '#fff', border: `2px solid var(--teal)`, borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            <button onClick={reset} style={{ padding: '12px 20px', background: '#fff', color: 'var(--gray-500)', border: '1px solid var(--gray-200)', borderRadius: 10, fontSize: 15, cursor: 'pointer' }}>↺</button>
          </div>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {PRESETS.map(p => (
              <button key={p.s} onClick={() => setPreset(p.s)} style={{ padding: '6px 12px', background: total === p.s ? 'var(--teal-bg)' : 'var(--gray-50)', border: `1px solid ${total === p.s ? 'var(--teal-50)' : 'var(--gray-200)'}`, borderRadius: 8, fontSize: 12, fontWeight: 500, color: total === p.s ? 'var(--teal-dark)' : 'var(--gray-500)', cursor: 'pointer' }}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Aaj ka report</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Sessions done', sessions, '🍅'], ['Hours padha', todayHours.toFixed(1) + 'h', '⏰'], ['Goal progress', Math.min(100, Math.round((todayHours / 4) * 100)) + '%', '🎯'], ['Remaining', Math.max(0, 4 - todayHours).toFixed(1) + 'h', '⏳']].map(([l, v, i]) => (
                <div key={l} style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{i}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: 'var(--teal-dark)' }}>{v}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            {logStatus && <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: 'var(--teal)', fontWeight: 500 }}>{logStatus}</div>}
          </div>

          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-50)', borderRadius: 'var(--radius)', padding: '1rem' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-dark)', marginBottom: 6 }}>💡 Tips for focus</div>
            <ul style={{ fontSize: 13, color: 'var(--teal-dark)', lineHeight: 1.8, paddingLeft: '1rem' }}>
              <li>Phone ko dusre kamre mein rakh do</li>
              <li>25 min ke baad 5 min ka break lo</li>
              <li>Ek kaam at a time karo</li>
              <li>Pani peete raho beech beech mein</li>
            </ul>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1rem', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>Manual log karo</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" min="0" max="12" step="0.5" defaultValue={1} id="manual-hrs" style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none' }} />
              <button onClick={() => { const h = parseFloat(document.getElementById('manual-hrs').value) || 0; if (h > 0) logStudyTime(h) }} style={{ padding: '8px 16px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Log</button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Agar timer use nahi kiya toh manually log karo</div>
          </div>
        </div>
      </div>
    </div>
  )
}
