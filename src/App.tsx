import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

import { AppShell } from './components/AppShell'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './lib/auth'
import { AnalyticsPage } from './pages/Analytics'
import { AttendancePage } from './pages/Attendance'
import { ConferenceLayout } from './pages/ConferenceLayout'
import { ConferenceOverviewPage } from './pages/ConferenceOverview'
import { ConferencesPage } from './pages/Conferences'
import { ContactDetailPage } from './pages/ContactDetail'
import { ContactsPage } from './pages/Contacts'
import { DashboardPage } from './pages/Dashboard'
import { GroupsPage } from './pages/Groups'
import { LoginPage } from './pages/Login'
import { OrganisationPage } from './pages/Organisation'
// import { RegisterPage } from './pages/Register'
import { ScanPage } from './pages/Scan'
import { SessionsPage } from './pages/Sessions'
import { SetAttendancePage } from './pages/SetAttendance'
import { StaffPage } from './pages/Staff'

export default function App() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              {/* <Route path="/register" element={<RegisterPage />} /> */}
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/conferences" element={<ConferencesPage />} />
                <Route path="/conferences/:id" element={<ConferenceLayout />}>
                  <Route index element={<ConferenceOverviewPage />} />
                  <Route path="sessions" element={<SessionsPage />} />
                  <Route path="groups" element={<GroupsPage />} />
                  <Route path="contacts" element={<ContactsPage />} />
                  <Route path="contacts/:contactId" element={<ContactDetailPage />} />
                </Route>
                <Route path="/scan" element={<ScanPage />} />
                <Route path="/set-attendance" element={<SetAttendancePage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route element={<ProtectedRoute gate="owner" />}>
                  <Route path="/staff" element={<StaffPage />} />
                  <Route path="/organisation" element={<OrganisationPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  )
}
