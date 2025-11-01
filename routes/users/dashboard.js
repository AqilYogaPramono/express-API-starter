const express = require('express')

const User = require('../../models/User')
const { verifyToken, authorize } = require('../../middlewares/auth')

const router = express.Router()

router.get('/', verifyToken, authorize('User'), async (req, res) => {
    try {
        const userId = req.user.id
        console.log(userId)
        const users = await User.getEmail(userId)

        res.status(200).json({ users })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

module.exports = router