import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'

const SUBJECTS = ['All', 'Math', 'GS/GK', 'English', 'Reasoning', 'Science', 'Hindi', 'Other']
const COLORS = { Math: '#6366f1', 'GS/GK': '#0d9488', English: '#f59e0b', Reasoning: '#8b5cf6', Science: '#10b981', Hindi: '#ec4899', Other: '#64748b' }

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [text, setText] = useState('')
  const [subject, setSubject] = useState('Math')
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setNotes(data || []); setLoading(false) })
  }, [user])

  async function addNote(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('notes').insert([{ user_id: user.id, text: text.trim(), subject }]).select()
    if (!error && data) setNotes([data[0], ...notes])
    setText('')
    setSaving(false)
  }

  async function deleteNote(id) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(notes.filter(n => n.id !== id))
  }

  const filtered = notes.filter(n => {
    const matchSubject = filter === 'All' || n.subject === filter
    const matchSearch = !search || n.text.toLowerCase().includes(search.toLowerCase())
    return matchSubject && matchSearch
  })

  const inp = { padding: '10px 14px', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', background: 'var(--card-bg)', width: '100%' }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Notes & Doubts 📝</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: '1.5rem' }}>Formula, doubt, ya important point — sab yahan save karo</p>

      {/* Add note */}
      <form onSubmit={addNote} style={{ background: 'var(--card-bg)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: 'var(--shadow)' }}>
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Note ya doubt likho... (e.g. Profit % = Profit/CP × 100)"
          style={{ ...inp, minHeight: 80, resize: 'vertical', marginBottom: 10, fontFamily: 'var(--font)' }}
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select style={{ ...inp, width: 'auto', flex: 1, minWidth: 120 }} value={subject} onChange={e => setSubject(e.target.value)}>
            {SUBJECTS.slice(1).map(s => <option key={s}>{s}</option>)}
          </select>
          <button type="submit" disabled={saving || !text.trim()} style={{ padding: '10px 24px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: !text.trim() ? 0.5 : 1 }}>
            {saving ? 'Saving...' : '+ Save Note'}
          </button>
        </div>
      </form>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input style={{ ...inp, flex: 2, minWidth: 160 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search notes..." />
        <select style={{ ...inp, width: 'auto', minWidth: 120 }} value={filter} onChange={e => setFilter(e.target.value)}>
          {SUBJECTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: '0.75rem' }}>{filtered.length} notes</div>

      {/* Notes grid */}
      {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading...</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {filtered.map(note => (
          <div key={note.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1rem', boxShadow: 'var(--shadow)', position: 'relative', borderLeft: `3px solid ${COLORS[note.subject] || '#64748b'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${COLORS[note.subject] || '#64748b'}18`, color: COLORS[note.subject] || '#64748b', fontWeight: 600 }}>{note.subject}</span>
              <button onClick={() => deleteNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-300)', fontSize: 14, padding: 2 }} onMouseEnter={e => e.target.style.color = '#ef4444'} onMouseLeave={e => e.target.style.color = 'var(--gray-300)'}>✕</button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{note.text}</p>
            <div style={{ fontSize: 11, color: 'var(--gray-300)', marginTop: 8 }}>{note.created_at ? format(new Date(note.created_at), 'dd MMM, hh:mm a') : ''}</div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--gray-300)', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-400)', marginBottom: 4 }}>Koi note nahi</div>
            <div style={{ fontSize: 13 }}>Upar se pehla note likho!</div>
          </div>
        )}
      </div>
    </div>
  )
}
