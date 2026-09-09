import type { ReactNode } from 'react'

// import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'
import { Card, CardContent } from './ui/card'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-blue-50 px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <Logo to="/login" />
          {/* <LanguageSwitcher /> */}
        </div>
        <Card>
          <CardContent className="py-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
