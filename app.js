// Sovelluslogiikan määrittelyt

const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const notesRouter = require('./controllers/notes')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

// Mahdollistaa routerin lyhyet polut
// Export esimerkki 1 *..., joten mahdollisia käyttötapoja on vain yksi
app.use('/api/notes', notesRouter)

// Olemattomien osoitteiden käsittely
app.use(middleware.unknownEndpoint)

// tämä tulee aina viimeisenä muiden middlewarejen rekisteröinnin jälkeen!
app.use(middleware.errorHandler)

module.exports = app