// routes/auth.js
const express = require('express');
const router = express.Router();
const authValidators = require('../middleware/validators/authValidators');
const authMiddleware = require('../middleware/auth');

/**
 * Фабрика роутера аутентификации
 * @param {AuthController} authController 
 */
module.exports = (authController) => {
    // Публичные эндпоинты
    router.post('/login', 
        authValidators.loginValidator,
        (req, res) => authController.login(req, res)
    );
    
    router.get('/verify', 
        (req, res) => authController.verifyToken(req, res)
    );
    
    // Защищенные эндпоинты
    router.get('/profile', 
        authMiddleware,
        (req, res) => authController.getProfile(req, res)
    );
    
    router.post('/logout', 
        authMiddleware,
        (req, res) => authController.logout(req, res)
    );
    
    return router;
};