const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true
  }
]

const initialUsers = [
  {
    username: 'testi',
    name: 'testi testinen',
    password: 'salasala'
  },
]

const nonExistingId = async () => {
  const note = new Note({ content: 'willremovethissoon' })
  await note.save()
  await note.remove()

  return note._id.toString()
}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const testUserToken = async () => {
  const users = await usersInDb()
  //console.log(users)

  const testUser = users[0]
  //console.log('testUser: ', testUser)

  const userForToken = {
    username: testUser.username,
    id: testUser.id,
  }

  // Salasanaa ei tarvita - pelkkä token riittää
  // Epäselvää miksi tämä nyt riittää pelkästään
  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60*60 }
  )

  //console.log('helper token: ', token)

  return token
}

module.exports = {
  initialNotes, initialUsers, testUserToken, nonExistingId, notesInDb, usersInDb,
}