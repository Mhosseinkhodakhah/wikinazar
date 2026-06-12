import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { useI18n } from '../i18n';
import { useDebounce } from '../hooks/useDebounce';

interface UserData {
  id: string; username: string; email: string; role: string;
  displayName: string | null; bio: string | null; createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const { t, dir } = useI18n();
  const limit = 20;
  const debouncedSearch = useDebounce(search, 400);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await api.getAllUsers({ page, limit, search: debouncedSearch || undefined, role: roleFilter || undefined });
      setUsers(result.users as unknown as UserData[]);
      setTotal(result.total);
    } catch { setError(t.users.loadError); }
    finally { setLoading(false); }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await api.updateUser(id, { role: newRole });
      await fetchUsers();
    }     catch (err) { setError(err instanceof Error ? err.message : t.users.roleUpdateFailed); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.app.confirmDelete)) return;
    try { await api.deleteUser(id); await fetchUsers(); }
    catch (err) { setError(err instanceof Error ? err.message : t.users.deleteFailed); }
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' as const, gap: '0.75rem' },
    title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
    filters: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
    input: {
      padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0',
      fontSize: '0.85rem', outline: 'none', background: '#fff',
    },
    select: {
      padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0',
      fontSize: '0.85rem', outline: 'none', background: '#fff',
    },
    card: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { textAlign: dir === 'rtl' ? 'right' as const : 'left' as const, padding: '0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: 1, borderBottom: '2px solid #e2e8f0', background: '#f8fafc' },
    td: { padding: '0.75rem', fontSize: '0.85rem', color: '#475569', borderBottom: '1px solid #f1f5f9' },
    badge: (color: string) => ({ background: color, color: '#fff', fontSize: '0.65rem', padding: '2px 10px', borderRadius: 10, fontWeight: 600 }),
    actionBtn: (color: string) => ({ padding: '0.3rem 0.6rem', borderRadius: 6, border: 'none', background: color, color: '#fff', cursor: 'pointer', fontSize: '0.75rem', marginRight: 4 }),
    error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', padding: '0.65rem 0.85rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.8rem' },
    empty: { textAlign: 'center' as const, padding: '3rem', color: '#94a3b8' },
  };

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>{t.users.title}</h1>
        <div style={s.filters}>
          <input
            type="text" placeholder={t.app.search} value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={s.input}
          />
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={s.select}>
            <option value="">{t.requests.all} {t.users.role}</option>
            <option value="USER">{t.users.user}</option>
            <option value="EXPERT">{t.users.expert}</option>
          </select>
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}

      <div style={s.card}>
        {loading ? (
          <div style={s.empty}>{t.app.loading}</div>
        ) : users.length === 0 ? (
          <div style={s.empty}>{t.app.noData}</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t.users.username}</th>
                <th style={s.th}>{t.users.email}</th>
                <th style={s.th}>{t.users.role}</th>
                <th style={s.th}>{t.users.displayName}</th>
                <th style={s.th}>{t.users.createdAt}</th>
                <th style={s.th}>{t.app.actions}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={s.td}>{u.username}</td>
                  <td style={{ ...s.td, color: '#64748b', fontSize: '0.8rem' }}>{u.email}</td>
                  <td style={s.td}>
                    <span style={s.badge(u.role === 'EXPERT' ? '#8b5cf6' : '#6366f1')}>
                      {u.role === 'EXPERT' ? t.users.expert : t.users.user}
                    </span>
                  </td>
                  <td style={{ ...s.td, color: '#94a3b8' }}>{u.displayName || '-'}</td>
                  <td style={{ ...s.td, fontSize: '0.78rem', color: '#94a3b8' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={s.td}>
                    <button
                      onClick={() => handleRoleChange(u.id, u.role === 'USER' ? 'EXPERT' : 'USER')}
                      style={s.actionBtn('#8b5cf6')}
                    >
                      {u.role === 'USER' ? t.users.promoteExpert : t.users.demoteUser}
                    </button>
                    <button onClick={() => handleDelete(u.id)} style={s.actionBtn('#ef4444')}>
                      {t.app.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1rem' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Prev
          </button>
          <span style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#64748b' }}>
            {page} / {Math.ceil(total / limit)}
          </span>
          <button
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => setPage((p) => p + 1)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
