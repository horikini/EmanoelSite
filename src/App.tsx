/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import PatientProfile from './pages/PatientProfile';
import SetPassword from './pages/SetPassword';
import CompleteProfile from './pages/CompleteProfile';
import PendingApproval from './pages/PendingApproval';
import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/patient/:id" element={<PatientProfile />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/criar-senha" element={<SetPassword />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
