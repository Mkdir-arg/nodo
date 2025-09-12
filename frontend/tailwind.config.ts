import type { Config } from 'tailwindcss';
import flowbite from 'flowbite/plugin';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [flowbite],
};
export default config;
