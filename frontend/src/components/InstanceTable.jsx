import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Search,
  Filter
} from 'lucide-react';

export const InstanceTable = ({ instances = [], onSelectInstance, emptyMessage = "No workflow instances found." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const filteredInstances = instances.filter((item) => {
    const matchesSearch = searchTerm === '' ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.workflowName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.initiator?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Controls Bar */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        backgroundColor: '#f8fafc',
        flexWrap: 'wrap'
      }}>
        <div style={{
          position: 'relative',
          flex: '1',
          minWidth: '240px'
        }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by tracking number, title, workflow, or requester..."
            style={{
              width: '100%',
              padding: '7px 12px 7px 34px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              backgroundColor: '#ffffff',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              backgroundColor: '#ffffff',
              color: '#475569'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="WAITING_APPROVAL">Waiting Approval</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              backgroundColor: '#ffffff',
              color: '#475569'
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              color: '#64748b',
              fontSize: '0.74rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <th style={{ padding: '12px 18px' }}>Tracking #</th>
              <th style={{ padding: '12px 18px' }}>Request Title</th>
              <th style={{ padding: '12px 18px' }}>Workflow Type</th>
              <th style={{ padding: '12px 18px' }}>Current Stage</th>
              <th style={{ padding: '12px 18px' }}>Priority</th>
              <th style={{ padding: '12px 18px' }}>Status</th>
              <th style={{ padding: '12px 18px' }}>Requester</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstances.length > 0 ? (
              filteredInstances.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.1s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectInstance(item.id)}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontWeight: '700', color: '#2563eb' }}>
                    {item.trackingNumber}
                  </td>
                  <td style={{ padding: '12px 18px', fontWeight: '600', color: '#0f172a', maxWidth: '280px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                  </td>
                  <td style={{ padding: '12px 18px', color: '#475569' }}>
                    {item.workflowName}
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    <span style={{
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: '600'
                    }}>
                      {item.currentStep?.stepName || 'Completed'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    {getPriorityBadge(item.priority)}
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    {getStatusBadge(item.status)}
                    {item.slaBreached && (
                      <span title="SLA Overdue" style={{ marginLeft: '4px', color: '#ef4444' }}>⚠️</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 18px', color: '#475569' }}>
                    <div style={{ fontWeight: '500' }}>{item.initiator?.fullName}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.initiator?.department}</div>
                  </td>
                  <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectInstance(item.id);
                      }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        fontWeight: '600',
                        fontSize: '0.76rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Review</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
