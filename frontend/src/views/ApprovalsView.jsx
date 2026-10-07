import React, { useState, useEffect } from 'react';
import { workflowApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { InstanceTable } from '../components/InstanceTable';
import { Inbox, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const ApprovalsView = ({ onSelectInstance }) => {
  const { user } = useAuth();
  const [pendingInstances, setPendingInstances] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await workflowApi.getPendingApprovals();
      if (res.success) {
        setPendingInstances(res.data);
      }
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

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
            <Inbox size={22} color="#2563eb" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Pending Approvals & Action Items
            </h2>
            <span style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: '700'
            }}>
              {pendingInstances.length} pending
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
            Items queued for your role or assigned explicitly to <strong>{user?.fullName}</strong>
          </p>
        </div>
      </div>

      <InstanceTable
        instances={pendingInstances}
        onSelectInstance={onSelectInstance}
        emptyMessage="Great job! You have cleared all pending approval requests in your queue."
      />
    </div>
  );
};
