// Osa 3b - Sovellus Internettiin
// Frontendin deployauksen suoraviivaistus

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


// express funktio, jota kutsumalla luodaan muuttujaan app sijoitettava Express-sovellusta vastaava olio
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

// Middlewareja voi olla käytössä useita, jolloin ne suoritetaan peräkkäin siinä järjestyksessä, kuin ne on otettu koodissa käyttöön.
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


const password = process.argv[2]
const url =
  `mongodb+srv://fullstack:${password}@cluster0.cwjgrzg.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

// Eräs tapa muotoilla Mongoosen palauttamat oliot haluttuun muotoon on muokata kannasta haettavilla olioilla olevan toJSON-metodin palauttamaa muotoa.
// Vaikka Mongoose-olioiden kenttä _id näyttääkin merkkijonolta, se on todellisuudessa olio. Määrittelemämme metodi toJSON muuttaa sen merkkijonoksi kaiken varalta. Jos emme tekisi muutosta, siitä aiheutuisi ylimääräistä harmia testien yhteydessä.
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Note = mongoose.model('Note', noteSchema)

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2022-01-10T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2022-01-10T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2022-01-10T19:20:14.298Z",
    important: true
  }
]

/*
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})
*/

// Palautetaan HTTP-pyynnön vastauksena toJSON-metodin avulla muotoiltuja oliota
// Nyt siis muuttujassa notes on taulukollinen MongoDB:n palauttamia olioita. Kun taulukko lähetetään JSON-muotoisena vastauksena, jokaisen taulukon olion toJSON-metodia kutsutaan automaattisesti JSON.stringify-metodin toimesta.
app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes', (req, res) => {
  res.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  console.log(id)

  const note = notes.find(note => {
    // tiiviissä muodossa oleva funktio note => note.id === id kirjoitetaan eksplisiittisen returnin sisältävässä muodossa
    console.log(note.id, typeof note.id, id, typeof id, note.id === id)
    return note.id === id
  })
  console.log(note)


  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})

// Json-parserin toimintaperiaatteena on, että se ottaa pyynnön mukana olevan JSON-muotoisen datan, muuttaa sen JavaScript-olioksi ja sijoittaa request-olion kenttään body ennen kuin routen käsittelijää kutsutaan.
// Ilman json-parserin lisäämistä eli komentoa app.use(express.json()) pyynnön kentän body arvo olisi ollut määrittelemätön.

/*
app.post('/api/notes', (request, response) => {
  console.log(request.headers)

  // selvitetään olemassa olevista id:istä suurin muuttujan maxId
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0

  const note = request.body
  console.log(note)
  note.id = maxId + 1

  notes = notes.concat(note)

  response.json(note)
})
*/

// Parannellaan sovellusta siten, että kenttä content ei saa olla tyhjä. Kentille important ja date asetetaan oletusarvot. Kaikki muut kentät hylätään
// notes.map(n => n.id) muodostaa taulukon, joka koostuu muistiinpanojen id-kentistä. Math.max palauttaa maksimin sille parametrina annetuista luvuista. notes.map(n => n.id) on kuitenkin taulukko, joten se ei kelpaa parametriksi komennolle Math.max. Taulukko voidaan muuttaa yksittäisiksi luvuiksi käyttäen taulukon spread-syntaksia, eli kolmea pistettä ...taulukko.
// Spread syntax: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  const body = request.body

  // Ilman returnin-kutsua koodi jatkaisi suoritusta metodin loppuun asti, ja virheellinen muistiinpano tallettuisi
  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = {
    content: body.content,
    // Kentän important arvon ollessa false, tulee lausekkeen body.important || false arvoksi oikean puoleinen false
    // || = OR
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  }

  notes = notes.concat(note)

  response.json(note)
})

// Esimerkki tapauksesta jossa middreware otetaan käyttöön vasta routejen jälkeen ja tällöin on kyse middlewareista, joita suoritetaan vain, jos mikään route ei käsittele HTTP-pyyntöä.

// saadaan routejen käsittelemättömistä virhetilanteista JSON-muotoinen virheilmoitus
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})