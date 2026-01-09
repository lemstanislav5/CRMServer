// routes/messages.routes.js
const express = require('express');
const router = express.Router();
// const messageController = require('../controllers/message.controller');
// const authMiddleware = require('../middleware/auth.middleware');

// Все запросы к сообщениям требуют авторизации
// router.use(authMiddleware.verifyToken);

// Получить сообщения
// router.get('/', messageController.getMessages);

// Отправить сообщение
// router.post('/', messageController.sendMessage);

// Удалить сообщение
// router.delete('/:id', messageController.deleteMessage);

module.exports = router;