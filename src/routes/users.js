const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const authorize = require('../middleware/authorize')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

//router.use(authorize)

router.get('/', authorize, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
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

router.post('/register', async (req, res) => {
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
  console.log("Login credentials:", req.body);

  try {
    const user = await prisma.user.findUnique({
    where: { username: req.body.username}
  })

  if (!user) return res.status(401).send({msg: "Authentication failed"})

  const match = await bcrypt.compare(req.body.password, user.password)

  if (!match) {
    console.log('Bad password')
    return res.status(401).send({msg: 'Authentication failed'})
  }

  const token = jwt.sign({
    id: user.id,
    name: user.username
  }, process.env.JWT_SECRET, {expiresIn: '15m'})

  const refreshToken = crypto.randomBytes(64).toString('hex')

  const issuedAt = new Date()
  const expiresAt = new Date(issuedAt.getTime() + 30 * 24 * 60 * 60 * 1000)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      issued_at: issuedAt,
      expires_at: expiresAt
    }
  })

  return res.status(200).json({ token, refreshToken})

  } catch (error) {
    console.error("Login error", error)
    return res.status(500).json({msg: "Serverfel"})
  }
})



router.post('/refresh', async (req,res) => {
  const {refreshToken} = req.body

  if (!refreshToken) {
    return res.status(400).json({error: "Ingen refresh token skickats"})
  }

  try {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: {token: refreshToken},
      include: {user: true}
    })

    if (!tokenRecord) {
      return res.status(403).json({ error: "Refresh token här expirerat" })
    }

    //Skapar ny token här

      const newToken = jwt.sign(
      { id: tokenRecord.userId, name: tokenRecord.user.username },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    res.json({token: newToken})

  } catch (error) {
    console.error("Refresh", error)
    res.status(500).json({ error: "Serverfel"})
  }
})

router.delete('/refresh', async (req,res) => {
  const token = req.headers['authorization']

  if (!token) {
    return res.status(400).json({ error: "Ingen auktoriserad token"})
  }

  try {
    await prisma.refreshToken.deleteMany({
      where: {token}
    })

    res.json({message: "Utloggad"})

  } catch (error){
    console.error("Logout error", error)
    res.status(500).json({ error: "Serverfel vid utloggning"})
  }
})
module.exports = router;
