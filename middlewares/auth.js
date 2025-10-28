const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer', '').trim()
    if (!token) {
        return res.status(403).json({ message: 'Token not provided' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' })
        }
        req.user = decoded
        next()
    })
}

function authorize(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'User not authenticated' })
        }
        if (!allowedRoles.includes(req.user.userType)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' })
        }
        next()
    }
}

module.exports = { verifyToken, authorize }
