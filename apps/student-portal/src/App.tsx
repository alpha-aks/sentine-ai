import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NeonAuthUIProvider } from '@neondatabase/auth-ui';
import '@neondatabase/auth-ui/css';
import { authClient } from './lib/auth';
import HomePage from './pages/home';
import AuthPage from './pages/auth';
import AccountPage from './pages/account';

export default function App() {
  return (
    <NeonAuthUIProvider authClient={authClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/*" element={<AuthPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </BrowserRouter>
    </NeonAuthUIProvider>
  );
}
