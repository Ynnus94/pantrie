/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius, 1rem)",
        md: "calc(var(--radius, 1rem) - 2px)",
        sm: "calc(var(--radius, 1rem) - 4px)",
      },
      colors: {
        // Theme-aware colors via CSS variables
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
          DEFAULT: "var(--text-primary)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "var(--text-secondary)",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "var(--text-muted)",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          light: 'var(--accent-primary)',
          DEFAULT: 'var(--accent-hover)',
          dark: 'var(--accent-active)',
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "var(--border-subtle)",
        input: "var(--border-subtle)",
        ring: "var(--accent-primary)",
        
        // Glass colors
        glass: {
          light: 'var(--bg-glass-light)',
          DEFAULT: 'var(--bg-glass)',
          strong: 'var(--bg-glass-strong)',
        },
        
        // Legacy honey colors - maps to accent
        honey: {
          light: 'var(--accent-primary)',
          DEFAULT: 'var(--accent-hover)',
          dark: 'var(--accent-active)',
        },
        
        // Text colors
        'warm-text': {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
      },
      boxShadow: {
        'glass': 'var(--shadow-glass)',
        'glass-hover': 'var(--shadow-hover)',
        'glass-lg': 'var(--shadow-lg)',
        'accent': 'var(--shadow-accent)',
        'accent-hover': 'var(--shadow-accent-hover)',
      },
      backgroundImage: {
        'minimal-gradient': 'linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%)',
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
