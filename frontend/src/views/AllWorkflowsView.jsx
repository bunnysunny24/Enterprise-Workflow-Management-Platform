import React, { useState, useEffect } from 'react';
import { workflowApi } from '../services/api';
import { InstanceTable } from '../components/InstanceTable';
import { FileText, Layers, Send } from 'lucide-react';

export const AllWorkflowsView = ({ onSelectInstance, onOpenNewInstance }) => {
  const [instances, setInstances] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('ALL'); // 'ALL' or 'MINE'
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeSubTab === 'MINE') {
        const res = await workflowApi.getMySubmissions();
        if (res.success) setInstances(res.data);
      } else {
        const res = await workflowApi.getAllInstances();
        if (res.success) setInstances(res.data);
      }
    } catch (err) {
      console.error('Failed to load workflow instances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

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
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Workflow Instance Registry
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Full persistent state machine registry of in-flight and completed workflow executions
          </p>
        </div>

        <button
          onClick={onOpenNewInstance}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>+</span> Launch Instance
        </button>
      </div>

      {/* Segmented Filter Control */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveSubTab('ALL')}
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: activeSubTab === 'ALL' ? '700' : '500',
            backgroundColor: activeSubTab === 'ALL' ? '#eff6ff' : 'transparent',
            color: activeSubTab === 'ALL' ? '#1d4ed8' : '#64748b',
            border: activeSubTab === 'ALL' ? '1px solid #bfdbfe' : '1px solid transparent'
          }}
        >
          All Enterprise Workflows
        </button>

        <button
          onClick={() => setActiveSubTab('MINE')}
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: activeSubTab === 'MINE' ? '700' : '500',
            backgroundColor: activeSubTab === 'MINE' ? '#eff6ff' : 'transparent',
            color: activeSubTab === 'MINE' ? '#1d4ed8' : '#64748b',
            border: activeSubTab === 'MINE' ? '1px solid #bfdbfe' : '1px solid transparent'
          }}
        >
          My Initiated Submissions
        </button>
      </div>

      <InstanceTable
        instances={instances}
        onSelectInstance={onSelectInstance}
        emptyMessage="No workflow instances found for this filter criteria."
      />
    </div>
  );
};
