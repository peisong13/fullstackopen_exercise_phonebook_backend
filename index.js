const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
// app.use(morgan('tiny'))

morgan.token('json', (req, res) => (JSON.stringify(req.body)))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :json'))

app.use(express.static('build'))

let persons = [
    {
      "id": 1,
      "name": "Arto Hellas",
      "number": "040-123456"
    },
    {
      "id": 2,
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": 3,
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    {
      "id": 4,
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
]

const genId = () => {
    return parseInt((Math.random()*1000000000).toString())
}

app.get('/info', (request, response) => {
    let now = Date()
    let numOfPersons = persons.length
    let p = persons.length > 1 ? 'people' : 'person'
    response.send(`<h2>PhoneBook has info for ${numOfPersons} ${p}</h2><h2>${now}</h2>`)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    // const person = persons.find(person => person.id === id)

    // if (person) {
    //     response.json(person)
    // } else {
    //     response.statusMessage = 'Person Not Found'
    //     response.status(404).end()
    // }
    Person.findByID(request.params.id).then(person => {
        response.json(person)
    }) // TODO: catch?
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content incorrect'
        })
    }

    if (persons.filter(person => person.name === body.name).length > 0) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    persons = persons.concat(person)

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

const PORT = 9000 // as tencent cloud serverless service requests
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})