const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.cwjgrzg.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

/* Muistiinpanon luonti
const note = new Note({
  content: 'HTML is Easy',
  date: new Date(),
  important: true,
})


note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})
*/

// Muistiinpanon hakeminen
// Esimerkki: Note.find({ important: true }).then(result => {
Note.find({}).then(result => {
  result.forEach(note => { console.log(note) })
  mongoose.connection.close()
})