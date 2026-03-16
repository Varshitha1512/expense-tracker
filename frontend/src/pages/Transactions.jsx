import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import TransactionForm from '../components/TransactionForm';
import toast from 'react-hot-toast';

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [filters, setFilters]     = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [categories, setCategories] = useState([]);

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data)); }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) });
      const res = await api.get(`/transactions?${params}`);
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Deleted');
      fetchTransactions();
    } catch {
      toast.error('Delete failed');
    }
  };

  const resetFilters = () => { setFilters({ type: '', category: '', startDate: '', endDate: '' }); setPage(1); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Transactions</h1>
          <p style={{ color: 'var(--muted)' }}>{total} total records</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Transaction</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr) auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Type</label>
            <select value={filters.type} onChange={e => { setFilters(p => ({ ...p, type: e.target.value })); setPage(1); }}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Category</label>
            <select value={filters.category} onChange={e => { setFilters(p => ({ ...p, category: e.target.value })); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>From</label>
            <input type="date" value={filters.startDate} onChange={e => { setFilters(p => ({ ...p, startDate: e.target.value })); setPage(1); }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>To</label>
            <input type="date" value={filters.endDate} onChange={e => { setFilters(p => ({ ...p, endDate: e.target.value })); setPage(1); }} />
          </div>
          <button className="btn-ghost" onClick={resetFilters} style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>Clear</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading...</p>
        ) : transactions.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No transactions found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Category', 'Date', 'Method', 'Type', 'Amount', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={t._id} style={{ borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 20px' }}>
                    <p style={{ fontWeight: 500 }}>{t.title}</p>
                    {t.description && <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 2 }}>{t.description}</p>}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--muted)', fontSize: '0.9rem' }}>{t.category}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--muted)', fontSize: '0.9rem' }}>{formatDate(t.date)}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--muted)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{t.paymentMethod.replace('_', ' ')}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className={`badge-${t.type}`}>{t.type}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, fontFamily: 'Syne', color: t.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                        onClick={() => { setEditing(t); setShowForm(true); }}>Edit</button>
                      <button className="btn-danger" style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleDelete(t._id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 16px' }}>← Prev</button>
          <span style={{ padding: '8px 16px', color: 'var(--muted)', fontSize: '0.9rem' }}>Page {page} of {totalPages}</span>
          <button className="btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 16px' }}>Next →</button>
        </div>
      )}

      {showForm && (
        <TransactionForm
          transaction={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchTransactions(); }}
        />
      )}
    </div>
  );
}
