const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const authorize = require('../middleware/authorize')
const jwt = require('jsonwebtoken')

//router.use(authorize)

router.get('/', authorize, async (req, res) => {
    try {
      const user = await prisma.user.findMany({
        where: {
          id: Number(req.user.id)
        }
      })
      res.json(user)
    } catch (error){
      console.log(error)
      res.status(500).send({msg: "error"})
    }
})

//ANVÄNDAR SKAPNING

router.post('/', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password)
      return res.status(400).json({ error: 'Användarnamn och/eller lösenord saknas' })

    try {
      const existUser = await prisma.user.findUnique({where: {username}})
        

      if (existUser) {
        return res.status(409).json({ error: 'Användarnamn är upptaget' })
      }

      const saltPass = 10
      const hashPass = await bcrypt.hash(password, saltPass)

      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashPass,
        },
      })

      res.status(201).json({
        msg: 'Användare skapad!',
        user: {
          id: newUser.id,
          username: newUser.username,
        },
      })

    } catch (error) {
      console.error('Fel i POST /users:', error)
      res.status(500).json({ error: 'Serverfel!', details: error.message })
}
})

//ANVÄNDAR LOGIN

router.post('/login', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
    where: { username: req.body.username}
  })

  if (user == null) return res.status(401).send({msg: "Authentication failed"})

  const match = await bcrypt.compare(req.body.password, user.password)

  if (!match) {
    console.log('Bad password')
    return res.status(401).send({msg: 'Authentication failed'})
  }

  const token = await jwt.sign({
    id: user.id,
    name: user.username
  }, process.env.JWT_SECRET, {expiresIn: '30d'})

    return res.status(200).json({ token })
  } catch (error) {
    console.error("Login error", error)
    return res.status(500).json({msg: "Serverfel"})
  }
})
module.exports = router;
