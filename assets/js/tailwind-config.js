tailwind.config = {
    theme: {
        extend: {
            screens: {
                'md': '600px',
                'lg': '1280px',
                'xl': '1600px',
            },
            fontFamily: { mono: ['"JetBrains Mono"', 'monospace'] },
            colors: {
                white: '#e2e2e2',
                base: '#0c0c0c',
                card: '#121212',
                border: '#2a2a2a',
                textMuted: '#888888',
            },
            gridTemplateRows: {
                'desktop': '3fr 2fr',
                'tablet': '3fr 2fr',
            },
            animation: {
                'scroll-y': 'scrollY 30s linear infinite',
                'scroll-y-reverse': 'scrollYReverse 30s linear infinite',
                'scroll-x': 'scrollX 42s linear infinite',
            },
            keyframes: {
                scrollY: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-50%)' } },
                scrollYReverse: { '0%': { transform: 'translateY(-50%)' }, '100%': { transform: 'translateY(0)' } },
                scrollX: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } }
            }
        }
    }
};