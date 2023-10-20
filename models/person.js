require('dotenv').config()
const mongoose = require('mongoose')
// const validate = require('mongoose-validator').validate

const url = process.env.DB_url

console.log(`connecting to ${url}...`)

mongoose.connect(url)
    .then(() => {
        console.log('Connected!')
    })
    .catch(error => {
        console.log('error connecting to mongoDB: ', error.messege)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        validate: (v) => (/^\d{2,3}-\d+$/.test(v)),
        required: true
    }
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