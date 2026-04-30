import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const SUBJECTS_DATA = [
  { name: 'Mathematics', icon: '📐', color: '#6366f1', chapters: ['Number System', 'Simplification', 'HCF & LCM', 'Percentage', 'Profit & Loss', 'Simple & Compound Interest', 'Ratio & Proportion', 'Time & Work', 'Time, Speed & Distance', 'Algebra', 'Geometry', 'Mensuration', 'Statistics', 'Trigonometry', 'Data Interpretation'] },
  { name: 'GS/GK', icon: '🌍', color: '#0d9488', chapters: ['Indian History', 'Indian Polity', 'Indian Economy', 'Indian Geography', 'World Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Awareness', 'Current Affairs - Monthly', 'Sports GK', 'Awards & Honours', 'Books & Authors'] },
  { name: 'English', icon: '📖', color: '#f59e0b', chapters: ['Reading Comprehension', 'Cloze Test', 'Para Jumbles', 'Error Detection', 'Fill in the Blanks', 'Synonyms & Antonyms', 'Idioms & Phrases', 'One Word Substitution', 'Sentence Improvement', 'Vocabulary'] },
  { name: 'Reasoning', icon: '🧠', color: '#8b5cf6', chapters: ['Analogy', 'Classification', 'Series', 'Coding-Decoding', 'Blood Relations', 'Direction & Distance', 'Arrangement', 'Syllogism', 'Statement & Conclusions', 'Puzzles', 'Matrix', 'Venn Diagrams'] },
  { name: 'Science', icon: '🔬', color: '#10b981', chapters: ['Motion & Laws', 'Work & Energy', 'Sound & Light', 'Electricity', 'Magnetic Effects', 'Atoms & Molecules', 'Chemical Reactions', 'Acids & Bases', 'Carbon Compounds', 'Cell Structure', 'Life Processes', 'Heredity'] },
  { name: 'Hindi', icon: '📜', color: '#ec4899', chapters: ['Sandhi', 'Samas', 'Karak', 'Kaal', 'Vachan', 'Ling', 'Muhavare', 'Lokoktiyan', 'Paryayvachi', 'Vilom Shabd', 'Anekarthi Shabd', 'Gadyansh'] },
]

export default function SubjectsPage() {
  const { user } = useAuth()
  const [progress, setProgress] = useState({})
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('subject_progress').select('*').eq('user_id', user.id)
      .then(({ data }) => {
        const p = {}
        data?.forEach(row => { p[row.subject] = row.chapters_done || [] })
        setProgress(p)
      })
  }, [user])

  async function toggleChapter(subjectName, chapter) {
    const current = progress[subjectName] || []
    const updated = current.includes(chapter) ? current.filter(c => c !== chapter) : [...current, chapter]
    setProgress(prev => ({ ...prev, [subjectName]: updated }))
    setSaving(true)
    const subjectData = SUBJECTS_DATA.find(s => s.name === subjectName)
    const pct = Math.round((updated.length / subjectData.chapters.length) * 100)
    const { data: existing } = await supabase.from('subject_progress').select('id').eq('user_id', user.id).eq('subject', subjectName).single()
    if (existing) {
      await supabase.from('subject_progress').update({ chapters_done: updated, percentage: pct, updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('subject_progress').insert([{ user_id: user.id, subject: subjectName, chapters_done: updated, percentage: pct }])
    }
    setSaving(false)
  }

  const sel = SUBJECTS_DATA.find(s => s.name === selected)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Subjects 📚</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: '1.5rem' }}>Chapter-wise progress track karo {saving && '· Saving...'}</p>

      {!selected ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {SUBJECTS_DATA.map(subj => {
            const done = (progress[subj.name] || []).length
            const total = subj.chapters.length
            const pct = Math.round((done / total) * 100)
            return (
              <div key={subj.name} onClick={() => setSelected(subj.name)}
                style={{ background: 'var(--card-bg)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, background: `${subj.color}18`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{subj.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--gray-800)' }}>{subj.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{done}/{total} chapters</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 18, color: subj.color }}>{pct}%</div>
                </div>
                <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: subj.color, width: `${pct}%`, borderRadius: 10, transition: 'width 0.5s' }} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--card-bg)', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 13, cursor: 'pointer', marginBottom: '1rem', color: 'var(--gray-600)' }}>← Wapas</button>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
              <span style={{ fontSize: 28 }}>{sel.icon}</span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>{sel.name}</h2>
                <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{(progress[sel.name] || []).length}/{sel.chapters.length} chapters done</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
              {sel.chapters.map(ch => {
                const done = (progress[sel.name] || []).includes(ch)
                return (
                  <div key={ch} onClick={() => toggleChapter(sel.name, ch)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${done ? sel.color + '40' : 'var(--gray-100)'}`, background: done ? `${sel.color}08` : 'var(--gray-50)', transition: 'all 0.15s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${done ? sel.color : 'var(--gray-300)'}`, background: done ? sel.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', flexShrink: 0 }}>{done ? '✓' : ''}</div>
                    <span style={{ fontSize: 13, fontWeight: done ? 500 : 400, color: done ? 'var(--gray-800)' : 'var(--gray-600)' }}>{ch}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
