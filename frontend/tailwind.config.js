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
          DEFAULT: "#007570",
          hover:   "#008f89",
          light:   "#00B4A9",
          50:      "#f0fdfa",
          100:     "#ccfbf1",
        },
      },
      fontFamily: {
        sans: ["'Poppins'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      height: {
        navbar: "80px",
      },
      maxWidth: {
        navbar: "1280px",
      },
      backdropBlur: {
        navbar: "20px",
      },
      boxShadow: {
        navbar:         "0 1px 0 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.18)",
        "navbar-scroll":"0 2px 32px rgba(0,0,0,0.28)",
        dropdown:       "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
        "user-menu":    "0 16px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)",
        "btn-brand":    "0 4px 14px rgba(0,117,112,0.35)",
        "btn-brand-hover": "0 6px 22px rgba(0,180,169,0.45)",
      },
      keyframes: {
        userMenuIn: {
          "0%":   { opacity: "0", transform: "translateY(10px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        dropdownIn: {
          "0%":   { opacity: "0", transform: "translateX(-50%) translateY(8px)" },
          "100%": { opacity: "1", transform: "translateX(-50%) translateY(0)" },
        },
        slideRight: {
          "0%":   { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%":   { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeCard: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        popIn: {
          "0%":   { opacity: "0", transform: "scale(0.4)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        spin360: {
          "from": { transform: "rotate(0deg)" },
          "to":   { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "user-menu-in": "userMenuIn 0.22s cubic-bezier(0.16,1,0.3,1) both",
        "dropdown-in":  "dropdownIn 0.2s cubic-bezier(0.16,1,0.3,1) both",
        "slide-right":  "slideRight 0.3s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":      "fadeIn 0.2s ease both",
        "slide-up":     "slideUp 0.25s ease both",
        "slide-down":   "slideDown 0.2s ease both",
        "fade-card":    "fadeCard 0.25s ease both",
        "pop-in":       "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "spin-slow":    "spin360 1s linear infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
}
