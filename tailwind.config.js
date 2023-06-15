/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx}", "./src/ui/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      minHeight: {
        screen: ["100vh", "100dvh"],
      },
      height: {
        screen: ["100vh", "100dvh"],
      },
      animation: {
        "gradient-text": "gradient-text 5s ease infinite",
      },
      keyframes: {
        "gradient-text": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
    },
    fontFamily: {
      sans: ["var(--font-nunito)", "sans-serif"],
      display: ["var(--font-staatliches)", "sans-serif"],
    },
    fontSize: {
      "h1-desktop": [
        "6rem",
        {
          lineHeight: "7.5rem",
          letterSpacing: "0",
        },
      ],
      "h1-mobile": [
        "3.5rem",
        {
          lineHeight: "4rem",
          letterSpacing: "0",
        },
      ],
      "h3-desktop": [
        "3.5rem",
        {
          lineHeight: "4rem",
          letterSpacing: "0",
        },
      ],
      "h3-mobile": [
        "2rem",
        {
          lineHeight: "2.5rem",
          letterSpacing: "0",
        },
      ],
      "h5-desktop": [
        "2rem",
        {
          lineHeight: "2.5rem",
          letterSpacing: "0",
        },
      ],
      "h5-mobile": [
        "1.25rem",
        {
          lineHeight: "2rem",
          letterSpacing: "0",
        },
      ],
      "p-desktop": [
        "1.25rem",
        {
          lineHeight: "1.75rem",
          letterSpacing: "0",
        },
      ],
      "p-mobile": [
        "1rem",
        {
          lineHeight: "1.4rem",
          letterSpacing: "0",
        },
      ],
    },
    spacing: {
      0: "0px",
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      5: "20px",
      6: "24px",
      7: "32px",
      8: "40px",
      9: "48px",
      10: "56px",
      11: "64px",
      12: "72px",
      13: "80px",
      14: "88px",
      15: "96px",
      16: "104px",
      17: "112px",
      18: "120px",
      19: "128px",
      20: "136px",
      21: "144px",
    },
  },

  plugins: [],
};
