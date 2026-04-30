import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 12px', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>{payload[0].value} hours</div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [tasks, setTasks] = useState([])
  const [tests, setTests] = useState([])
  const [range, setRange] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('study_logs').select('*').eq('user_id', user.id).order('date', { ascending: true }),
      supabase.from('tasks').select('*').eq('user_id', user.id),
      supabase.from('mock_tests').select('*').eq('user_id', user.id).order('date', { ascending: true }),
    ]).then(([l, t, mt]) => {
      setLogs(l.data || [])
      setTasks(t.data || [])
      setTests(mt.data || [])
      setLoading(false)
    })
  }, [user])

  const days = eachDayOfInterval({ start: subDays(new Date(), range - 1), end: new Date() })
  const chartData = days.map(day => {
    const ds = format(day, 'yyyy-MM-dd')
    const log = logs.find(l => l.date === ds)
    return { date: format(day, range > 14 ? 'dd MMM' : 'EEE dd'), hours: log?.hours || 0 }
  })

  const totalHours = logs.reduce((s, l) => s + (l.hours || 0), 0)
  const avgHours = logs.length ? (totalHours / logs.length).toFixed(1) : 0
  const maxDay = logs.reduce((m, l) => l.hours > m ? l.hours : m, 0)
  const totalDays = logs.filter(l => l.hours > 0).length

  const subjectTaskCounts = {}
  tasks.forEach(t => { subjectTaskCounts[t.subject] = (subjectTaskCounts[t.subject] || 0) + 1 })
  const subjectData = Object.entries(subjectTaskCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)

  const testData = tests.map(t => ({ name: format(new Date(t.date), 'dd MMM'), score: Math.round((t.score / t.total) * 100), test: t.test_name }))

  const statCard = (icon, label, value, color = 'var(--teal)') => (
    <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{label}</div>
    </div>
  )

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>Loading analytics...</div>

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Analytics 📈</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: '1.5rem' }}>Teri mehnat ka poora hisaab</p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCard('⏰', 'Total hours', totalHours.toFixed(0) + 'h')}
        {statCard('📅', 'Study days', totalDays, 'var(--blue)')}
        {statCard('📊', 'Daily average', avgHours + 'h', 'var(--amber)')}
        {statCard('🏆', 'Best day', maxDay.toFixed(1) + 'h', 'var(--green)')}
      </div>

      {/* Study hours chart */}
      <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)' }}>Study hours — Last {range} days</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {[7, 14, 30].map(r => (
              <button key={r} onClick={() => setRange(r)} style={{ padding: '4px 12px', fontSize: 12, fontWeight: 500, border: `1px solid ${range === r ? 'var(--teal)' : 'var(--gray-200)'}`, borderRadius: 6, background: range === r ? 'var(--teal-bg)' : '#fff', color: range === r ? 'var(--teal-dark)' : 'var(--gray-500)', cursor: 'pointer' }}>{r}d</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 6)} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="hours" stroke="#0d9488" strokeWidth={2} fill="url(#tealGrad)" dot={false} activeDot={{ r: 4, fill: '#0d9488' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Subject tasks bar chart */}
        <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)', marginBottom: '1rem' }}>Tasks by subject</h3>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={subjectData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => [v, 'Tasks']} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-300)', fontSize: 13 }}>Tasks add karo pehle</div>}
        </div>

        {/* Mock test scores */}
        <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)', marginBottom: '1rem' }}>Mock test scores %</h3>
          {testData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={testData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v, n, p) => [v + '%', p.payload.test]} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#blueGrad)" dot={{ r: 4, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-300)', fontSize: 13 }}>Mock tests log karo pehle</div>}
        </div>
      </div>
    </div>
  )
}
