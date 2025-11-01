const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const Users = require('../models/User')
const Admin = require('../models/Admin')

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

        if (await Users.checkEmail(data)) {
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
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
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

        let user = null
        let role = null

        user = await Users.login(data)
        if (user) {
            role = 'User'
        } else {
            user = await Admin.login(data)
            if (user) {
                role = 'Admin'
            }
        }

        if (!user) {
            return res.status(401).json({ message: 'Email not found' })
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Incorrect password' })
        }

        if (user.status != 'Active') {
            return res.status(403).json({ message: 'Account is not active' })
        }

        const payload = {id: user.id, role}

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' })

        res.status(200).json({ token })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

router.post('/logout', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(401).json({ message: 'No token provided.' })
        }
        
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
            return res.status(401).json({ message: 'Invalid token or token has expired.' })
            }
            res.status(200).json({ message: 'Logout successful.' })
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal server error' })
    }
})

module.exports = router