/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // iOS System Colors - Light
        'accent-blue': '#0A84FF',
        'accent-cyan': '#64D2FF',
        'accent-green': '#30D158',
        'accent-orange': '#FF9F0A',
        'accent-purple': '#BF5AF2',
        'accent-red': '#FF453A',
        'accent-gold': '#FFD60A',
        // Semantic colors using CSS variables
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'bg-elevated': 'var(--bg-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'border-light': 'var(--border-light)',
        'border-subtle': 'var(--border-subtle)',
        'action': 'var(--action-color)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      borderRadius: {
        'iphone': '54px',
        'glass': '32px',
      },
      backdropBlur: {
        'glass': '50px',
      },
      transitionTimingFunction: {
        'fluid': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'ios': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        'card': 'var(--shadow-md)',
        'elevated': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}
