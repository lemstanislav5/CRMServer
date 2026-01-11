// routes/index.js - главный файл роутинга
const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    /**
     * Публичные маршруты
     */
    router.post('/login', 
        // авторизация реализована в методе контроллера authController.login
        (req, res) => controllers.authController.login(req, res)
    );
    
    /**
     * Приватные маршруты
     */
    router.post('/messages', (req, res) => {
        // верификация реализована в методе контроллера authController verify
        controllers.authController.verify(req, res);
    });
    
    //  if (req.auth) return res.status(200).send({ login: req.manager.login });
    // return res.status(401).send();


    // Health check endpoint
    router.get('/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    // 404 handler для /api/*
    router.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            message: `API endpoint ${req.originalUrl} not found`
        });
    });
    
    return router;
};