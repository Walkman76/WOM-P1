const express = require('express')
const usersRouter = require('./routes/notes')
const PORT = process.env.PORT || 6969


require('dotenv').config()
const app = express()
console.log(`Node.js ${process.version}`)

app.use(express.json())

app.use('/users', usersRouter)


app.listen(PORT, () => {
    try {
        console.log(`Running on http://localhost:${PORT}`)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
    
})