// käyttäjienhallinnan router

const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  //const users = await User.find({})

  // Funktion populate kutsu siis ketjutetaan kyselyä vastaavan metodikutsun (tässä tapauksessa find) perään. Populaten parametri määrittelee, että user-dokumenttien notes-kentässä olevat note-olioihin viittaavat id:t korvataan niitä vastaavilla dokumenteilla.
  const users = await User
    //.find({}).populate('notes') // näyttää kaiken
    .find({}).populate('notes', { content: 1, important: 1 }) // näyttää vain valitut

  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  // save() on mongoosen save, kun user objekti on mongoosen User tyyppisiä objekteja. Save kutsuu mongoose-olion savea että "tallenna mut sinne mihin minä kuulun" (skeemassa on että mihin se kuuluu), awaittaat sitä koska se on asynkroninen operaatio ku se lähtee kantaan asti ja palaa sieltä sit "joskus".
  // Eli tavallaan vähän lähellä sitä kun tekee requestin frontin puolelta, mut sensijaan että tekee "käsin" http requestin bäkkäriin axioksella tms ja awaittaat sen vastausta, niin teet tolla mongoosen save "helpperifunktiolla" (ettei tarvi ite kirjottaa insert into blabla jne) kantaqueryn mongooseen ja awaittaat sen vastausta (tässä tapauksessa se objekti tallennuksen jälkeisenä)
  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter