import * as React from 'react'
import { initBooqableSession, getBooqableStatus, BooqableStatus } from '@/lib/booqable'

// Starter screen shown while Bo generates the real app: a "building your app"
// state. REPLACE this page with the app the user asked for — keep the
// initBooqableSession() bootstrap. The app renders inside the Booqable back
// office, so no Booqable-branded header/chrome: content starts edge-to-edge.
export function HomePage() {
  const [status, setStatus] = React.useState<BooqableStatus | null>(null)

  React.useEffect(() => {
    initBooqableSession()
      .then(getBooqableStatus)
      .then(setStatus)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-16 text-center text-foreground">
      <img
        src="/booqable/app-setup-loading.svg"
        alt=""
        width={280}
        height={160}
      />
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-display-xs font-semibold">Bo is building your app</h1>
        <p className="text-base text-muted-foreground">
          The first version of your app will appear here as soon as it's generated.
          Keep an eye on the chat for progress.
        </p>
      </div>
      {status !== null && !status.connected && (
        <p className="text-sm text-muted-foreground">
          Tip: open this app from your Booqable back office to connect it to your account.
        </p>
      )}
    </main>
  )
}
