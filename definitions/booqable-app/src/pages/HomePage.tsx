import * as React from 'react'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { initBooqableSession, getBooqableStatus, booqableApi, BooqableStatus } from '@/lib/booqable'

// Starter screen: shows the Booqable connection state and a sample API call.
// Replace this with the app the user asked for — keep the session bootstrap.
export function HomePage() {
  const [status, setStatus] = React.useState<BooqableStatus | null>(null)
  const [orders, setOrders] = React.useState<Array<{ id: string; attributes: Record<string, any> }> | null>(null)

  React.useEffect(() => {
    initBooqableSession()
      .then(getBooqableStatus)
      .then((current) => {
        setStatus(current)
        if (current?.connected) {
          booqableApi('/orders?page[size]=5&sort=-created_at')
            .then((doc) => setOrders([doc.data].flat().filter(Boolean)))
            .catch(() => setOrders([]))
        }
      })
  }, [])

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-6" />
          <Separator orientation="vertical" className="h-5" />
          <span className="text-md font-semibold">Starter app</span>
        </div>
        <div className="flex items-center gap-2">
          {status?.company && <Badge variant="brand">{status.company}</Badge>}
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Booqable connection</CardTitle>
            <CardDescription>How this app talks to your Booqable account.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <StatusRow label="Connected to Booqable" ok={Boolean(status?.connected)} />
            {!status?.connected && (
              <Alert>
                <AlertTitle>Not connected</AlertTitle>
                <AlertDescription>
                  Open this app from your Booqable back office — the embed link carries the
                  credentials this app needs. No configuration required.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {status?.connected && (
          <Card>
            <CardHeader>
              <CardTitle>Latest orders</CardTitle>
              <CardDescription>A sample call through the Booqable API proxy.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {orders === null && <p className="text-sm text-fg-muted">Loading…</p>}
              {orders?.length === 0 && <p className="text-sm text-fg-muted">No orders yet.</p>}
              {orders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <span className="text-sm font-medium">#{order.attributes.number ?? order.id.slice(0, 8)}</span>
                  <Badge variant="gray">{order.attributes.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Badge variant={ok ? 'success' : 'gray'}>{ok ? 'Yes' : 'No'}</Badge>
    </div>
  )
}
