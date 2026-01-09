// routes/messages.js
const express = require('express');
const router = express.Router();
const authValidators = require('../middleware/validators/authValidators');
const authMiddleware = require('../middleware/auth');

/**
 * Фабрика роутера аутентификации
 * @param {AuthController} authController 
 */
module.exports = (authController) => {
    router.get('/messages', 
        (req, res) => {
            console.log(res)
        }
    );
    return router;
};