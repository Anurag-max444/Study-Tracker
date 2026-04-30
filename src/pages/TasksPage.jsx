import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'

const SUBJECTS = ['Math', 'GS/GK', 'English', 'Reasoning', 'Science', 'Hindi', 'Current Affairs', 'Other']
const PRIORITIES = [{ v: 'high', l: 'High 🔴' }, { v: 'medium', l: 'Medium 🟡' }, { v: 'low', l: 'Low 🟢' }]
const SUBJECT_COLORS = { Math: '#6366f1', 'GS/GK': '#0d9488', English: '#f59e0b', Reasoning: '#8b5cf6', Science: '#10b981', Hindi: '#ec4899', 'Current Affairs': '#0ea5e9', Other: '#64748b' }

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [subject, setSubject] = useState('Math')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [saving, setSaving] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setTasks(data || []); setLoading(false) })
  }, [user])

  async function addTask(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('tasks').insert([{ user_id: user.id, text: text.trim(), subject, priority, done: false, date: today }]).select()
    if (!error && data) setTasks([data[0], ...tasks])
    setText('')
    setSaving(false)
  }

  async function toggleDone(task) {
    const updated = { ...task, done: !task.done }
    await supabase.from('tasks').update({ done: updated.done }).eq('id', task.id)
    setTasks(tasks.map(t => t.id === task.id ? updated : t))
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(tasks.filter(t => t.id !== id))
  }

  const filtered = tasks.filter(t => {
    if (filter === 'today') return t.date === today
    if (filter === 'pending') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  const inp = { padding: '10px 14px', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', background: 'var(--card-bg)', color: 'var(--gray-800)', width: '100%' }
  const btn = (active) => ({ padding: '7px 14px', border: `1px solid ${active ? 'var(--teal)' : 'var(--gray-200)'}`, borderRadius: 8, background: active ? 'var(--teal-bg)' : 'var(--card-bg)', color: active ? 'var(--teal-dark)' : 'var(--gray-600)', fontSize: 13, fontWeight: 500, cursor: 'pointer' })

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Tasks ✅</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: '1.5rem' }}>Aaj kya karna hai — sab likho, sab karo</p>

      {/* Add task */}
      <form onSubmit={addTask} style={{ background: 'var(--card-bg)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <input style={{ ...inp, flex: 2, minWidth: 160 }} value={text} onChange={e => setText(e.target.value)} placeholder="Nayi task likho... (e.g. Percentage ke 20 questions karo)" />
          <select style={{ ...inp, flex: 0, width: 'auto', minWidth: 100 }} value={subject} onChange={e => setSubject(e.target.value)}>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select style={{ ...inp, flex: 0, width: 'auto', minWidth: 110 }} value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
          </select>
          <button type="submit" disabled={saving} style={{ padding: '10px 20px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {saving ? '...' : '+ Add'}
          </button>
        </div>
      </form>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[['all', 'Sab'], ['today', 'Aaj'], ['pending', 'Pending'], ['done', 'Done']].map(([v, l]) => (
          <button key={v} style={btn(filter === v)} onClick={() => setFilter(v)}>{l}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--gray-400)', alignSelf: 'center' }}>
          {tasks.filter(t => t.done).length}/{tasks.length} complete
        </span>
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-300)', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Koi task nahi</div>
            <div style={{ fontSize: 13 }}>Upar se naya task add karo</div>
          </div>
        )}
        {filtered.map(task => (
          <div key={task.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow)', opacity: task.done ? 0.65 : 1, transition: 'opacity 0.2s' }}>
            <button onClick={() => toggleDone(task)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${task.done ? 'var(--teal)' : 'var(--gray-300)'}`, background: task.done ? 'var(--teal)' : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', transition: 'all 0.15s' }}>
              {task.done ? '✓' : ''}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: task.done ? 'var(--gray-400)' : 'var(--gray-800)', textDecoration: task.done ? 'line-through' : 'none', wordBreak: 'break-word' }}>{task.text}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${SUBJECT_COLORS[task.subject]}18`, color: SUBJECT_COLORS[task.subject], fontWeight: 600 }}>{task.subject}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: task.priority === 'high' ? 'rgba(239,68,68,0.12)' : task.priority === 'medium' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)', color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981', fontWeight: 600 }}>{task.priority}</span>
                <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{task.date}</span>
              </div>
            </div>
            <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-300)', fontSize: 16, padding: 4, flexShrink: 0 }} onMouseEnter={e => e.target.style.color = '#ef4444'} onMouseLeave={e => e.target.style.color = 'var(--gray-300)'}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
