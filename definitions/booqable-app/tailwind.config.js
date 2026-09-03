/**
 * Boomerang theme for shadcn/ui (Tailwind v3). Booqable's design system: brand
 * blue #136deb on a blue-tinted neutral scale, light mode only.
 *
 * Semantic colors map to the RGB-channel CSS variables in src/index.css via
 * `rgb(var(--token) / <alpha-value>)`, so shadcn's opacity modifiers
 * (`bg-primary/90`, `bg-background/80`, …) resolve correctly. The raw `brand`
 * and `gray` scales are hex literals for when you need a specific step.
 */
const channel = (name) => `rgb(var(${name}) / <alpha-value>)`

export default {
  // Light mode only. Kept as 'class' (never applied) rather than the Tailwind
  // default of 'media', so any stray `dark:` utility stays inert instead of
  // activating on the OS colour-scheme preference.
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mulish', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          25: '#f5f9ff', 50: '#edf5ff', 100: '#e2efff', 200: '#ddebff',
          300: '#bbdbfa', 400: '#86c2ff', 500: '#5a9fff', 600: '#136deb',
          700: '#2466c3', 800: '#3061a6', 900: '#36537c',
        },
        gray: {
          25: '#f8fafc', 50: '#f0f4f8', 100: '#e2e9f0', 200: '#cfd9e2',
          300: '#b4bfcb', 400: '#9ba6b1', 500: '#737f8c', 600: '#5c6670',
          700: '#394046', 800: '#2e3338', 900: '#131414',
        },
        background: channel('--background'),
        foreground: channel('--foreground'),
        card: { DEFAULT: channel('--card'), foreground: channel('--card-foreground') },
        popover: { DEFAULT: channel('--popover'), foreground: channel('--popover-foreground') },
        primary: { DEFAULT: channel('--primary'), hover: channel('--primary-hover'), foreground: channel('--primary-foreground') },
        secondary: { DEFAULT: channel('--secondary'), foreground: channel('--secondary-foreground') },
        muted: { DEFAULT: channel('--muted'), foreground: channel('--muted-foreground') },
        accent: { DEFAULT: channel('--accent'), foreground: channel('--accent-foreground') },
        destructive: {
          DEFAULT: channel('--destructive'), hover: channel('--destructive-hover'),
          foreground: channel('--destructive-foreground'), subtle: channel('--destructive-subtle'),
        },
        success: { DEFAULT: channel('--success'), foreground: channel('--success-foreground'), subtle: channel('--success-subtle') },
        warning: { DEFAULT: channel('--warning'), foreground: channel('--warning-foreground'), subtle: channel('--warning-subtle') },
        border: { DEFAULT: channel('--border'), strong: channel('--border-strong') },
        input: channel('--input'),
        ring: channel('--ring'),
        link: channel('--link'),
        chart: {
          1: channel('--chart-1'), 2: channel('--chart-2'), 3: channel('--chart-3'),
          4: channel('--chart-4'), 5: channel('--chart-5'),
        },
      },
      /* Radii — Figma: 8 (controls), 12 (cards), 20 (sections). shadcn maps
         lg/md/sm off --radius so its components inherit the Booqable rounding. */
      borderRadius: {
        sm: 'calc(var(--radius) - 2px)',
        md: 'calc(var(--radius) - 1px)',
        lg: 'var(--radius)',
        xl: '12px', '2xl': '16px', '3xl': '20px',
      },
      /* Type scale — Proxima Nova specimen from Figma (Mulish fallback) */
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '5.625rem', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '4.5rem', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '3.75rem', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.02em' }],
        'display-sm': ['1.875rem', { lineHeight: '2.375rem' }],
        'display-xs': ['1.5rem', { lineHeight: '2rem' }],
      },
      /* Elevation — Figma button/card shadows */
      boxShadow: {
        xs: '0 1px 2px 0 rgba(10, 13, 18, 0.05)',
        sm: '0 1px 3px 0 rgba(10, 13, 18, 0.1), 0 1px 2px -1px rgba(10, 13, 18, 0.1)',
        md: '0 4px 8px -2px rgba(10, 13, 18, 0.1), 0 2px 4px -2px rgba(10, 13, 18, 0.06)',
        lg: '0 12px 16px -4px rgba(10, 13, 18, 0.08), 0 4px 6px -2px rgba(10, 13, 18, 0.03)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
