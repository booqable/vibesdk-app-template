import * as React from 'react'
import { BrandLogo } from '@/components/brand-logo'
import { Badge } from '@/components/ui/badge'
import { initBooqableSession, getBooqableStatus, BooqableStatus } from '@/lib/booqable'

// Starter screen shown while Bo generates the real app: a Booqable-branded
// "building your app" state. REPLACE this page with the app the user asked
// for — keep the initBooqableSession() bootstrap.
export function HomePage() {
  const [status, setStatus] = React.useState<BooqableStatus | null>(null)

  React.useEffect(() => {
    initBooqableSession()
      .then(getBooqableStatus)
      .then(setStatus)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <BrandLogo className="h-6" />
        {status?.connected && status.company && (
          <Badge variant="brand">Connected to {status.company}</Badge>
        )}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <img
          src="/booqable/app-setup-loading.svg"
          alt=""
          width={280}
          height={160}
          className="dark:opacity-90"
        />
        <div className="flex max-w-md flex-col gap-2">
          <h1 className="text-display-xs font-semibold">Bo is building your app</h1>
          <p className="text-md text-fg-muted">
            The first version of your app will appear here as soon as it's generated.
            Keep an eye on the chat for progress.
          </p>
        </div>
        {status !== null && !status.connected && (
          <p className="text-sm text-fg-subtle">
            Tip: open this app from your Booqable back office to connect it to your account.
          </p>
        )}
      </main>
    </div>
  )
}
