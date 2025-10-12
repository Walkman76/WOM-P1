const express = require('express')
require('dotenv').config()
const cors = require('cors')
const usersRouter = require('./routes/users')

const PORT = process.env.PORT || 6969
const app = express()

console.log(`Node.js ${process.version}`)

const allowedOrigin = [
    'https://wom-p1-frontend-1.onrender.com',
    'http://127.0.0.1:5501',
    'http://localhost:6969/users',
    'http://127.0.0.1:5500'
]

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigin.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true
}))
 

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