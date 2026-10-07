import React, { useState } from 'react';
import { workflowApi } from '../services/api';
import { X, Plus, Trash2, GitPullRequest, Layers, Clock, ShieldCheck, Check } from 'lucide-react';

export const WorkflowBuilderModal = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [slaHours, setSlaHours] = useState(48);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [steps, setSteps] = useState([
    {
      stepName: 'Initial Submission',
      stepKey: 'STAGE_SUBMIT',
      stepOrder: 1,
      requiredRole: 'ROLE_EMPLOYEE',
      stepType: 'SUBMISSION',
      timeoutHours: 24,
      initialStep: true,
      terminalStep: false,
      description: 'Employee provides initial request metadata'
    },
    {
      stepName: 'Manager Review',
      stepKey: 'STAGE_MGR_REVIEW',
      stepOrder: 2,
      requiredRole: 'ROLE_MANAGER',
      stepType: 'REVIEW',
      timeoutHours: 24,
      initialStep: false,
      terminalStep: false,
      description: 'Line manager reviews compliance and team budget'
    },
    {
      stepName: 'Executive Approval',
      stepKey: 'STAGE_EXEC_APPROVAL',
      stepOrder: 3,
      requiredRole: 'ROLE_ADMIN',
      stepType: 'COMPLETION',
      timeoutHours: 0,
      initialStep: false,
      terminalStep: true,
      description: 'Final execution and sign-off'
    }
  ]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    const nextOrder = steps.length + 1;
    setSteps([
      ...steps,
      {
        stepName: `Step ${nextOrder} Verification`,
        stepKey: `STAGE_STEP_${nextOrder}`,
        stepOrder: nextOrder,
        requiredRole: 'ROLE_MANAGER',
        stepType: 'APPROVAL',
        timeoutHours: 24,
        initialStep: false,
        terminalStep: false,
        description: 'Verification step'
      }
    ]);
  };

  const handleRemoveStep = (index) => {
    if (steps.length <= 2) {
      alert('A workflow requires at least 2 stages (Submission and Resolution).');
      return;
    }
    const updated = steps.filter((_, idx) => idx !== index).map((s, idx) => ({
      ...s,
      stepOrder: idx + 1,
      initialStep: idx === 0,
      terminalStep: idx === steps.length - 2
    }));
    setSteps(updated);
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Name and workflow code are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await workflowApi.createDefinition({
        name,
        code: code.toUpperCase().replace(/\s+/g, '_'),
        department,
        slaHours: Number(slaHours),
        description,
        formSchemaJson: JSON.stringify({
          fields: [
            { name: "amount", type: "number", label: "Estimated Budget ($)" },
            { name: "department", type: "text", label: "Cost Center" },
            { name: "businessCase", type: "text", label: "Strategic Business Rationale" }
          ]
        }),
        steps
      });

      if (res.success) {
        onCreated && onCreated(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create workflow definition');
    } finally {
      setLoading(false);
    }
  };

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
        maxWidth: '820px',
        maxHeight: '92vh',
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
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
              Workflow Definition Studio
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Design a configurable business process template with role-gated approval stages
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#b91c1c',
              fontSize: '0.82rem'
            }}>
              {error}
            </div>
          )}

          {/* Core Workflow Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Workflow Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vendor Contract Review & Signoff"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Unique Process Code:
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. CONTRACT_REVIEW"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Owning Department:
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Legal">Legal & Compliance</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Target SLA (Hours):
              </label>
              <input
                type="number"
                value={slaHours}
                onChange={(e) => setSlaHours(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Description & Business Context:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the regulatory or organizational necessity of this workflow..."
              rows={2}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Configurable Steps Builder */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#2563eb" />
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                  Sequential Workflow Stages ({steps.length})
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: '#2563eb',
                  backgroundColor: '#eff6ff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe'
                }}
              >
                <Plus size={14} /> Add Stage
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'grid',
                    gridTemplateColumns: '36px 1.5fr 1.2fr 1fr 40px',
                    gap: '12px',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.8rem'
                  }}>
                    {idx + 1}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={step.stepName}
                      onChange={(e) => handleStepChange(idx, 'stepName', e.target.value)}
                      placeholder="Stage Name"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  <div>
                    <select
                      value={step.requiredRole}
                      onChange={(e) => handleStepChange(idx, 'requiredRole', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="ROLE_EMPLOYEE">Role: Employee</option>
                      <option value="ROLE_MANAGER">Role: Manager</option>
                      <option value="ROLE_AUDITOR">Role: Auditor</option>
                      <option value="ROLE_ADMIN">Role: Admin</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={step.stepType}
                      onChange={(e) => handleStepChange(idx, 'stepType', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="SUBMISSION">Type: Submission</option>
                      <option value="REVIEW">Type: Review</option>
                      <option value="APPROVAL">Type: Approval</option>
                      <option value="COMPLETION">Type: Completion</option>
                    </select>
                  </div>

                  <div>
                    {idx > 0 && idx < steps.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        style={{
                          color: '#ef4444',
                          padding: '6px',
                          borderRadius: '6px'
                        }}
                        title="Delete step"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
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
              <GitPullRequest size={16} />
              <span>{loading ? 'Publishing...' : 'Publish Workflow Template'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
