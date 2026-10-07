import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LogOut, 
  UserCheck, 
  ShieldAlert, 
  Briefcase, 
  User as UserIcon,
  Layers,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ onOpenNewInstance }) => {
  const { user, logout, login } = useAuth();

  // Quick Persona switcher for easy demonstration
  const handleSwitchPersona = async (username, password) => {
    try {
      await login(username, password);
    } catch (err) {
      console.error('Failed to switch persona:', err);
    }
  };

  const getRoleBadge = () => {
    if (!user || !user.roles) return null;
    if (user.roles.includes('ROLE_ADMIN')) {
      return <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>Admin</span>;
    }
    if (user.roles.includes('ROLE_MANAGER')) {
      return <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>Manager</span>;
    }
    if (user.roles.includes('ROLE_AUDITOR')) {
      return <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Auditor</span>;
    }
    return <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>Employee</span>;
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 2px 4px rgba(37,99,235,0.25)'
        }}>
          <Layers size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#0f172a', lineHeight: 1.2 }}>
            WorkflowEnterprise<span style={{ color: '#2563eb' }}>.OS</span>
          </h1>
          <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>
            Multi-User Business Process Automation Engine
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Quick Persona Switcher for demonstration */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          padding: '4px 8px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          gap: '6px'
        }}>
          <span style={{ fontSize: '0.73rem', fontWeight: '600', color: '#64748b', marginRight: '4px' }}>
            Switch Role:
          </span>
          <button
            onClick={() => handleSwitchPersona('admin', 'Admin@123')}
            style={{
              fontSize: '0.72rem',
              fontWeight: user?.username === 'admin' ? '700' : '500',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: user?.username === 'admin' ? '#2563eb' : 'transparent',
              color: user?.username === 'admin' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
            title="Alexander Wright (Admin)"
          >
            Admin
          </button>
          <button
            onClick={() => handleSwitchPersona('sarah.manager', 'Manager@123')}
            style={{
              fontSize: '0.72rem',
              fontWeight: user?.username === 'sarah.manager' ? '700' : '500',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: user?.username === 'sarah.manager' ? '#2563eb' : 'transparent',
              color: user?.username === 'sarah.manager' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
            title="Sarah Chen (Manager)"
          >
            Manager
          </button>
          <button
            onClick={() => handleSwitchPersona('alex.employee', 'Employee@123')}
            style={{
              fontSize: '0.72rem',
              fontWeight: user?.username === 'alex.employee' ? '700' : '500',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: user?.username === 'alex.employee' ? '#2563eb' : 'transparent',
              color: user?.username === 'alex.employee' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
            title="Alex Miller (Employee)"
          >
            Employee
          </button>
          <button
            onClick={() => handleSwitchPersona('elena.auditor', 'Auditor@123')}
            style={{
              fontSize: '0.72rem',
              fontWeight: user?.username === 'elena.auditor' ? '700' : '500',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: user?.username === 'elena.auditor' ? '#2563eb' : 'transparent',
              color: user?.username === 'elena.auditor' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
            title="Elena Rostova (Auditor)"
          >
            Auditor
          </button>
        </div>

        {/* Start Instance CTA */}
        <button
          onClick={onOpenNewInstance}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: '600',
            boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
            transition: 'background-color 0.15s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        >
          <span>+</span> New Request
        </button>

        {/* User Profile Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '12px',
          borderLeft: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '0.82rem',
            color: '#334155'
          }}>
            {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'U'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#0f172a' }}>
                {user?.fullName || user?.username}
              </span>
              {getRoleBadge()}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {user?.department || 'Operations'}
            </span>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            style={{
              padding: '6px',
              borderRadius: '6px',
              color: '#94a3b8',
              marginLeft: '4px',
              transition: 'color 0.15s, background-color 0.15s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.backgroundColor = '#fef2f2';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
