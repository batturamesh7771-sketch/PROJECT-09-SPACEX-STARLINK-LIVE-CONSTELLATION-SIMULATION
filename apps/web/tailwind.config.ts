import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#050a1f',
        'nebula-purple': '#5d2b7d',
        'star-white': '#f8f9fa',
        'satellite-cyan': '#00d4ff',
        'warning-amber': '#ffcc00',
        'danger-red': '#ff4444',
      },
    },
  },
  plugins: [],
};
export default config;
