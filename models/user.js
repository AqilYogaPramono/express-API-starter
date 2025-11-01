const connection = require('../configs/database')
const bcrypt = require('bcryptjs')

class User {
    static async checkEmail(data) {
        try {
            const [rows] = await connection.query(`select email from users where email = ?`, [data.email])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    static async register(data) {
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10) 
            const [result] = await connection.query(`INSERT INTO users (email, password) VALUES (?, ?)`, [data.email, hashedPassword])
            return result
        } catch (err) {
            throw err
        }
    }

    static async login(data) {
        try {
            const [rows] = await connection.query(`select * from users where email = ? `, [data.email])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async getEmail(id) {
        try {
            const [rows] = await connection.query(`select email from users where id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }
}

module.exports = User