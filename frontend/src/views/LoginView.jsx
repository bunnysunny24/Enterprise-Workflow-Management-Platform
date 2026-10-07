import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoginView = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    {
      name: 'Alexander Wright',
      role: 'Administrator (CIO)',
      username: 'admin',
      password: 'Admin@123',
      color: '#fee2e2',
      textColor: '#991b1b'
    },
    {
      name: 'Sarah Chen',
      role: 'Operations Manager',
      username: 'sarah.manager',
      password: 'Manager@123',
      color: '#e0e7ff',
      textColor: '#3730a3'
    },
    {
      name: 'Alex Miller',
      role: 'Software Engineer',
      username: 'alex.employee',
      password: 'Employee@123',
      color: '#ecfdf5',
      textColor: '#065f46'
    },
    {
      name: 'Elena Rostova',
      role: 'Compliance Auditor',
      username: 'elena.auditor',
      password: 'Auditor@123',
      color: '#fef3c7',
      textColor: '#92400e'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (acc) => {
    setUsername(acc.username);
    setPassword(acc.password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        width: '100%',
        maxWidth: '460px',
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: '0 4px 6px -1px rgba(37,99,235,0.25)'
          }}>
            <Layers size={26} />
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Enterprise Workflow Platform
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
            Role-Based Access Control • Automated Multi-User Pipelines
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '10px 12px',
            color: '#b91c1c',
            fontSize: '0.82rem'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Username or Corporate Email:
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Password:
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
              marginTop: '6px',
              opacity: loading ? 0.6 : 1
            }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Credentials Selector */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
          <span style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Instant Demo Profiles (Click to Load):
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {demoAccounts.map((acc) => (
              <button
                key={acc.username}
                type="button"
                onClick={() => handleSelectDemo(acc)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: username === acc.username ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: username === acc.username ? '#eff6ff' : '#f8fafc',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#0f172a' }}>
                  {acc.name}
                </span>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.66rem',
                  fontWeight: '600',
                  color: acc.textColor,
                  backgroundColor: acc.color,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  marginTop: '2px'
                }}>
                  {acc.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
