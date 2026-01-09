// routes/index.js - главный файл роутинга
const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    // Подключаем отдельные модули роутов
    const authRouter = require('./auth')(controllers.authController);
    // const usersRouter = require('./users')(controllers.userController);
    // const chatRouter = require('./chat')(controllers.chatController);
    
    // Регистрируем префиксы
    router.use('/auth', authRouter);
   
    router.post('/messages', (req, res) => {  // Исправить на messages
        console.log('POST /api/messages', req.body);
        res.json({ success: true, message: 'Route works!' });
    });



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