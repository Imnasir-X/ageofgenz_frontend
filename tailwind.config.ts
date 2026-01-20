import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add the fontFamily extension here
      fontFamily: {
        // Define 'inknut' utility class, map it to the font name from Google Fonts
        // Include fallback fonts like 'serif'
        inknut: ['"Inknut Antiqua"', ...defaultTheme.fontFamily.serif],
      },
      // You might still have other extensions here (colors, etc.)
    },
  },
  plugins: [],
  
};

export default config;