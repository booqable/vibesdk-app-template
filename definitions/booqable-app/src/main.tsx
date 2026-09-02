import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { ThemeProvider } from '@/components/theme-provider';
import '@fontsource/mulish/400.css'
import '@fontsource/mulish/600.css'
import '@fontsource/mulish/700.css'
import '@/index.css'
import { HomePage } from '@/pages/HomePage'

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)
