const express = require('express')
const jwt = require('jsonwebtoken')
const Users = require('../models/User')
const router = express.Router()

router.post('/register', async (req, res) => {
    try {
        const { email, password, confirmation_password } = req.body
        const data = { email, password, confirmation_password }

        if (!data.email) {
            return res.status(400).json({ message: 'Email is required.' })
        }

        if (!data.password) {
            return res.status(400).json({ message: 'Password is required.' })
        }

        if (!data.confirmation_password) {
            return res.status(400).json({ message: 'Confirm Password is required'})
        }

        if (await Users.checkEmail(email)) {
            return res.status(400).json({ message: 'Email is already in use.' })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' })
        }

        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one uppercase letter.' })
        }

        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one lowercase letter.' })
        }

        if (!/\d/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one number.' })
        }

        if (password != confirmation_password) {
            return res.status(400).json({ message: 'Password and confirmation password do not match.' })
        }

        await Users.register(data)

        res.status(201).json({ message: 'User registered successfully.' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const data = {email, password}

        if (!data.email) {
            return  res.status(400).json({ message: 'Email is required.' })
        }

        if (!data.password) {
            return res.status(400).json({ message: 'Password is required.' })
        }

        const user = await Users.login(data)

        const payload = {id: user.id}

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' })

        res.status(200).json({ token })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
})

module.exports = router