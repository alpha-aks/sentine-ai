import React from 'react';
import { AuthView } from '@neondatabase/auth-ui';
import { Navigate } from 'react-router-dom';
import { authClient } from '../lib/auth';
import { ShieldCheck, GraduationCap } from 'lucide-react';

export default function AuthPage() {
  const { data: session } = authClient.useSession();

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0d1117', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#161b22', padding: 28, borderRadius: 12, border: '1px solid #30363d', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: 'rgba(56, 139, 253, 0.15)', color: '#58a6ff', marginBottom: 12 }}>
            <GraduationCap size={28} />
          </div>
          <h2 style={{ color: '#f0f6fc', margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 700 }}>Candidate Student Login</h2>
          <p style={{ color: '#8b949e', margin: 0, fontSize: '0.85rem' }}>Sign in to access your proctored examinations</p>
        </div>

        <AuthView pathname={window.location.pathname} />
      </div>
    </div>
  );
}

