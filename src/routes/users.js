const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.get('/', (req, res) => {
    res.json({msg: "Users page"})
})

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
      console.error(error)
      res.status(500).json({error: 'Serverfel!'})
    }
})
module.exports = router;
