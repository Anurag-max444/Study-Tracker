import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format, differenceInDays } from 'date-fns'

const TYPES = [{ v: 'short', l: '📅 Short Term (1-4 weeks)' }, { v: 'medium', l: '📆 Medium Term (1-3 months)' }, { v: 'long', l: '🗓️ Long Term (6+ months)' }]
const TYPE_COLORS = { short: '#10b981', medium: '#f59e0b', long: '#6366f1' }

const PRESET_GOALS = [
  { label: '✅ Rojana 4 ghante padhna', type: 'short', target_date: '' },
  { label: '📚 Math ka ek chapter weekly khatam karna', type: 'short', target_date: '' },
  { label: '🧪 Har mahine 2 mock tests dena', type: 'medium', target_date: '' },
  { label: '🎯 SSC CHSL exam clear karna', type: 'long', target_date: '2027-01-01' },
  { label: '🎓 Graduation complete karna', type: 'long', target_date: '2029-01-01' },
  { label: '🏛️ Government job pakka karna', type: 'long', target_date: '2028-06-01' },
]

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [label, setLabel] = useState('')
  const [type, setType] = useState('short')
  const [targetDate, setTargetDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
      .then(({ data }) => { setGoals(data || []); setLoading(false) })
  }, [user])

  async function addGoal(e) {
    e.preventDefault()
    if (!label.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('goals').insert([{ user_id: user.id, label: label.trim(), type, target_date: targetDate || null, progress: 0 }]).select()
    if (!error && data) setGoals([...goals, data[0]])
    setLabel('')
    setSaving(false)
  }

  async function addPreset(g) {
    setSaving(true)
    const { data, error } = await supabase.from('goals').insert([{ user_id: user.id, ...g, progress: 0 }]).select()
    if (!error && data) setGoals([...goals, data[0]])
    setSaving(false)
  }

  async function updateProgress(id, progress) {
    await supabase.from('goals').update({ progress: Math.min(100, Math.max(0, progress)) }).eq('id', id)
    setGoals(goals.map(g => g.id === id ? { ...g, progress } : g))
  }

  async function deleteGoal(id) {
    await supabase.from('goals').delete().eq('id', id)
    setGoals(goals.filter(g => g.id !== id))
  }

  const inp = { padding: '10px 14px', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', width: '100%' }

  const grouped = { short: goals.filter(g => g.type === 'short'), medium: goals.filter(g => g.type === 'medium'), long: goals.filter(g => g.type === 'long') }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Goals & Roadmap 🎯</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: '1.5rem' }}>Chhote se bade — sab goals track karo</p>

      {/* Preset goals */}
      {goals.length === 0 && !loading && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdfa, #f0f9ff)', border: '1px solid var(--teal-50)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--teal-dark)', marginBottom: '0.75rem' }}>🚀 Quick start — common goals add karo</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESET_GOALS.map((g, i) => (
              <button key={i} onClick={() => addPreset(g)} style={{ padding: '6px 12px', background: '#fff', border: '1px solid var(--teal-50)', borderRadius: 8, fontSize: 13, color: 'var(--teal-dark)', cursor: 'pointer', fontWeight: 500 }}>{g.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Add goal */}
      <form onSubmit={addGoal} style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input style={{ ...inp, flex: 2, minWidth: 160 }} value={label} onChange={e => setLabel(e.target.value)} placeholder="Naya goal likho..." />
          <select style={{ ...inp, width: 'auto', minWidth: 160 }} value={type} onChange={e => setType(e.target.value)}>
            {TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
          <input type="date" style={{ ...inp, width: 'auto', minWidth: 140 }} value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          <button type="submit" disabled={saving || !label.trim()} style={{ padding: '10px 20px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: !label.trim() ? 0.5 : 1 }}>+ Add</button>
        </div>
      </form>

      {/* Goals by type */}
      {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading...</div>}
      {TYPES.map(({ v, l }) => grouped[v].length > 0 && (
        <div key={v} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: TYPE_COLORS[v], textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>{l}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {grouped[v].map(goal => {
              const daysLeft = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : null
              return (
                <div key={goal.id} style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', boxShadow: 'var(--shadow)', borderLeft: `3px solid ${TYPE_COLORS[v]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-800)' }}>{goal.label}</div>
                      {goal.target_date && (
                        <div style={{ fontSize: 12, color: daysLeft < 7 ? '#ef4444' : daysLeft < 30 ? '#f59e0b' : 'var(--gray-400)', marginTop: 2 }}>
                          {daysLeft > 0 ? `⏳ ${daysLeft} din baaki` : daysLeft === 0 ? '🎯 Aaj!' : '⚠️ Time over'}
                          {' · '}{format(new Date(goal.target_date), 'dd MMM yyyy')}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 18, color: TYPE_COLORS[v] }}>{goal.progress}%</span>
                      <button onClick={() => deleteGoal(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-300)', fontSize: 14 }} onMouseEnter={e => e.target.style.color = '#ef4444'} onMouseLeave={e => e.target.style.color = 'var(--gray-300)'}>✕</button>
                    </div>
                  </div>
                  <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ height: '100%', background: TYPE_COLORS[v], width: `${goal.progress}%`, borderRadius: 10, transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0, 25, 50, 75, 100].map(p => (
                      <button key={p} onClick={() => updateProgress(goal.id, p)} style={{ flex: 1, padding: '4px', fontSize: 11, fontWeight: 600, border: `1px solid ${goal.progress === p ? TYPE_COLORS[v] : 'var(--gray-200)'}`, borderRadius: 6, background: goal.progress === p ? `${TYPE_COLORS[v]}18` : 'transparent', color: goal.progress === p ? TYPE_COLORS[v] : 'var(--gray-400)', cursor: 'pointer' }}>{p}%</button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {!loading && goals.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-300)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-400)', marginBottom: 4 }}>Koi goal set nahi hai</div>
          <div style={{ fontSize: 13 }}>Upar se pehla goal add karo ya preset use karo</div>
        </div>
      )}
    </div>
  )
}
