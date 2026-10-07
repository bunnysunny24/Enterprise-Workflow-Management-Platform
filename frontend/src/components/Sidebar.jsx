import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  FileText, 
  GitBranch, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab, pendingCount = 0 }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'approvals',
      label: 'Approvals Inbox',
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: '#ef4444',
    },
    {
      id: 'all-workflows',
      label: 'Workflow Instances',
      icon: FileText,
      badge: null,
    },
    {
      id: 'definitions',
      label: 'Workflow Studio',
      icon: GitBranch,
      badge: null,
    },
    {
      id: 'audit',
      label: 'Compliance Audit Trail',
      icon: ShieldCheck,
      badge: null,
    },
  ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      gap: '4px',
      height: 'calc(100vh - 64px)',
      position: 'sticky',
      top: '64px',
      flexShrink: 0
    }}>
      <div style={{ padding: '0 8px 12px 8px' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>
          Platform Navigation
        </span>
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: isActive ? '#eff6ff' : 'transparent',
              color: isActive ? '#1d4ed8' : '#475569',
              fontWeight: isActive ? '600' : '500',
              fontSize: '0.84rem',
              transition: 'all 0.15s ease',
              width: '100%',
              textAlign: 'left'
            }}
            onMouseOver={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.color = '#0f172a';
              }
            }}
            onMouseOut={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#475569';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon size={18} color={isActive ? '#2563eb' : '#64748b'} />
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span style={{
                backgroundColor: item.badgeColor || '#2563eb',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: '700',
                padding: '2px 7px',
                borderRadius: '9999px',
                lineHeight: 1
              }}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', padding: '16px 8px 0 8px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.74rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Workflow Engine Active</span>
          </div>
          <div>Spring Boot 3.3 & MySQL</div>
          <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '2px' }}>Role-Based State Machine</div>
        </div>
      </div>
    </aside>
  );
};
