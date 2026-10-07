import React, { useState, useEffect } from 'react';
import { workflowApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  GitBranch, 
  Layers, 
  Clock, 
  Plus, 
  CheckCircle, 
  Building, 
  Settings, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const DefinitionsView = ({ onOpenWorkflowBuilder }) => {
  const { isAdmin } = useAuth();
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await workflowApi.getDefinitions();
      if (res.success) {
        setDefinitions(res.data);
      }
    } catch (err) {
      console.error('Failed to load definitions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
            Configurable Workflow Blueprints
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Predefined and custom multi-stage business process schemas with role permissions and SLAs
          </p>
        </div>

        {isAdmin() && (
          <button
            onClick={onOpenWorkflowBuilder}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
            }}
          >
            <Plus size={16} /> New Workflow Template
          </button>
        )}
      </div>

      {/* Grid of Workflow Templates */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
        gap: '20px'
      }}>
        {definitions.map((def) => (
          <div
            key={def.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: '700', color: '#2563eb' }}>
                    {def.code}
                  </span>
                  <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                    {def.status} (v{def.version})
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                  {def.name}
                </h3>
              </div>

              <div style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Clock size={12} />
                <span>{def.slaHours}h SLA</span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
              {def.description}
            </p>

            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>
                Pipeline Stages ({def.steps?.length || 0})
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {def.steps?.map((step, idx) => (
                  <div
                    key={step.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#e2e8f0',
                        color: '#475569',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {step.stepOrder}
                      </span>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{step.stepName}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: '600'
                      }}>
                        {step.requiredRole?.replace('ROLE_', '') || 'Any'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        {step.stepType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '0.74rem', color: '#94a3b8' }}>
              <span>Department: <strong>{def.department}</strong></span>
              <span>Created: {new Date(def.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
