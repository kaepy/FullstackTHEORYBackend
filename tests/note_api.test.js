const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Note = require('../models/note')

// npm test -- tests/note_api.test.js
// npm test -- -t 'a specific note is within the returned notes'
// npm test -- -t 'notes'

// superagent-olio mahdollistaa testien HTTP-pyynnöt backendille
// "if the server is not already listening for connections then it is bound to an ephemeral port for you so there is no need to keep track of ports.""
const api = supertest(app)

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
]

// alustetaan tietokanta ennen jokaisen testin suoritusta
beforeEach(async () => {
  await Note.deleteMany({})
  let noteObject = new Note(initialNotes[0])
  await noteObject.save()
  noteObject = new Note(initialNotes[1])
  await noteObject.save()
})

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/) // regex mahdollistaa että headeri voi sisältää muutakin tekstiä eikä tyyppiä tarvitse määrittää pilkulleen oikein
})

/*
test('there are two notes', async () => {
  const response = await api.get('/api/notes')

  // tänne tullaan vasta kun edellinen komento eli HTTP-pyyntö on suoritettu
  // muuttujassa response on nyt HTTP-pyynnön tulos
  expect(response.body).toHaveLength(2)
})

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes')

  expect(response.body[0].content).toBe('HTML is easy')
})
*/

test('all notes are returned', async () => {
  const response = await api.get('/api/notes')

  expect(response.body).toHaveLength(initialNotes.length)
})

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes')

  // muodostetaan taulukko API:n palauttamien muistiinpanojen sisällöistä
  const contents = response.body.map(r => r.content)

  // tarkistetaan, että parametrina oleva muistiinpano on kaikkien API:n palauttamien muistiinpanojen joukossa
  expect(contents).toContain(
    'Browser can execute only JavaScript'
  )
})

afterAll(async () => {
  await mongoose.connection.close()
})