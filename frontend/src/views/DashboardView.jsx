import React, { useState, useEffect } from 'react';
import { workflowApi } from '../services/api';
import { StatCard } from '../components/StatCard';
import { InstanceTable } from '../components/InstanceTable';
import { 
  FileCheck2, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Layers, 
  TrendingUp, 
  ArrowUpRight,
  ShieldAlert,
  BarChart3
} from 'lucide-react';

export const DashboardView = ({ onSelectInstance, onOpenNewInstance }) => {
  const [metrics, setMetrics] = useState(null);
  const [recentInstances, setRecentInstances] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsRes, instancesRes] = await Promise.all([
        workflowApi.getMetrics(),
        workflowApi.getAllInstances()
      ]);

      if (metricsRes.success) {
        setMetrics(metricsRes.data);
      }
      if (instancesRes.success) {
        setRecentInstances(instancesRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Executive Workflow Operations
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Real-time business process telemetry, SLA compliance, and cross-department throughput
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
            gap: '6px',
            boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
          }}
        >
          <span>+</span> Create Business Request
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <StatCard
          title="Total Workflows Executed"
          value={metrics?.totalInstances || 0}
          subtitle="All recorded process instances"
          icon={Layers}
          color="#2563eb"
        />
        <StatCard
          title="Active In-Flight"
          value={metrics?.activeInstances || 0}
          subtitle="Pending approvals or reviews"
          icon={Clock}
          color="#f59e0b"
        />
        <StatCard
          title="Completed & Approved"
          value={metrics?.approvedInstances || 0}
          subtitle="Successfully resolved"
          icon={CheckCircle}
          color="#10b981"
          trend={{ text: `${metrics?.totalInstances ? Math.round(((metrics.approvedInstances || 0) / metrics.totalInstances) * 100) : 0}% success rate`, positive: true }}
        />
        <StatCard
          title="SLA Risk & Breaches"
          value={metrics?.slaBreachedInstances || 0}
          subtitle="Passed expected turnaround target"
          icon={AlertCircle}
          color="#ef4444"
          trend={metrics?.slaBreachedInstances > 0 ? { text: "Requires Attention", positive: false } : { text: "Healthy", positive: true }}
        />
      </div>

      {/* Two Column Section: Workflow Analytics & Department Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* By Workflow Distribution */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BarChart3 size={18} color="#2563eb" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
              Volume by Workflow Template
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {metrics?.instancesByWorkflow && Object.keys(metrics.instancesByWorkflow).length > 0 ? (
              Object.entries(metrics.instancesByWorkflow).map(([wfName, count]) => {
                const total = metrics.totalInstances || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={wfName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: '#334155' }}>{wfName}</span>
                      <span style={{ color: '#64748b' }}>{count} ({percentage}%)</span>
                    </div>
                    <div style={{ height: '7px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No workflow execution data yet.</span>
            )}
          </div>
        </div>

        {/* Priority & Turnaround Metrics */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp size={18} color="#2563eb" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
              SLA Performance & Velocity
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <span style={{ display: 'block', fontWeight: '600', color: '#0f172a' }}>
                  Average Turnaround Time:
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  From submission to terminal approval
                </span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2563eb' }}>
                {metrics?.avgCompletionHours || 0} hrs
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.78rem' }}>
                Priority Breakdown:
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                  <div
                    key={p}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', color: '#64748b' }}>{p}</span>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                      {metrics?.instancesByPriority ? (metrics.instancesByPriority[p] || 0) : 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Workflow Instances Table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
            Live In-Flight & Recently Resolved Workflows
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Showing latest {recentInstances.slice(0, 10).length} of {recentInstances.length} entries
          </span>
        </div>

        <InstanceTable
          instances={recentInstances.slice(0, 10)}
          onSelectInstance={onSelectInstance}
        />
      </div>
    </div>
  );
};
