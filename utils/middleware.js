const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

// Routejen käsittelemättömien virhetilanteiden virheilmoitus
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// Virheenkäsittelijä tarkastaa, onko kyse CastError-poikkeuksesta eli virheellisestä olio-id:stä. Jos on, käsittelijä lähettää pyynnön tehneelle selaimelle vastauksen käsittelijän parametrina olevan response-olion avulla. Muussa tapauksessa se siirtää funktiolla next virheen käsittelyn Expressin oletusarvoisen virheidenkäsittelijän hoidettavaksi.
const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name ===  'JsonWebTokenError') {
    // Jos tokenia ei ole tai se on epävalidi, syntyy poikkeus JsonWebTokenError.
    return response.status(400).json({ error: 'token missing or invalid' })
  } else if (error.name === 'TokenExpiredError') {
    // virheilmoitus vanhentuneen tokenin tapauksessa
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error)
}

// Jos sovelluksessa on useampia rajapintoja jotka vaativat kirjautumisen, kannattaa JWT:n validointi eriyttää omaksi middlewarekseen, tai käyttää jotain jo olemassa olevaa kirjastoa kuten express-jwt

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}
