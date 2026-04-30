import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'

const SUBJECTS = ['Full Test', 'Math', 'GS/GK', 'English', 'Reasoning', 'Science', 'Hindi']
const EXAMS = ['SSC CGL', 'SSC CHSL', 'Railway NTPC', 'Railway Group D', 'UP Police', 'Lekhpal', 'Other']

export default function MockTestsPage() {
  const { user } = useAuth()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ test_name: '', exam_type: 'SSC CHSL', subject: 'Full Test', score: '', total: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' })

  useEffect(() => {
    if (!user) return
    supabase.from('mock_tests').select('*').eq('user_id', user.id).order('date', { ascending: false })
      .then(({ data }) => { setTests(data || []); setLoading(false) })
  }, [user])

  async function addTest(e) {
    e.preventDefault()
    if (!form.test_name || !form.score || !form.total) return
    setSaving(true)
    const { data, error } = await supabase.from('mock_tests').insert([{ user_id: user.id, ...form, score: parseInt(form.score), total: parseInt(form.total) }]).select()
    if (!error && data) setTests([data[0], ...tests])
    setForm(f => ({ ...f, test_name: '', score: '', total: '', notes: '' }))
    setSaving(false)
  }

  async function deleteTest(id) {
    await supabase.from('mock_tests').delete().eq('id', id)
    setTests(tests.filter(t => t.id !== id))
  }

  const avgPct = tests.length ? Math.round(tests.reduce((s, t) => s + (t.score / t.total) * 100, 0) / tests.length) : 0
  const best = tests.reduce((b, t) => (t.score / t.total) > (b?.score / b?.total || 0) ? t : b, null)
  const latest = tests[0]

  const inp = { padding: '10px 14px', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', width: '100%' }
  const getPctColor = (pct) => pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : '#ef4444'

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Mock Tests 🧪</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: '1.5rem' }}>Har test ka score log karo, improvement track karo</p>

      {/* Summary */}
      {tests.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { icon: '🧪', label: 'Total tests', value: tests.length, color: 'var(--teal)' },
            { icon: '📊', label: 'Average score', value: avgPct + '%', color: getPctColor(avgPct) },
            { icon: '🏆', label: 'Best score', value: best ? Math.round((best.score / best.total) * 100) + '%' : '-', color: 'var(--green)' },
            { icon: '📅', label: 'Last test', value: latest ? format(new Date(latest.date), 'dd MMM') : '-', color: 'var(--blue)' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add test form */}
      <form onSubmit={addTest} style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-600)', marginBottom: '1rem' }}>Naya test log karo</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 10 }}>
          <input style={inp} value={form.test_name} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))} placeholder="Test name (e.g. Set-1)" required />
          <select style={inp} value={form.exam_type} onChange={e => setForm(f => ({ ...f, exam_type: e.target.value }))}>
            {EXAMS.map(ex => <option key={ex}>{ex}</option>)}
          </select>
          <select style={inp} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <input style={inp} type="number" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} placeholder="Score milaa (e.g. 72)" required min={0} />
          <input style={inp} type="number" value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))} placeholder="Total marks (e.g. 100)" required min={1} />
          <input style={inp} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input style={{ ...inp, flex: 1 }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes (optional) — kya weak tha?" />
          <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {saving ? '...' : '+ Log Test'}
          </button>
        </div>
      </form>

      {/* Test list */}
      {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading...</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tests.map(test => {
          const pct = Math.round((test.score / test.total) * 100)
          const color = getPctColor(pct)
          return (
            <div key={test.id} style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 16, color, flexShrink: 0 }}>{pct}%</div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--gray-800)' }}>{test.test_name}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--teal-bg)', color: 'var(--teal-dark)', fontWeight: 600 }}>{test.exam_type}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--gray-100)', color: 'var(--gray-500)' }}>{test.subject}</span>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{test.score}/{test.total} · {format(new Date(test.date), 'dd MMM yyyy')}</span>
                </div>
                {test.notes && <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>📝 {test.notes}</div>}
              </div>
              <div style={{ width: 80, height: 6, background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ height: '100%', background: color, width: `${pct}%`, borderRadius: 10 }} />
              </div>
              <button onClick={() => deleteTest(test.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-300)', fontSize: 16, padding: 4 }} onMouseEnter={e => e.target.style.color = '#ef4444'} onMouseLeave={e => e.target.style.color = 'var(--gray-300)'}>✕</button>
            </div>
          )
        })}
        {!loading && tests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-300)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-400)', marginBottom: 4 }}>Koi test log nahi kiya</div>
            <div style={{ fontSize: 13 }}>Mock test deke upar form bhar do</div>
          </div>
        )}
      </div>
    </div>
  )
}
