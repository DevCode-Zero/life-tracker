import { AuthProvider } from '@/components/layout/AuthProvider'
import { AppShell } from '@/components/layout/AppShell'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>
        <ErrorBoundary sectionName="Dashboard">
          {children}
        </ErrorBoundary>
      </AppShell>
    </AuthProvider>
  )
}
