import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { useI18n } from '../i18n';
import { useDebounce } from '../hooks/useDebounce';

interface ExperienceData {
  id: string; content: string; rating: number; likes: number;
  authorId: string; subjectId: string; createdAt: string;
  author?: { id: string; username: string; displayName: string | null };
  subject?: { id: string; title: string; slug: string };
}

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { t, dir } = useI18n();
  const limit = 20;
  const debouncedSearchId = useDebounce(searchId, 400);

  const fetchExperiences = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await api.getAllExperiences({
        page, limit,
        subjectId: debouncedSearchId || undefined,
        minRating: minRating ? parseInt(minRating) : undefined,
      });
      setExperiences(result.experiences as unknown as ExperienceData[]);
      setTotal(result.total);
    } catch { setError(t.experiences.loadError); }
    finally { setLoading(false); }
  }, [page, debouncedSearchId, minRating]);

  useEffect(() => { fetchExperiences(); }, [fetchExperiences]);

  const handleDelete = async (id: string) => {
    if (!confirm(t.app.confirmDelete)) return;
    try { await api.deleteExperience(id); await fetchExperiences(); }
    catch (err) { setError(err instanceof Error ? err.message : t.experiences.deleteFailed); }
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' as const, gap: '0.75rem' },
    title: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' },
    filters: { display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' as const },
    input: { padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', background: '#fff' },
    card: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { textAlign: dir === 'rtl' ? 'right' as const : 'left' as const, padding: '0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: 1, borderBottom: '2px solid #e2e8f0', background: '#f8fafc' },
    td: { padding: '0.75rem', fontSize: '0.85rem', color: '#475569', borderBottom: '1px solid #f1f5f9' },
    contentCell: { padding: '0.75rem', fontSize: '0.85rem', color: '#475569', borderBottom: '1px solid #f1f5f9', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' as const, whiteSpace: 'nowrap' as const, cursor: 'pointer' },
    badge: (color: string) => ({ background: color, color: '#fff', fontSize: '0.65rem', padding: '2px 10px', borderRadius: 10, fontWeight: 600 }),
    actionBtn: (color: string) => ({ padding: '0.3rem 0.6rem', borderRadius: 6, border: 'none', background: color, color: '#fff', cursor: 'pointer', fontSize: '0.75rem' }),
    error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', padding: '0.65rem 0.85rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.8rem' },
    empty: { textAlign: 'center' as const, padding: '3rem', color: '#94a3b8' },
    expanded: { padding: '0.75rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 },
    stars: (rating: number) => ({ color: '#f59e0b', fontSize: '0.85rem' }),
    infoTag: { fontSize: '0.75rem', color: '#64748b', marginRight: 12 },
  };

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>{t.experiences.title}</h1>
        <div style={s.filters}>
          <input type="text" placeholder={t.experiences.filterSubject} value={searchId} onChange={(e) => { setSearchId(e.target.value); setPage(1); }} style={s.input} />
          <input type="number" placeholder={t.experiences.filterRating} value={minRating} onChange={(e) => { setMinRating(e.target.value); setPage(1); }} min={1} max={5} style={{ ...s.input, width: 100 }} />
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}

      <div style={s.card}>
        {loading ? (
          <div style={s.empty}>{t.app.loading}</div>
        ) : experiences.length === 0 ? (
          <div style={s.empty}>{t.app.noData}</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t.experiences.content}</th>
                <th style={s.th}>{t.experiences.rating}</th>
                <th style={s.th}>{t.experiences.likes}</th>
                <th style={s.th}>{t.experiences.author}</th>
                <th style={s.th}>{t.experiences.createdAt}</th>
                <th style={s.th}>{t.app.actions}</th>
              </tr>
            </thead>
            <tbody>
              {experiences.map((exp) => (
                <React.Fragment key={exp.id}>
                  <tr>
                    <td style={s.contentCell} onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)} title={exp.content}>
                      {exp.content.substring(0, 80)}...
                    </td>
                    <td style={s.td}>
                      <span style={s.stars(exp.rating)}>{'★'.repeat(exp.rating)}{'☆'.repeat(5 - exp.rating)}</span>
                    </td>
                    <td style={s.td}>{exp.likes}</td>
                    <td style={{ ...s.td, fontSize: '0.8rem', color: '#64748b' }}>
                      {exp.author?.username || exp.authorId.substring(0, 8)}
                    </td>
                    <td style={{ ...s.td, fontSize: '0.78rem', color: '#94a3b8' }}>
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </td>
                    <td style={s.td}>
                      <button onClick={() => handleDelete(exp.id)} style={s.actionBtn('#ef4444')}>{t.app.delete}</button>
                    </td>
                  </tr>
                  {expandedId === exp.id && (
                    <tr key={`${exp.id}-detail`}>
                      <td colSpan={6} style={s.expanded}>
                        <div><strong>{t.experiences.content}:</strong></div>
                        <div style={{ marginTop: 4, marginBottom: 8 }}>{exp.content}</div>
                        <div>
                          <span style={s.infoTag}><strong>ID:</strong> {exp.id}</span>
                          <span style={s.infoTag}><strong>{t.experiences.subject}:</strong> {exp.subject?.title || exp.subjectId}</span>
                          <span style={s.infoTag}><strong>{t.experiences.author}:</strong> {exp.author?.username || exp.authorId}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
