//  EXPORT ESIMERKKI 1:
// Exportataan ainoastaan yksi "asia" (tässä tilanteessa router-olio) sijoitetaan muuttujaan ja käytetään sitä sellaisenaan,...*
const notesRouter = require('express').Router()
// app.use('/api/notes', notesRouter)

/* EXPORT ESIMERKKI 2:
// Otetaan käyttöön koko eksportoitava olio, jolloin funktioihin viitataan olion kautta
const logger = require('./utils/logger')

logger.info('message')

logger.error('error message')
*/

/* EXPORT ESIMERKKI 2:
// destrukturoida funktiot omiin muuttujiin require-kutsun yhteydessä
const { info, error } = require('./utils/logger')

info('message')
error('error message')
*/

const Note = require('../models/note')

// Tiedosto eksporttaa moduulin käyttäjille määritellyn routerin.
//Kaikki määriteltävät routet liitetään router-olioon, samaan tapaan kuin aiemmassa versiossa routet liitettiin sovellusta edustavaan olioon.
// Huomaa typistetyt polut routeissa!
// Router on siis middleware, jonka avulla on mahdollista määritellä joukko "toisiinsa liittyviä" routeja yhdessä paikassa, yleensä omassa moduulissaan.

// Kaikkien muistiinpanojen näyttäminen async funktion avulla
notesRouter.get('/', async(request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

// Muistiinpanon luominen
notesRouter.post('/', async (request, response) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  const savedNote = await note.save()
  response.status(201).json(savedNote)
})

// Yksittäisen muistiinpanon näyttäminen
notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

//Muistiinpanon poistaminen
notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

// Muistiinpanon muokkaaminen
notesRouter.put('/:id', (request, response, next) => {
  //const { content, important } = request.body -> korvais const bodyn ja const noten
  // findByIdAndUpdate parametrin note vois tällön korvata -> { content, important }

  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  // Miksi tätä ei tarvita enää? { new: true, runValidators: true, context: 'query' }
  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

// EXPORT ESIMERKKI 1 liittyvää...
module.exports = notesRouter