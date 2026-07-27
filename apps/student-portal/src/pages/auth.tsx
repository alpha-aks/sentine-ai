import React from 'react';
import { AuthView } from '@neondatabase/auth-ui';
import { Navigate } from 'react-router-dom';
import { authClient } from '../lib/auth';

export default function AuthPage() {
  const { data: session } = authClient.useSession();

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0d1117', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#161b22', padding: 24, borderRadius: 8, border: '1px solid #30363d' }}>
        <h2 style={{ color: '#f0f6fc', textAlign: 'center', marginBottom: 24 }}>Sign in to SentinelAI</h2>
        <AuthView />
      </div>
    </div>
  );
}
