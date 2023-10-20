const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')
app.use(cors())
app.use(express.json())
// app.use(morgan('tiny'))

morgan.token('json', (req) => (JSON.stringify(req.body)))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :json'))

app.use(express.static('build'))

app.get('/info', (request, response, next) => {
    let now = Date()

    Person.find({}).then(result => {
        console.log(result)
        let numberOfPersons = result.length
        let p = numberOfPersons > 1 ? 'people' : 'person'
        response.send(`<h2>PhoneBook has info for ${numberOfPersons} ${p}</h2><h2>${now}</h2>`)
    })
        .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(result => {
        response.json(result)
    })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {

    Person.findById(request.params.id)
        .then(person => {
            response.json(person)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))

    // response.status(204).end()
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true , runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content incorrect'
        })
    }

    // if (persons.filter(person => person.name === body.name).length > 0) {
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.messege)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

const PORT = 9000 // as tencent cloud serverless service requests
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})