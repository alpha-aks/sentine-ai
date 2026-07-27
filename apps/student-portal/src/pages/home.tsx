import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth';
import ExamWorkspace from '../components/ExamWorkspace';

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#0d1117',
        color: '#c9d1d9',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>
        Verifying authentication session...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Auth Control Top Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 16,
        padding: '10px 24px',
        background: '#161b22',
        borderBottom: '1px solid #30363d',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.85rem',
        color: '#c9d1d9'
      }}>
        <span>
          Candidate: <strong style={{ color: '#f0f6fc' }}>{session.user?.email}</strong>
        </span>
        <button
          onClick={() => navigate('/account')}
          style={{
            background: '#21262d',
            border: '1px solid #30363d',
            color: '#c9d1d9',
            padding: '6px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          My Account
        </button>
        <button
          onClick={async () => {
            await authClient.signOut();
            navigate('/auth');
          }}
          style={{
            background: '#8b1a1a',
            border: '1px solid #f85149',
            color: '#ff7b72',
            padding: '6px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          Sign Out
        </button>
      </div>

      <ExamWorkspace />
    </div>
  );
}
