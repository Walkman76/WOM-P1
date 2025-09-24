const express = require('express')
require('dotenv').config()
import cors from 'cors'
const usersRouter = require('./routes/users')

const PORT = process.env.PORT || 6969
const app = express()

console.log(`Node.js ${process.version}`)

app.use(cors())

app.use(express.json())

app.get('/', (req, res) => {
    res.json({msg: "This prints!"})
})

app.use('/users', usersRouter)


app.listen(PORT, () => {
    try {
        console.log(`Running on http://localhost:${PORT}`)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
    
})