import type { Config } from 'tailwindcss';
import flowbite from 'flowbite/plugin';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  safelist: [
    // Clases de grilla dinámicas para el form builder
    { pattern: /col-span-(1|2|3|4|5|6|7|8|9|10|11|12)/ },
    ...Array.from({length: 12}, (_, i) => `col-span-${i + 1}`),
  ],
  theme: { 
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          pink: "#FF0080",
          purple: "#7928CA",
          gradient: "linear-gradient(135deg, #FF0080 0%, #7928CA 100%)",
          DEFAULT: "#FF0080",
          foreground: "#FFFFFF",
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
        nodo: {
          purple: { dark: "#8908cc", DEFAULT: "#7928CA" },
          cyan: "#08b8cc",
          magenta: "#cc0884",
          title: "#252F40",
          legajo: { name: "#141414", subtitle: "#8C8C8C" },
          text: "#4A5565",
          icon: "#56606A",
          dropdown: "#101828",
          border: "#E5E7EB",
          white: "#FFFFFF",
        },
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #FF0080 0%, #7928CA 100%)",
      },
      boxShadow: {
        'nodo': '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
      },
      gridTemplateColumns: {
        "legajos-7": "repeat(6, 243px)",
      },
    }
  },
  plugins: [flowbite],
};
export default config;
