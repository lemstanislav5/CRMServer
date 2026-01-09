// middleware/socketAuth.js
const jwt = require('jsonwebtoken');

module.exports = (socket, next) => {
  try {
    const token = socket.handshake.query?.token;
    
    if (!token) {
      // Если токена нет, но подключение публичное - разрешаем
      socket.isAuthenticated = false;
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Проверяем, не истек ли токен
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return next(new Error('Token expired'));
    }
    
    // Добавляем данные пользователя в сокет
    socket.user = {
      id: decoded.userId,
      role: decoded.role,
      isAuthenticated: true
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Token expired'));
    }
    next(new Error('Authentication failed'));
  }
};