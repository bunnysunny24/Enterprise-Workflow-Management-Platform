import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ApprovalsView } from './views/ApprovalsView';
import { AllWorkflowsView } from './views/AllWorkflowsView';
import { DefinitionsView } from './views/DefinitionsView';
import { AuditTrailView } from './views/AuditTrailView';
import { LoginView } from './views/LoginView';
import { InstanceDetailModal } from './components/InstanceDetailModal';
import { NewInstanceModal } from './components/NewInstanceModal';
import { WorkflowBuilderModal } from './components/WorkflowBuilderModal';
import { workflowApi } from './services/api';

export function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInstanceId, setSelectedInstanceId] = useState(null);
  const [isNewInstanceOpen, setIsNewInstanceOpen] = useState(false);
  const [isWorkflowBuilderOpen, setIsWorkflowBuilderOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const loadPendingCount = async () => {
    if (!user) return;
    try {
      const res = await workflowApi.getPendingApprovals();
      if (res.success) {
        setPendingCount(res.data.length);
      }
    } catch (e) {
      console.error('Failed to load pending count', e);
    }
  };

  useEffect(() => {
    if (user) {
      loadPendingCount();
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontSize: '0.9rem',
        fontWeight: '600'
      }}>
        Loading Enterprise Platform...
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Top Navbar */}
      <Navbar onOpenNewInstance={() => setIsNewInstanceOpen(true)} />

      {/* Main Body */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingCount={pendingCount}
        />

        {/* Content View */}
        <main style={{ flex: 1, padding: '28px 36px', maxWidth: '1440px', overflowX: 'hidden' }}>
          {activeTab === 'dashboard' && (
            <DashboardView
              onSelectInstance={(id) => setSelectedInstanceId(id)}
              onOpenNewInstance={() => setIsNewInstanceOpen(true)}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsView
              onSelectInstance={(id) => setSelectedInstanceId(id)}
            />
          )}

          {activeTab === 'all-workflows' && (
            <AllWorkflowsView
              onSelectInstance={(id) => setSelectedInstanceId(id)}
              onOpenNewInstance={() => setIsNewInstanceOpen(true)}
            />
          )}

          {activeTab === 'definitions' && (
            <DefinitionsView
              onOpenWorkflowBuilder={() => setIsWorkflowBuilderOpen(true)}
            />
          )}

          {activeTab === 'audit' && (
            <AuditTrailView
              onSelectInstance={(id) => setSelectedInstanceId(id)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedInstanceId && (
        <InstanceDetailModal
          instanceId={selectedInstanceId}
          onClose={() => setSelectedInstanceId(null)}
          onActionCompleted={() => {
            loadPendingCount();
          }}
        />
      )}

      {isNewInstanceOpen && (
        <NewInstanceModal
          isOpen={isNewInstanceOpen}
          onClose={() => setIsNewInstanceOpen(false)}
          onCreated={(inst) => {
            loadPendingCount();
            setSelectedInstanceId(inst.id);
          }}
        />
      )}

      {isWorkflowBuilderOpen && (
        <WorkflowBuilderModal
          isOpen={isWorkflowBuilderOpen}
          onClose={() => setIsWorkflowBuilderOpen(false)}
          onCreated={() => {
            setActiveTab('definitions');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
