const mongoose = require('mongoose')

// Tietokannan tasolla ei siis ole mitään määrittelyä sille, että esim. muistiinpanojen kenttään user talletetut id:t viittaavat users-kokoelman dokumentteihin.
// Mongoosen populate-funktion toiminnallisuus perustuu siihen, että olemme määritelleet viitteiden "tyypit" olioiden Mongoose-skeemaan ref-kentän avulla
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minlength: 5,
    required: true
  },
  date: Date,
  important: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema)