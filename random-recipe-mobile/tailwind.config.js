/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all component files.
  content: [
    //'./app/**/*.{js,jsx,ts,tsx}', // If using Expo Router (default in new templates)
    //'./components/**/*.{js,jsx,ts,tsx}', // Common components folder
    // Add other paths if needed, e.g., "./screens/**/*.{js,jsx,ts,tsx}"
    './App.{js,jsx,ts,tsx}', // Include the root App component
    './src/**/*.{js,jsx,ts,tsx}', // Include everything inside a potential 'src' folder
  ],
  presets: [require('nativewind/preset')], // Add NativeWind preset
  theme: {
    extend: {},
  },
  plugins: [],
}
