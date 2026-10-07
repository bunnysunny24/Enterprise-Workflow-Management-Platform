import React, { useState, useEffect } from 'react';
import { workflowApi } from '../services/api';
import { X, Send, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

export const NewInstanceModal = ({ isOpen, onClose, onCreated }) => {
  const [definitions, setDefinitions] = useState([]);
  const [selectedDefId, setSelectedDefId] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDefinitions();
    }
  }, [isOpen]);

  const loadDefinitions = async () => {
    try {
      const res = await workflowApi.getActiveDefinitions();
      if (res.success && res.data.length > 0) {
        setDefinitions(res.data);
        setSelectedDefId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load workflow definitions:', err);
    }
  };

  const selectedDef = definitions.find((d) => d.id.toString() === selectedDefId);

  // Parse fields schema if present
  let schemaFields = [];
  try {
    if (selectedDef?.formSchemaJson) {
      const parsed = JSON.parse(selectedDef.formSchemaJson);
      schemaFields = parsed.fields || [];
    }
  } catch (e) {
    schemaFields = [];
  }

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Instance title is required');
      return;
    }
    if (!selectedDefId) {
      setError('Please select a workflow definition');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await workflowApi.createInstance({
        workflowDefinitionId: Number(selectedDefId),
        title,
        priority,
        payloadJson: JSON.stringify(formData),
      });

      if (res.success) {
        setTitle('');
        setFormData({});
        onCreated && onCreated(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit workflow instance');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
              Initiate New Workflow Request
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Trigger automated state machine execution and approval routing
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: '#64748b',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#b91c1c',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Workflow Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Workflow Definition:
            </label>
            <select
              value={selectedDefId}
              onChange={(e) => {
                setSelectedDefId(e.target.value);
                setFormData({});
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff'
              }}
            >
              {definitions.map((def) => (
                <option key={def.id} value={def.id}>
                  {def.name} ({def.department} • SLA {def.slaHours}h)
                </option>
              ))}
            </select>
            {selectedDef && (
              <span style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                {selectedDef.description}
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Request Title / Purpose:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Data Science Laptop Upgrade or AWS RDS Access"
              required
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Priority */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Urgency / Priority:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: priority === p ? '700' : '500',
                    border: `1.5px solid ${priority === p ? '#2563eb' : '#cbd5e1'}`,
                    backgroundColor: priority === p ? '#eff6ff' : '#ffffff',
                    color: priority === p ? '#1d4ed8' : '#64748b'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Payload Form Fields */}
          {schemaFields.length > 0 && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                Required Workflow Payload Attributes
              </span>

              {schemaFields.map((field) => (
                <div key={field.name}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    {field.label || field.name}:
                  </label>

                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="">Select an option...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      step="any"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem'
                      }}
                    />
                  ) : field.type === 'date' ? (
                    <input
                      type="date"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem'
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.label || field.name}...`}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                fontWeight: '600',
                color: '#475569'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '9px 20px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '700',
                boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
                opacity: loading ? 0.6 : 1
              }}
            >
              <Send size={16} />
              <span>{loading ? 'Submitting...' : 'Submit Workflow Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
