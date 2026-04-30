import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns'

const QUOTES = [
  { q: 'Sapne woh nahi jo neend mein aate hain, sapne woh hain jo neend nahi aane dete.', a: 'APJ Abdul Kalam' },
  { q: 'Mushkilen aati hain toh insaan ko aazmaane, agar ye na hoti toh hum kya seekh paate.', a: 'Unknown' },
  { q: 'Safalta ka koi shortcut nahi hota, mehnat hi rasta hai.', a: 'Unknown' },
  { q: 'Jo sapne dekhte hain unhe poora karne ki dum chahiye.', a: 'Unknown' },
  { q: 'Padhai karo, distraction hatao, government job pakki karo.', a: 'StudyVault' },
]

const StatCard = ({ icon, label, value, sub, color = 'var(--teal)' }) => (
  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{sub}</div>}
  </div>
)

export default function DashboardPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [logs, setLogs] = useState([])
  const [tasks, setTasks] = useState([])
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    if (!user) return
    supabase.from('study_logs').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(30).then(({ data }) => setLogs(data || []))
    supabase.from('tasks').select('*').eq('user_id', user.id).eq('date', today).then(({ data }) => setTasks(data || []))
  }, [user])

  const todayLog = logs.find(l => l.date === today)
  const todayHours = todayLog?.hours || 0
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekHours = logs.filter(l => {
    const d = new Date(l.date)
    return d >= weekStart && d <= new Date()
  }).reduce((s, l) => s + (l.hours || 0), 0)

  let streak = 0
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date))
  for (let i = 0; i < sortedLogs.length; i++) {
    const expected = format(addDays(new Date(), -i), 'yyyy-MM-dd')
    if (sortedLogs[i]?.date === expected && sortedLogs[i].hours > 0) streak++
    else break
  }

  const doneTasks = tasks.filter(t => t.done).length
  const totalTasks = tasks.length

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)' }}>Namaste! 👋</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 4, fontSize: 15 }}>{format(new Date(), 'EEEE, d MMMM yyyy')} — Aaj kya padha?</p>
      </div>

      {/* Quote card */}
      <div style={{ background: 'linear-gradient(135deg, var(--teal-dark), var(--blue-dark))', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', color: '#fff' }}>
        <div style={{ fontSize: 14, fontStyle: 'italic', lineHeight: 1.6, marginBottom: 8 }}>"{quote.q}"</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>— {quote.a}</div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        <StatCard icon="⏰" label="Aaj padha" value={`${todayHours.toFixed(1)}h`} sub="Goal: 4 ghante" color="var(--teal)" />
        <StatCard icon="🔥" label="Streak" value={`${streak} din`} sub="Lagaataar" color="var(--amber)" />
        <StatCard icon="📅" label="Is hafte" value={`${weekHours.toFixed(1)}h`} sub="Weekly total" color="var(--blue)" />
        <StatCard icon="✅" label="Aaj tasks" value={`${doneTasks}/${totalTasks}`} sub="Completed" color="var(--green)" />
      </div>

      {/* Weekly streak calendar */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-600)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Is hafte ka record</h3>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          {weekDays.map((day, i) => {
            const ds = format(day, 'yyyy-MM-dd')
            const log = logs.find(l => l.date === ds)
            const has = log && log.hours > 0
            const today_ = isToday(day)
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 6 }}>{format(day, 'EEE')[0]}</div>
                <div style={{ width: '100%', aspectRatio: '1', borderRadius: 8, background: today_ ? 'var(--teal)' : has ? 'var(--teal-50)' : 'var(--gray-100)', border: today_ ? '2px solid var(--teal-dark)' : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: today_ ? '#fff' : has ? 'var(--teal-dark)' : 'var(--gray-300)' }}>
                  {has ? (log.hours > 0 ? '✓' : '') : today_ ? '·' : ''}
                </div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 4 }}>{log?.hours ? `${log.hours}h` : ''}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-600)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
          {[
            { icon: '⏱️', label: 'Timer shuru karo', to: '/timer' },
            { icon: '✅', label: 'Tasks dekho', to: '/tasks' },
            { icon: '📝', label: 'Note likho', to: '/notes' },
            { icon: '🧪', label: 'Test log karo', to: '/tests' },
          ].map(a => (
            <button key={a.to} onClick={() => nav(a.to)} style={{ padding: '12px 8px', background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', textAlign: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.target.style.background = 'var(--teal-bg)'; e.target.style.borderColor = 'var(--teal-50)'; e.target.style.color = 'var(--teal-dark)' }}
              onMouseLeave={e => { e.target.style.background = 'var(--gray-50)'; e.target.style.borderColor = 'var(--gray-100)'; e.target.style.color = 'var(--gray-700)' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</div>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
