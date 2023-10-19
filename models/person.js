require('dotenv').config()

const mongoose = require('mongoose')

const url = process.env.DB_url

console.log(`connecting to ${url}...`)

mongoose.connect(url)
    .then(result => {
        console.log('Connected!')
    })
    .catch(error => {
        console.log('error connecting to mongoDB: ', error.messege)
    })

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


const Person = mongoose.model('Person', personSchema)

module.exports = Person