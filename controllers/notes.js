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
const User = require('../models/user')

const jwt = require('jsonwebtoken')

// Tiedosto eksporttaa moduulin käyttäjille määritellyn routerin.
//Kaikki määriteltävät routet liitetään router-olioon, samaan tapaan kuin aiemmassa versiossa routet liitettiin sovellusta edustavaan olioon.
// Huomaa typistetyt polut routeissa!
// Router on siis middleware, jonka avulla on mahdollista määritellä joukko "toisiinsa liittyviä" routeja yhdessä paikassa, yleensä omassa moduulissaan.

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

// Kaikkien muistiinpanojen näyttäminen async funktion avulla
notesRouter.get('/', async (request, response) => {
  //Note.find({}).then(notes => {
  //  response.json(notes)
  //})

  // käyttäjän tietojen populointi
  const notes = await Note
    .find({}).populate('user', { username: 1, name: 1 })

  response.json(notes)
})

// Muistiinpanon luominen
notesRouter.post('/', async (request, response) => {
  const body = request.body

  // Apufunktio getTokenFrom eristää tokenin headerista authorization. Tokenin oikeellisuus varmistetaan metodilla jwt.verify. Metodi myös dekoodaa tokenin, eli palauttaa olion, jonka perusteella token on laadittu. Tokenista dekoodatun olion sisällä on kentät username ja id eli se kertoo palvelimelle kuka pyynnön on tehnyt.
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)

  // Jos token on muuten kunnossa, mutta tokenista dekoodattu olio ei sisällä käyttäjän identiteettiä (eli decodedToken.id ei ole määritelty), palautetaan virheestä kertova statuskoodi 401 unauthorized ja kerrotaan syy vastauksen bodyssä
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  // Kun pyynnön tekijän identiteetti on selvillä, jatkuu suoritus entiseen tapaan.

  // const user = await User.findById(body.userId)
  const user = await User.findById(decodedToken.id)

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id
  })

  const savedNote = await note.save()

  // userin noteihin lisätään vaan uus id, mutta se tehään concatilla koska se luo uuden arrayn sen concatenoinnin tuloksesta jolloin se ei peukaloi sitä alkuperästä user.notes arraytä, mikä kävis jos tässä käytettäs sitä .push()
  // concat funktio luo/palauttaa arrayn, eikä muokkaa mitään niiku push tekee
  // Sama avattuna 1:
  // const uudetNotet = [] // luodaan uusi tyhjä array noteille
  // uudetNotet.push(...user.notes) // lisätään aluperäset notet
  // uudetNotet.push(savedNote._id); // lisätään uusi note
  // user.notes = uudetNotet; // laitetaan uudet notet userille
  // Sama avattuna 2:
  // const uudetNotet = user.notes.concat(savedNote._id)
  // user.notes = uudetNotet
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

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