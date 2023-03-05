const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

// superagent-olio mahdollistaa testien HTTP-pyynnöt backendille
// "if the server is not already listening for connections then it is bound to an ephemeral port for you so there is no need to keep track of ports.""
const api = supertest(app)

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/) // regex mahdollistaa että headeri voi sisältää muutakin tekstiä eikä tyyppiä tarvitse määrittää pilkulleen oikein
})

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

afterAll(async () => {
  await mongoose.connection.close()
})