// Konsolin tulosteet

// Logitus
const info = (...params) => {
  if (process.env.NODE_ENV !== 'test') { 
    console.log(...params)
  }
}

// Virhetilanteet
const error = (...params) => {
  if (process.env.NODE_ENV !== 'test') { 
    console.error(...params)
  }
}

module.exports = {
  info, error
}