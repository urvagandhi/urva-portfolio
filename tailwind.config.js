/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/vendor/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mont: ["var(--font-mont)", ...fontFamily.sans],
      },
      colors: {
        dark: "#0a0a0a",
        light: "#f5f5f5",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        primaryDark: "#58E6D9",
        darkBg: "#050505",
        darkAccent: "#0d0d14",
        darkDeep: "#090d18",
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
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(88, 230, 217, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(88, 230, 217, 0.6)",
          },
        },
      },
      backgroundImage: {
        circularLight:
          "radial-gradient(rgba(0,0,0,0.4) 2px, transparent 2px), radial-gradient(#f5f5f5 5px, transparent 5px), repeating-radial-gradient(rgba(0,0,0,0.4) 2px, #f5f5f5 5px, #f5f5f5 100px);",
        circularDark:
          "repeating-radial-gradient(rgba(255, 255, 255, 0.35) 2px, transparent 3px, transparent 100px);",
        circularLightLg:
          "radial-gradient(rgba(0,0,0,0.4) 2px, transparent 2px), radial-gradient(#f5f5f5 5px, transparent 5px), repeating-radial-gradient(rgba(0,0,0,0.4) 2px, #f5f5f5 5px, #f5f5f5 80px);",
        circularDarkLg:
          "repeating-radial-gradient(rgba(255, 255, 255, 0.35) 2px, transparent 3px, transparent 80px);",
        circularLightMd:
          "radial-gradient(rgba(0,0,0,0.4) 2px, transparent 2px), radial-gradient(#f5f5f5 5px, transparent 5px), repeating-radial-gradient(rgba(0,0,0,0.4) 2px, #f5f5f5 5px, #f5f5f5 60px);",
        circularDarkMd:
          "repeating-radial-gradient(rgba(255, 255, 255, 0.35) 2px, transparent 3px, transparent 60px);",
        circularLightSm:
          "radial-gradient(rgba(0,0,0,0.4) 2px, transparent 2px), radial-gradient(#f5f5f5 5px, transparent 5px), repeating-radial-gradient(rgba(0,0,0,0.4) 2px, #f5f5f5 5px, #f5f5f5 40px);",
        circularDarkSm:
          "repeating-radial-gradient(rgba(255, 255, 255, 0.35) 2px, transparent 3px, transparent 40px);",
      },
      boxShadow: {
        "3xl": "0 15px 15px 1px rgba(80,230,217, 0.4)",
        "dark-glow": "0 0 25px rgba(88, 230, 217, 0.2)",
        "dark-glow-hover": "0 0 40px rgba(88, 230, 217, 0.4)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
    screens: {
      "2xl": {
        max: "1535px",
      },
      xl: {
        max: "1279px",
      },
      lg: {
        max: "1023px",
      },
      md: {
        max: "767px",
      },
      sm: {
        max: "639px",
      },
      xs: {
        max: "479px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
