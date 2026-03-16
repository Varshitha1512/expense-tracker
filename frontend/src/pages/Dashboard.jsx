import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, MONTHS } from '../utils/formatters';
import TransactionForm from '../components/TransactionForm';

const COLORS = ['#7c6aff','#ff6a6a','#22d98a','#ffd166','#06b6d4','#ec4899','#f97316','#8b5cf6'];

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary]   = useState(null);
  const [catData, setCatData]   = useState([]);
  const [trend, setTrend]       = useState([]);
  const [recent, setRecent]     = useState([]);
  const [showForm, setShowForm] = useState(false);
  const now = new Date();

  const fetchAll = async () => {
    const [s, c, t, r] = await Promise.all([
      api.get(`/stats/summary?month=${now.getMonth()+1}&year=${now.getFullYear()}`),
      api.get(`/stats/by-category?month=${now.getMonth()+1}&year=${now.getFullYear()}`),
      api.get('/stats/monthly-trend'),
      api.get('/transactions?limit=5'),
    ]);
    setSummary(s.data);
    setCatData(c.data);
    // process trend data
    const months = {};
    t.data.forEach(d => {
      const key = `${MONTHS[d._id.month-1]} ${d._id.year}`;
      if (!months[key]) months[key] = { name: key, income: 0, expense: 0 };
      months[key][d._id.type] = d.total;
    });
    setTrend(Object.values(months));
    setRecent(r.data.transactions);
  };

  useEffect(() => { fetchAll(); }, []);

  const statCards = summary ? [
    { label: 'Income',  value: formatCurrency(summary.income,  user?.currency), color: 'var(--green)', icon: '↑' },
    { label: 'Expense', value: formatCurrency(summary.expense, user?.currency), color: 'var(--red)',   icon: '↓' },
    { label: 'Balance', value: formatCurrency(summary.balance, user?.currency), color: summary.balance >= 0 ? 'var(--green)' : 'var(--red)', icon: '=' },
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div className="card" style={{ padding: '10px 14px', fontSize: '0.85rem', minWidth: 140 }}>
        <p style={{ marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value, user?.currency)}</p>)}
      </div>
    );
    return null;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--muted)' }}>{MONTHS[now.getMonth()]} {now.getFullYear()}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Transaction</button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '1.6rem', opacity: 0.15 }}>{s.icon}</div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 8 }}>{s.label} this month</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Syne', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Bar chart */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>6-Month Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} barGap={4}>
              <XAxis dataKey="name" tick={{ fill: '#6b6b88', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6b88', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="income"  fill="#22d98a" radius={[4,4,0,0]} />
              <Bar dataKey="expense" fill="#ff5b7f" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>By Category</h3>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={catData} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v, user?.currency)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: 60 }}>No expense data yet</p>}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Recent Transactions</h3>
        {recent.length === 0 ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>No transactions yet. Add your first one!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recent.map(t => (
              <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    {t.type === 'income' ? '💰' : '💸'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 500 }}>{t.title}</p>
                    <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{t.category} · {new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: t.type === 'income' ? 'var(--green)' : 'var(--red)', fontFamily: 'Syne' }}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchAll(); }} />}
    </div>
  );
}
