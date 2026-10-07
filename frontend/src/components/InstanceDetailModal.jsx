import React, { useState, useEffect } from 'react';
import { workflowApi } from '../services/api';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  User, 
  Send,
  MessageSquare,
  ShieldCheck,
  History,
  FileText
} from 'lucide-react';

export const InstanceDetailModal = ({ instanceId, onClose, onActionCompleted }) => {
  const [instance, setInstance] = useState(null);
  const [definition, setDefinition] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionComments, setActionComments] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const instRes = await workflowApi.getInstanceById(instanceId);
      if (instRes.success) {
        setInstance(instRes.data);
        // Load definition steps
        const defRes = await workflowApi.getDefinitionById(instRes.data.workflowDefinitionId);
        if (defRes.success) {
          setDefinition(defRes.data);
        }
      }
      // Load audit logs
      const auditRes = await workflowApi.getInstanceAuditLogs(instanceId);
      if (auditRes.success) {
        setAuditLogs(auditRes.data);
      }
    } catch (err) {
      console.error('Failed to load instance details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (instanceId) {
      loadData();
    }
  }, [instanceId]);

  const handleAction = async (actionType) => {
    try {
      setSubmittingAction(true);
      setActionError('');
      const res = await workflowApi.executeAction(instanceId, {
        action: actionType,
        comments: actionComments,
      });

      if (res.success) {
        setActionComments('');
        onActionCompleted && onActionCompleted();
        await loadData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Action failed');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (!instanceId) return null;

  // Parse payload JSON
  let payloadData = {};
  try {
    if (instance?.payloadJson) {
      payloadData = JSON.parse(instance.payloadJson);
    }
  } catch (e) {
    payloadData = { raw: instance?.payloadJson };
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge badge-approved"><CheckCircle2 size={12} /> Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected"><XCircle size={12} /> Rejected</span>;
      case 'WAITING_APPROVAL':
        return <span className="badge badge-waiting_approval"><Clock size={12} /> Waiting Approval</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-in_progress"><Clock size={12} /> In Progress</span>;
      case 'CANCELLED':
        return <span className="badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="badge badge-pending">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    return <span className={`badge badge-priority-${priority?.toLowerCase()}`}>{priority}</span>;
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
        maxWidth: '900px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563eb', fontFamily: 'monospace' }}>
                {instance?.trackingNumber}
              </span>
              {instance && getStatusBadge(instance.status)}
              {instance && getPriorityBadge(instance.priority)}
              {instance?.slaBreached && (
                <span className="badge" style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
                  <AlertTriangle size={12} /> SLA Overdue
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
              {instance?.title}
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Workflow: <strong>{instance?.workflowName}</strong> | Initiator: <strong>{instance?.initiator?.fullName}</strong> ({instance?.initiator?.department})
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: '#64748b',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Loading workflow instance state...
            </div>
          ) : (
            <>
              {/* Stepper Progress Bar */}
              <div>
                <h4 style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '14px' }}>
                  Configured Workflow Stages & Lifecycle
                </h4>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  position: 'relative'
                }}>
                  {definition?.steps?.map((step, idx) => {
                    const isCurrent = instance?.currentStep?.id === step.id && 
                      (instance?.status === 'IN_PROGRESS' || instance?.status === 'WAITING_APPROVAL');
                    
                    const currentIndex = definition.steps.findIndex(s => s.id === instance?.currentStep?.id);
                    const isCompleted = instance?.status === 'APPROVED' || 
                      (currentIndex > -1 && idx < currentIndex);
                    
                    const isRejectedStep = instance?.status === 'REJECTED' && instance?.currentStep?.id === step.id;

                    return (
                      <React.Fragment key={step.id}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          gap: '6px',
                          zIndex: 2,
                          minWidth: '120px'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            backgroundColor: isCompleted ? '#10b981' : isRejectedStep ? '#ef4444' : isCurrent ? '#2563eb' : '#ffffff',
                            color: (isCompleted || isCurrent || isRejectedStep) ? '#ffffff' : '#64748b',
                            border: `2px solid ${isCompleted ? '#10b981' : isRejectedStep ? '#ef4444' : isCurrent ? '#2563eb' : '#cbd5e1'}`,
                            boxShadow: isCurrent ? '0 0 0 4px rgba(37,99,235,0.2)' : 'none',
                            transition: 'all 0.2s ease'
                          }}>
                            {isCompleted ? <CheckCircle2 size={18} /> : isRejectedStep ? <XCircle size={18} /> : (idx + 1)}
                          </div>

                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: isCurrent ? '700' : '600',
                            color: isCurrent ? '#1d4ed8' : isCompleted ? '#0f172a' : '#64748b'
                          }}>
                            {step.stepName}
                          </span>

                          <span style={{
                            fontSize: '0.68rem',
                            backgroundColor: '#e2e8f0',
                            color: '#475569',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            {step.requiredRole?.replace('ROLE_', '') || 'Any'}
                          </span>
                        </div>

                        {idx < definition.steps.length - 1 && (
                          <div style={{
                            flex: 1,
                            height: '3px',
                            backgroundColor: isCompleted ? '#10b981' : '#e2e8f0',
                            margin: '0 8px',
                            marginBottom: '32px',
                            transition: 'background-color 0.2s ease'
                          }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Form Data & Instance Attributes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                {/* Form Payload Data */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <FileText size={18} color="#2563eb" />
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                      Submitted Request Details
                    </h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.keys(payloadData).length > 0 ? (
                      Object.entries(payloadData).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'capitalize' }}>
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#0f172a' }}>
                            {typeof val === 'number' && key.toLowerCase().includes('amount') ? `$${val.toLocaleString()}` : String(val)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No form parameters recorded.</span>
                    )}
                  </div>
                </div>

                {/* SLA & Governance Details */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Clock size={18} color="#2563eb" />
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                      SLA & Assignment Context
                    </h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Current Assignee</span>
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>
                        {instance?.assignee ? instance.assignee.fullName : 'Role-based Pool (' + (instance?.currentStep?.requiredRole?.replace('ROLE_', '') || 'Any') + ')'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>SLA Target Hours</span>
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>
                        {definition?.slaHours || 48} Hours
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>SLA Deadline</span>
                      <span style={{ fontWeight: '600', color: instance?.slaBreached ? '#ef4444' : '#0f172a' }}>
                        {instance?.slaDeadline ? new Date(instance.slaDeadline).toLocaleString() : 'N/A'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Initiation Timestamp</span>
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>
                        {instance?.createdAt ? new Date(instance.createdAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Decision Panel (If availableActions is present) */}
              {instance?.availableActions && instance.availableActions.length > 0 && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <ShieldCheck size={20} color="#2563eb" />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                      Authorize or Progress Workflow Action
                    </h4>
                  </div>

                  {actionError && (
                    <div style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#b91c1c',
                      fontSize: '0.8rem',
                      marginBottom: '12px'
                    }}>
                      {actionError}
                    </div>
                  )}

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                      Decision Remarks & Audit Comments:
                    </label>
                    <textarea
                      value={actionComments}
                      onChange={(e) => setActionComments(e.target.value)}
                      placeholder="Add compliance notes, audit rationale, or specific approval conditions..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {instance.availableActions.includes('APPROVE') && (
                      <button
                        onClick={() => handleAction('APPROVE')}
                        disabled={submittingAction}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          boxShadow: '0 1px 3px rgba(16,185,129,0.3)',
                          opacity: submittingAction ? 0.6 : 1
                        }}
                      >
                        <CheckCircle2 size={16} /> Approve & Forward
                      </button>
                    )}

                    {instance.availableActions.includes('REJECT') && (
                      <button
                        onClick={() => handleAction('REJECT')}
                        disabled={submittingAction}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          boxShadow: '0 1px 3px rgba(239,68,68,0.3)',
                          opacity: submittingAction ? 0.6 : 1
                        }}
                      >
                        <XCircle size={16} /> Reject Workflow
                      </button>
                    )}

                    {instance.availableActions.includes('REQUEST_CHANGES') && (
                      <button
                        onClick={() => handleAction('REQUEST_CHANGES')}
                        disabled={submittingAction}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#f59e0b',
                          color: '#ffffff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          boxShadow: '0 1px 3px rgba(245,158,11,0.3)',
                          opacity: submittingAction ? 0.6 : 1
                        }}
                      >
                        <AlertTriangle size={16} /> Request Changes
                      </button>
                    )}

                    {instance.availableActions.includes('ESCALATE') && (
                      <button
                        onClick={() => handleAction('ESCALATE')}
                        disabled={submittingAction}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#7c3aed',
                          color: '#ffffff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          opacity: submittingAction ? 0.6 : 1
                        }}
                      >
                        Escalate Priority
                      </button>
                    )}

                    {instance.availableActions.includes('CANCEL') && (
                      <button
                        onClick={() => handleAction('CANCEL')}
                        disabled={submittingAction}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#64748b',
                          color: '#ffffff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          opacity: submittingAction ? 0.6 : 1
                        }}
                      >
                        Cancel Instance
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Audit Trail Timeline */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <History size={18} color="#2563eb" />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                    Persistent Audit Log & Historical Transitions
                  </h4>
                </div>

                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff'
                }}>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log, idx) => (
                      <div
                        key={log.id}
                        style={{
                          padding: '12px 18px',
                          borderBottom: idx < auditLogs.length - 1 ? '1px solid #f1f5f9' : 'none',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '12px',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.72rem',
                            flexShrink: 0
                          }}>
                            {idx + 1}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: '700', color: '#0f172a' }}>
                                {log.actionTaken}
                              </span>
                              <span style={{ color: '#64748b' }}>at stage</span>
                              <span style={{ fontWeight: '600', color: '#1d4ed8' }}>
                                {log.stepName}
                              </span>
                              <span style={{ color: '#94a3b8' }}>• by</span>
                              <span style={{ fontWeight: '600', color: '#334155' }}>
                                {log.actor?.fullName || 'System'}
                              </span>
                            </div>

                            {log.comments && (
                              <div style={{ color: '#475569', marginTop: '4px', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '4px' }}>
                                "{log.comments}"
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                          <div>{new Date(log.timestamp).toLocaleString()}</div>
                          {log.durationMinutes > 0 && (
                            <div style={{ color: '#64748b' }}>Time in stage: {log.durationMinutes}m</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                      No audit history entries recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
