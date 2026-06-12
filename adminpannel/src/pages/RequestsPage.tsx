import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { useI18n } from '../i18n';

interface RequestData {
  id: string; title: string; description: string | null;
  votes: number; status: string; requesterId: string; createdAt: string;
  requester?: { id: string; username: string; displayName: string | null };
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { t, dir } = useI18n();
  const limit = 20;

  const fetchRequests = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await api.getAllRequests({ page, limit, status: statusFilter || undefined });
      setRequests(result.requests as unknown as RequestData[]);
      setTotal(result.total);
    } catch { setError('Failed to load'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try { await api.updateRequestStatus(id, newStatus); await fetchRequests(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to update status'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.app.confirmDelete)) return;
    try { await api.deleteRequest(id); await fetchRequests(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Delete failed'); }
  };

  const statusColors: Record<string, string> = {
    open: '#10b981', fulfilled: '#6366f1', closed: '#ef4444',
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' as const, gap: '0.75rem' },
    title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
    filters: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
    select: { padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', background: '#fff' },
    card: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { textAlign: dir === 'rtl' ? 'right' as const : 'left' as const, padding: '0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: 1, borderBottom: '2px solid #e2e8f0', background: '#f8fafc' },
    td: { padding: '0.75rem', fontSize: '0.85rem', color: '#475569', borderBottom: '1px solid #f1f5f9' },
    badge: (color: string) => ({ background: color, color: '#fff', fontSize: '0.65rem', padding: '2px 10px', borderRadius: 10, fontWeight: 600 }),
    actionBtn: (color: string) => ({ padding: '0.3rem 0.6rem', borderRadius: 6, border: 'none', background: color, color: '#fff', cursor: 'pointer', fontSize: '0.75rem', marginRight: 4 }),
    error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', padding: '0.65rem 0.85rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.8rem' },
    empty: { textAlign: 'center' as const, padding: '3rem', color: '#94a3b8' },
    expanded: { padding: '0.75rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 },
    infoTag: { fontSize: '0.75rem', color: '#64748b', marginRight: 12 },
  };

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>{t.requests.title}</h1>
        <div style={s.filters}>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={s.select}>
            <option value="">{t.requests.all} {t.requests.status}</option>
            <option value="open">{t.requests.open}</option>
            <option value="fulfilled">{t.requests.fulfilled}</option>
            <option value="closed">{t.requests.closed}</option>
          </select>
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}

      <div style={s.card}>
        {loading ? (
          <div style={s.empty}>{t.app.loading}</div>
        ) : requests.length === 0 ? (
          <div style={s.empty}>{t.app.noData}</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t.requests.title_}</th>
                <th style={s.th}>{t.requests.votes}</th>
                <th style={s.th}>{t.requests.status}</th>
                <th style={s.th}>{t.requests.requester}</th>
                <th style={s.th}>{t.requests.createdAt}</th>
                <th style={s.th}>{t.app.actions}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <>
                  <tr key={req.id}>
                    <td
                      style={{ ...s.td, cursor: 'pointer', fontWeight: 500 }}
                      onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    >
                      {req.title}
                    </td>
                    <td style={s.td}>{req.votes}</td>
                    <td style={s.td}>
                      <span style={s.badge(statusColors[req.status] || '#64748b')}>
                        {t.requests[req.status as keyof typeof t.requests] as string || req.status}
                      </span>
                    </td>
                    <td style={{ ...s.td, fontSize: '0.8rem', color: '#64748b' }}>
                      {req.requester?.username || req.requesterId.substring(0, 8)}
                    </td>
                    <td style={{ ...s.td, fontSize: '0.78rem', color: '#94a3b8' }}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td style={s.td}>
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        style={{ padding: '0.25rem 0.4rem', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.75rem', marginRight: 4 }}
                      >
                        <option value="open">{t.requests.open}</option>
                        <option value="fulfilled">{t.requests.fulfilled}</option>
                        <option value="closed">{t.requests.closed}</option>
                      </select>
                      <button onClick={() => handleDelete(req.id)} style={s.actionBtn('#ef4444')}>{t.app.delete}</button>
                    </td>
                  </tr>
                  {expandedId === req.id && (
                    <tr key={`${req.id}-detail`}>
                      <td colSpan={6} style={s.expanded}>
                        <div><strong>{t.requests.description}:</strong></div>
                        <div style={{ marginTop: 4, marginBottom: 8 }}>{req.description || '(no description)'}</div>
                        <div>
                          <span style={s.infoTag}><strong>ID:</strong> {req.id}</span>
                          <span style={s.infoTag}><strong>{t.requests.requester}:</strong> {req.requester?.username || req.requesterId}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1rem' }}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', opacity: page <= 1 ? 0.5 : 1 }}>
            Prev
          </button>
          <span style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#64748b' }}>{page} / {Math.ceil(total / limit)}</span>
          <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((p) => p + 1)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: page >= Math.ceil(total / limit) ? 'not-allowed' : 'pointer', fontSize: '0.8rem', opacity: page >= Math.ceil(total / limit) ? 0.5 : 1 }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
