const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username }) // etsitään pyynnön mukana olevaa usernamea vastaava käyttäjä tietokannasta
  // tarkistetaan onko password oikein vertailemassa salasanaa hashiin
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  // salasana on väärin
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  // salasana on oikein: luodaan token joka sisältää digitaalisesti allekirjoitetussa muodossa usernamen ja käyttäjän id:n
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // Token on digitaalisesti allekirjoitettu käyttämällä salaisuutena ympäristömuuttujassa SECRET olevaa merkkijonoa. Digitaalinen allekirjoitus varmistaa sen, että ainoastaan salaisuuden tuntevilla on mahdollisuus generoida validi token. Ympäristömuuttujalle pitää muistaa asettaa arvo tiedostoon .env.
  const token = jwt.sign(userForToken, process.env.SECRET)

  // Onnistuneeseen pyyntöön vastataan statuskoodilla 200 ok ja generoitu token sekä kirjautuneen käyttäjän käyttäjätunnus ja nimi lähetetään vastauksen bodyssä pyynnön tekijälle.
  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter