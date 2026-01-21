/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // iOS System Colors (identiques au Web)
                'accent-blue': '#0A84FF',
                'accent-cyan': '#64D2FF',
                'accent-green': '#30D158',
                'accent-orange': '#FF9F0A',
                'accent-purple': '#BF5AF2',
                'accent-red': '#FF453A',
                'accent-gold': '#FFD60A',
                // Semantic colors
                'bg-primary': '#FAFAF8',
                'bg-secondary': '#F2F2F7',
                'bg-card': '#FFFFFF',
                'text-primary': '#1C1C1E',
                'text-secondary': '#8E8E93',
                'text-tertiary': '#AEAEB2',
                'border-light': '#E5E5EA',
            },
            fontFamily: {
                sans: ['System'],
            },
        },
    },
    plugins: [],
};
