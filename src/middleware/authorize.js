const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = (req, res, next) => {
    try {  
        const autHeader = req.headers['authorization']
        if (!autHeader || !autHeader.startsWith('Bearer ')) {
            return res.status(401).json({error: 'Missing or invalid authorization'})
        } 
        
        const token = autHeader.split(' ')[1]
        const user = jwt.verify(token, process.env.JWT_SECRET)
        req.authuser = user

        console.log(`token valid for user ${(user.username)}`)
        next()
    } catch (error) {
        console.error('Authroization error: ', error.message)
        res.status(401).json({error: 'Unauthorized'})
    }
    
}