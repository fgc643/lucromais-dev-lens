import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          glow: "hsl(var(--success-glow))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        profit: {
          DEFAULT: "hsl(var(--profit))",
          bright: "hsl(var(--profit-bright))",
          glow: "hsl(var(--profit-glow))",
        },
        loss: {
          DEFAULT: "hsl(var(--loss))",
          bright: "hsl(var(--loss-bright))",
          glow: "hsl(var(--loss-glow))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        gold: {
          50: "hsl(48 100% 90%)",
          100: "hsl(48 100% 80%)",
          200: "hsl(45 100% 70%)",
          300: "hsl(42 100% 60%)",
          400: "hsl(42 100% 55%)",
          500: "hsl(42 100% 50%)",
          600: "hsl(38 95% 45%)",
          700: "hsl(35 90% 40%)",
          800: "hsl(32 85% 35%)",
          900: "hsl(28 80% 25%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      boxShadow: {
        'gold': '0 10px 50px -10px hsl(42 100% 50% / 0.5), 0 0 100px hsl(42 100% 50% / 0.2)',
        'gold-intense': '0 20px 60px -10px hsl(42 100% 50% / 0.6), 0 0 120px hsl(42 100% 50% / 0.3)',
        'profit': '0 15px 50px -10px hsl(145 85% 45% / 0.6), 0 0 80px hsl(145 85% 50% / 0.3)',
        'loss': '0 15px 50px -10px hsl(0 90% 55% / 0.6), 0 0 80px hsl(0 90% 60% / 0.3)',
        '3d': '0 25px 80px -20px rgba(0, 0, 0, 0.8), 0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'elevated': '0 30px 100px -30px rgba(0, 0, 0, 0.9), 0 15px 40px -15px rgba(0, 0, 0, 0.6)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-gold": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(42 100% 50% / 0.4), 0 0 40px hsl(42 100% 50% / 0.2)" 
          },
          "50%": { 
            boxShadow: "0 0 40px hsl(42 100% 50% / 0.6), 0 0 80px hsl(42 100% 50% / 0.4)" 
          },
        },
        "float-3d": {
          "0%, 100%": { transform: "translateY(0) rotateX(0)" },
          "50%": { transform: "translateY(-10px) rotateX(2deg)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "text-shine": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "profit-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 30px hsl(145 85% 45% / 0.5), 0 0 60px hsl(145 85% 50% / 0.3)",
            transform: "scale(1)"
          },
          "50%": { 
            boxShadow: "0 0 50px hsl(145 85% 45% / 0.7), 0 0 100px hsl(145 85% 50% / 0.5)",
            transform: "scale(1.02)"
          },
        },
        "loss-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 30px hsl(0 90% 55% / 0.5), 0 0 60px hsl(0 90% 60% / 0.3)",
            transform: "scale(1)"
          },
          "50%": { 
            boxShadow: "0 0 50px hsl(0 90% 55% / 0.7), 0 0 100px hsl(0 90% 60% / 0.5)",
            transform: "scale(1.02)"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "shimmer": "shimmer 2s infinite",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "float-3d": "float-3d 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "text-shine": "text-shine 3s linear infinite",
        "profit-pulse": "profit-pulse 3s ease-in-out infinite",
        "loss-pulse": "loss-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
