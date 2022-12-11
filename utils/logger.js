// Konsolin tulosteet

// Logitus
const info = (...params) => {
  console.log(...params)
}

// Virhetilanteet
const error = (...params) => {
  console.error(...params)
}

module.exports = {
  info, error
}