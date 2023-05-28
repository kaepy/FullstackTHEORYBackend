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
  //const token = jwt.sign(userForToken, process.env.SECRET)

  // token expires in 60*60 seconds, that is, in one hour
  // Kun tokenin voimassaoloaika päättyy, on asiakassovelluksen hankittava uusi token esim. pakottamalla käyttäjä kirjaantumaan uudelleen sovellukseen.
  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60*60 }
  )

  // Mitä lyhemmäksi tokenin voimassaolo asetetaan, sitä turvallisempi ratkaisu on. Eli jos token päätyy vääriin käsiin, tai käyttäjän pääsy järjestelmään tulee estää, on token käytettävissä ainoastaan rajallisen ajan. Toisaalta tokenin lyhyt voimassaolo aiheuttaa vaivaa API:n käyttäjälle. Kirjaantuminen pitää tehdä useammin.
  // Toinen ratkaisu on tallettaa API:ssa tietokantaan tieto jokaisesta asiakkaalle myönnetystä tokenista, ja tarkastaa jokaisen API-pyynnön yhteydessä onko käyttöoikeus edelleen voimassa. Tällöin tokenin voimassaolo voidaan tarvittaessa poistaa välittömästi. Tällaista ratkaisua kutsutaan usein palvelinpuolen sessioksi (engl. server side session).
  // Tämän ratkaisun negatiivinen puoli on sen backendiin lisäämä monimutkaisuus sekä hienoinen vaikutus suorituskykyyn. Jos tokenin voimassaolo joudutaan tarkastamaan tietokannasta, on se hitaampaa kuin tokenista itsestään tarkastettava voimassaolo. Usein tokeneita vastaava sessio, eli tieto tokenia vastaavasta käyttäjästä, talletetaankin esim. avain-arvo-periaattella toimivaan Redis-tietokantaan, joka on toiminnallisuudeltaan esim MongoDB:tä tai relaatiotietokantoja rajoittuneempi, mutta toimii tietynlaisissa käyttöskenaarioissa todella nopeasti.
  // Käytettäessä palvelinpuolen sessioita, token ei useinkaan sisällä jwt-tokenien tapaan mitään tietoa käyttäjästä (esim. käyttäjätunnusta), sen sijaan token on ainoastaan satunnainen merkkijono, jota vastaava käyttäjä haetaan palvelimella sessiot tallettavasta tietokannasta. On myös yleistä, että palvelinpuolen sessiota käytettäessä tieto käyttäjän identiteetistä välitetään Authorization-headerin sijaan evästeiden (engl. cookie) välityksellä.

  // Käyttäjätunnuksia, salasanoja ja tokenautentikaatiota hyödyntäviä sovelluksia tulee aina käyttää salatun HTTPS-yhteyden yli. Voimme käyttää sovelluksissamme Noden HTTP-serverin sijaan HTTPS-serveriä (se vaatii lisää konfiguraatiota). Toisaalta koska sovelluksemme tuotantoversio on Herokussa, sovelluksemme pysyy käyttäjien kannalta suojattuna sen ansiosta, että Heroku reitittää kaiken liikenteen selaimen ja Herokun palvelimien välillä HTTPS:n yli.

  // Onnistuneeseen pyyntöön vastataan statuskoodilla 200 ok ja generoitu token sekä kirjautuneen käyttäjän käyttäjätunnus ja nimi lähetetään vastauksen bodyssä pyynnön tekijälle.
  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter