/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
     colors: {
  brand: {
    blue: "#1e40af",        // כחול כהה
    blueLight: "#0ea5e9",   // כחול בהיר
    gradientStart: "#1e40af",
    gradientEnd: "#0ea5e9",
    whiteHeader: "#ffffff",
    grayLight:"#f3f4f6", 
     lightGray: "#fcfcfc",
  },
  text: {
    dark: "#374151",        // טקסט כהה
    gray: "#4b5563",         // טקסט אפור
    grayLight:"#f3f4f6"                  // טקסט אפור כהה
  },
},
    },
  },
  plugins: [],
}