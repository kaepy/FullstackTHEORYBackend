// Osa 3d - Validointi ja ESLint
// Lint -
// JavaScript-maailmassa tämän hetken johtava työkalu staattiseen analyysiin eli "linttaukseen" on ESLint

// node index.js -> suorittaa tiedoston
// npm start -> "start": "node index.js",
// npm install express -> asentaa transitiivisen riippuvuuden "Express" node_modules kansioon
// npm update -> päivittää riippuvuudet
// npm install -> hakee ajantasaiset package.json määrittelyn kanssa yhteensopivat riippuvuudet
// node -> interaktiivinen node-repl komentojen kokeluun konsolissa
// npm install --save-dev nodemon -> asennetaan kehityksenaikaiseksi riippuvuudeksi, ei globaaliksi
// node_modules/.bin/nodemon index.js -> sovelluksen käynnistys
// npm run dev -> npm scripti sovelluksen käynnistämiseen nodemonilla. Poiketen start ja test scripteistä tarvitaan myös run komento.
// npm install cors -> Cross-origin resource sharing
// npm run build -> luo tuotanto buildin react sovelluksest
// cp -r build ../../FullstackTHEORYBackend -> luo kopion buildista backendin alle
// git push heroku master
// node --inspect index.js -> Chrome DevTools
// node mongo.js <mongo db pwd>
// npm install dotenv -> luo .env & päivitä .gitignore
// MONGODB_URI=<osoite> npm run watch -> manuaalinen tapa, mutta .env parempi käytäntö joka tulee muistaa myös ignorata
// heroku config:set MONGODB_URI='<insert URL>' -> komentoriviltä, mutta parempi tapa asettaa config var herokuun
// npm install eslint --save-dev -> ESLint backendiin kehitysaikaiseksi riippuvuudeksi
// npx eslint --init -> muodostetaan alustava ESLint-konfiguraatio

require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/note')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.static('build'))
app.use(express.json())
app.use(requestLogger)
app.use(cors())

// Kaikkien muistiinpanojen näyttäminen
app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

// Yksittäisen muistiinpanon näyttäminen
app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })

    // Eteenpäin siirrettävä virhe annetaan funktiolle next parametrina. Jos funktiota next kutsuttaisiin ilman parametria, käsittely siirtyisi ainoastaan eteenpäin seuraavaksi määritellylle routelle tai middlewarelle. Jos funktion next kutsussa annetaan parametri, siirtyy käsittely virheidenkäsittelymiddlewarelle.
    .catch(error => { next(error) })
  // console.log(error)
  // response.status(400).send({ error: 'malformatted id' })
})

//Muistiinpanon poistaminen
app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


// Muistiinpanon luominen
app.post('/api/notes', (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
    .catch(error => next(error))
})

// Muistiinpanon tärkeyden muokkaaminen
app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body

  /*
  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
  */

  // Mongoosen sisäänrakennettua validaatiota ei suoriteta oletusarvoisesti metodin findOneAndUpdate suorituksen yhteydessä
  Note.findByIdAndUpdate(request.params.id, { content, important }, { new: true, runValidators: true, context: 'query' })
    .then(updatedNote => { response.json(updatedNote) })
    .catch(error => next(error))
})

// saadaan routejen käsittelemättömistä virhetilanteista JSON-muotoinen virheilmoitus
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

// Virheenkäsittelijä tarkastaa, onko kyse CastError-poikkeuksesta eli virheellisestä olio-id:stä. Jos on, käsittelijä lähettää pyynnön tehneelle selaimelle vastauksen käsittelijän parametrina olevan response-olion avulla. Muussa tapauksessa se siirtää funktiolla next virheen käsittelyn Expressin oletusarvoisen virheidenkäsittelijän hoidettavaksi.
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})