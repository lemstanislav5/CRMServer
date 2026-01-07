// api/auth/auth.routes.js - маршруты авторизации
const express = require('express');
const router = express.Router();

module.exports = function(authService) {
    const AuthController = require('./auth.controller');
    const authController = new AuthController(authService);
    
    // Вход администратора
    router.post('/login', (req, res) => {
        
        console.log('📨 Запрос на /api/login от:', req.headers.origin);
        authController.login(req, res)}
    );
    
    // Проверка токена
    router.post('/verify', (req, res) => authController.verifyToken(req, res));
    
    // Получить профиль (требуется токен)
    router.get('/profile', (req, res) => authController.getProfile(req, res));
    
    // Создание администратора (только dev)
    router.post('/create', (req, res) => authController.createAdmin(req, res));
    
    return router;
};