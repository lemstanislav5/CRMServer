// config/index.js
require('dotenv').config();

module.exports = {
    // Сервер
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // JWT секрет
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    // {
    //     origin: config.cors.origin,
    //     credentials: config.cors.credentials,
    //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    //     allowedHeaders: ['Content-Type', 'Authorization']
    // }

    // CORS настройки
    corsOptions: {
        origin: process.env.CLIENT_URL 
                ? process.env.CLIENT_URL.split(',')  // Можно несколько через запятую
                : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080', 'http://localhost:4000'],
            
            // Или разрешаем все (для разработки)
            // origin: '*', // ⚠️ Опасно для продакшена!
            
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
   },
    
    // База данных
    database: {
        type: process.env.DB_TYPE || 'sqlite',
        sqlite: {
            path: process.env.SQLITE_PATH || './chat.db3'
        }
    },
    
    // Приложение
    appName: 'Chat Server',
    version: '1.0.0'
};