import React, { useState, useEffect } from 'react';
import { workflowApi } from '../services/api';
import { ShieldCheck, History, Search, Clock, User } from 'lucide-react';

export const AuditTrailView = ({ onSelectInstance }) => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await workflowApi.getRecentAuditLogs();
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.trackingNumber?.toLowerCase().includes(term) ||
      log.actionTaken?.toLowerCase().includes(term) ||
      log.stepName?.toLowerCase().includes(term) ||
      log.actor?.fullName?.toLowerCase().includes(term) ||
      log.comments?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="#2563eb" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Immutable Compliance & Security Audit Trail
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
            Complete tamper-evident log of all stage transitions, user signoffs, and decision rationales
          </p>
        </div>

        <div style={{
          position: 'relative',
          minWidth: '280px'
        }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by actor, action, ticket..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                color: '#64748b',
                fontSize: '0.74rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '12px 18px' }}>Timestamp</th>
                <th style={{ padding: '12px 18px' }}>Tracking #</th>
                <th style={{ padding: '12px 18px' }}>Action</th>
                <th style={{ padding: '12px 18px' }}>Workflow Stage</th>
                <th style={{ padding: '12px 18px' }}>Authorized Actor</th>
                <th style={{ padding: '12px 18px' }}>Duration in Stage</th>
                <th style={{ padding: '12px 18px' }}>Decision Notes / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: log.instanceId ? 'pointer' : 'default'
                    }}
                    onClick={() => log.instanceId && onSelectInstance(log.instanceId)}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    <td style={{ padding: '12px 18px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontWeight: '700', color: '#2563eb' }}>
                      {log.trackingNumber || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        backgroundColor: log.actionTaken === 'APPROVE' ? '#ecfdf5' : log.actionTaken === 'REJECT' ? '#fef2f2' : '#eff6ff',
                        color: log.actionTaken === 'APPROVE' ? '#047857' : log.actionTaken === 'REJECT' ? '#b91c1c' : '#1d4ed8'
                      }}>
                        {log.actionTaken}
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px', fontWeight: '600', color: '#334155' }}>
                      {log.stepName}
                    </td>
                    <td style={{ padding: '12px 18px', color: '#0f172a' }}>
                      <div style={{ fontWeight: '600' }}>{log.actor?.fullName || 'System Automated'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{log.actor?.department}</div>
                    </td>
                    <td style={{ padding: '12px 18px', color: '#64748b' }}>
                      {log.durationMinutes ? `${log.durationMinutes} mins` : '< 1 min'}
                    </td>
                    <td style={{ padding: '12px 18px', color: '#475569', maxWidth: '300px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.comments || '—'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    No audit records match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
