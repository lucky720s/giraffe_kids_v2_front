/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bank-green': { // Цвета из CoinKeeper (giraffe_kids_kz использует другие, но мы ориентируемся на CoinKeeper для нового дизайна)
                    light: '#6EE7B7',
                    DEFAULT: '#10B981',
                    dark: '#047857',
                },
                'bank-gray': {
                    light: '#F3F4F6',
                    DEFAULT: '#6B7280',
                    dark: '#374151',
                },
                'page-bg': '#E0F2F1', // Фоновый цвет страницы из CoinKeeper
            }
        },
    },
    plugins: [],
}