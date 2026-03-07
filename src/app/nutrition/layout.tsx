import { AuthProvider } from '@/components/layout/AuthProvider'
import { AppShell } from '@/components/layout/AppShell'

export default function NutritionLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>
        {children}
      </AppShell>
    </AuthProvider>
  )
}
