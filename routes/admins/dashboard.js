const express = require('express')

const Admin = require('../../models/Admin')
const { verifyToken, authorize } = require('../../middlewares/auth')

const router = express.Router()

router.get('/', verifyToken, authorize('Admin'), async (req, res) => {
    try {
        const userId = req.user.id
        const users = await Admin.getEmail(userId)

        res.status(200).json({ users })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

module.exports = router