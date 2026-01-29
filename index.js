const express = require('express')
const morgan = require('morgan') 
const cors = require('cors')
require('dotenv').config()
// const mongoose = require('mongoose')
// const password = process.argv[2]
const Person = require('./models/person')


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

// const url =
    
//   `mongodb+srv://fullstack:${password}@cluster0.sv289yu.mongodb.net/?appName=Cluster0`

// mongoose.set('strictQuery',false)

// mongoose.connect(url)

// const personSchema = new mongoose.Schema({
//   name: String,
//   number: String,
// })

// const Person = mongoose.model('Person', personSchema)

const app = express()

app.use(express.json())

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

app.use(cors())

//Servir archivos estáticos 
app.use(express.static('dist'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  const total = persons.length
  const date = new Date()
  response.send(`
    <div>
    <p>Phonebook has info for ${total} people</p>
    <p>${date}</p>
    </div>
    `)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// app.get('/api/persons/:id', (request, response) => {
//   const id =  Number(request.params.id)
//   const person = persons.find(person => person.id === id)
//   if(person){
//   response.json(person)
//   }else{
//     response.status(404).end()
//   }
// })

app.get('/api/persons/:id', (request, response) => {
  Note.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

// const generateId = () => {
//   return Math.floor(Math.random() * 10000) + 1
// }

app.post('/api/persons', (request, response) => {
  const body = request.body
  // const name = request.body.name

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  // if (!body.name) {
  //   return response.status(400).json({ 
  //     error: 'name missing' 
  //   })
  // }

  //  if (!body.number) {
  //   return response.status(400).json({ 
  //     error: 'number missing' 
  //   })
  // }

  // if(persons.map(p => p.name).includes(name)){
  //   return response.status(400).json({
  //     error: 'name must be unique'
  //   })
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
    // id: generateId(),
  })

  person.save().then(savedPerson =>{
    response.json(savedPerson)
  })

})


const PORT = process.env.PORT 
app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`)
})