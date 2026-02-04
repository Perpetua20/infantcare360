const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateToken(payload, expiresIn = '1h') {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

module.exports = {
    generateToken,
    verifyPassword
};
