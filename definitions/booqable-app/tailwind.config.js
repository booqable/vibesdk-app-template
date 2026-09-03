/**
 * Boomerang — Booqable design system (Tailwind v3 port).
 * Palette hex values and scales come from the Figma library
 * "Boomerang: Booqable design system"; semantic colors map to the CSS
 * variables defined in src/index.css (:root). Booqable is light mode only.
 */
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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        bg: 'var(--background)',
        fg: 'var(--foreground)',
        'fg-muted': 'var(--muted-foreground)',
        'fg-subtle': '#9ba6b1',
        surface: 'var(--card)',
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        primary: { DEFAULT: 'var(--primary)', hover: 'var(--primary-hover)', foreground: 'var(--primary-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        destructive: {
          DEFAULT: 'var(--destructive)', hover: 'var(--destructive-hover)',
          foreground: 'var(--destructive-foreground)', subtle: 'var(--destructive-subtle)',
        },
        success: { DEFAULT: 'var(--success)', foreground: 'var(--success-foreground)', subtle: 'var(--success-subtle)' },
        warning: { DEFAULT: 'var(--warning)', foreground: 'var(--warning-foreground)', subtle: 'var(--warning-subtle)' },
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        link: 'var(--link)',
        chart: {
          1: 'var(--chart-1)', 2: 'var(--chart-2)', 3: 'var(--chart-3)',
          4: 'var(--chart-4)', 5: 'var(--chart-5)',
        },
      },
      /* Radii — Figma: 8 (controls), 12 (cards), 20 (sections) */
      borderRadius: {
        sm: '6px', md: '8px', lg: '8px', xl: '12px', '2xl': '16px', '3xl': '20px',
      },
      /* Type scale — Proxima Nova specimen from Figma (Mulish fallback) */
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '5.625rem', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '4.5rem', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '3.75rem', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.02em' }],
        'display-sm': ['1.875rem', { lineHeight: '2.375rem' }],
        'display-xs': ['1.5rem', { lineHeight: '2rem' }],
        xl: ['1.25rem', { lineHeight: '1.875rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        md: ['1rem', { lineHeight: '1.5rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
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
