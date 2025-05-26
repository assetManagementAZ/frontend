/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      backgroundImage: {
        "secondary-gradient":
          "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
      },
    },
  },
  plugins: [],
};
