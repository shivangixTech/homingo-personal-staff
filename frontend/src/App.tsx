import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { AssistantPage } from './pages/AssistantPage';
import { EmailPage } from './pages/EmailPage';
import { CalendarPage } from './pages/CalendarPage';
import { BillsRefundsPage } from './pages/BillsRefundsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { ActivityHistoryPage } from './pages/ActivityHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="assistant" element={<AssistantPage />} />
                <Route path="emails" element={<EmailPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="bills" element={<BillsRefundsPage />} />
                <Route path="approvals" element={<ApprovalsPage />} />
                <Route path="activity" element={<ActivityHistoryPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
