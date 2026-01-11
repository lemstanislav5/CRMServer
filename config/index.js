// config/index.js
require('dotenv').config();

const config = {
    // Сервер
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // JWT секрет
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    
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

// Функция для получения CORS настроек
const getCorsOptions = () => {
    const origin = process.env.CLIENT_URL 
        ? process.env.CLIENT_URL.split(',')
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080', 'http://localhost:4000'];
    
    return {
        origin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    };
};

// Функция для получения настроек Socket.IO
const getSocketIOOptions = (corsOptions) => {
    return {
        cors: {
            origin: corsOptions.origin,
            credentials: corsOptions.credentials,
            methods: ['GET', 'POST']
        },
        allowEIO3: true,
        transports: ['polling', 'websocket'],
        pingTimeout: 60000,
        pingInterval: 25000
    };
};

// Функция для получения пути к статическим файлам
const getStaticFolder = () => 'public';

module.exports = {
    ...config,
    getCorsOptions,
    getSocketIOOptions,
    getStaticFolder
};