/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          light: '#D4A574',
          DEFAULT: '#C19A6B',
          dark: '#A67C52',
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        
        // Glass colors for Tailwind utilities
        glass: {
          light: 'rgba(255, 255, 255, 0.6)',
          DEFAULT: 'rgba(255, 255, 255, 0.7)',
          strong: 'rgba(255, 255, 255, 0.8)',
        },
        
        // Muted gold accent (replaces honey)
        honey: {
          light: '#D4A574',
          DEFAULT: '#C19A6B',
          dark: '#A67C52',
        },
        
        // Warm text colors (dark for light bg)
        'warm-text': {
          primary: '#1a1a1a',
          secondary: '#4a4a4a',
          muted: '#737373',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'glass-hover': '0 12px 48px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 1)',
        'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 1)',
        'accent': '0 4px 16px rgba(212, 165, 116, 0.25)',
        'accent-hover': '0 6px 24px rgba(212, 165, 116, 0.35)',
      },
      backgroundImage: {
        'minimal-gradient': 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 25%, #f0f0f0 50%, #ebebeb 75%, #e8e8e8 100%)',
      },
      backdropBlur: {
        xs: '2px',
        glass: '20px',
        strong: '24px',
      },
    },
  },
  plugins: [],
}
