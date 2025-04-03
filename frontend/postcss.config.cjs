// postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss7-compat': {},  // Usar este plugin en lugar de tailwindcss
    autoprefixer: {},
  },
}
