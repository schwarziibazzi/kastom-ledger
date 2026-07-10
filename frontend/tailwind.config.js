/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kastom': {
          'green': '#14532D',
          'green-light': '#15803D',
          'green-bright': '#22C55E',
          'green-bg': '#F0F7F0',
          'cream': '#F8FAF8',
          'dark': '#111827',
          'muted': '#6B7280',
          'border': '#E5E7EB',
          'success': '#16A34A',
          'danger': '#DC2626',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'premium': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'premium-lg': '0 4px 24px 0 rgba(0, 0, 0, 0.06), 0 2px 8px 0 rgba(0, 0, 0, 0.03)',
        'premium-xl': '0 8px 40px 0 rgba(0, 0, 0, 0.08), 0 4px 12px 0 rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}