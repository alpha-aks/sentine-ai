import React from 'react';
import { AccountView } from '@neondatabase/auth-ui';
import { Link, Navigate } from 'react-router-dom';
import { authClient } from '../lib/auth';

export default function AccountPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div style={{ color: '#c9d1d9', padding: 40, textAlign: 'center' }}>Loading account details...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, background: '#161b22', borderRadius: 8, border: '1px solid #30363d' }}>
      <Link to="/" style={{ color: '#58a6ff', textDecoration: 'none', marginBottom: 24, display: 'inline-block', fontWeight: 600 }}>
        ← Back to Candidate Workspace
      </Link>
      <h2 style={{ color: '#f0f6fc', marginBottom: 20 }}>Account Settings</h2>
      <AccountView />
    </div>
  );
}
