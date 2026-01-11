// server.js - упрощенная точка входа
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { initCore } = require('./core');

async function bootstrap() {
    console.log('🚀 Инициализация сервера...');
    
    // 1. Инициализация ядра приложения
    const config = require('./config');
    // const {
    //     controllers,
    //     socketAuthMiddleware,
    //     closeDatabase
    // } = await initCore();
    
    const {
        connection,
        controllers, 
        services,
        repositories,
        middleware,
    } = await initCore();
    
    // 2. Express приложение
    const app = express();
    const server = http.createServer(app);
    
    // 3. Middleware
    app.use(cors(config.corsOptions));
    app.options('*', cors(config.corsOptions));
    app.use(express.json());
    app.use(express.static('public'));
    
    // 4. Роутер
    const createRouter = require('./routes');
    const router = createRouter(controllers);
    app.use('/api', router);
    
    // 5. Socket.IO
    const io = socketIO(server, {
        cors: {
            origin: config.corsOptions.origin,
            credentials: config.corsOptions.credentials,
            methods: ['GET', 'POST']
        },
        allowEIO3: true,
        transports: ['polling', 'websocket'],
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // 6. Socket middleware
    io.use((socket, next) =>
        middleware.socketAuthMiddleware.verifySocket(socket, next)
    );

    // 7. WebSocket обработчики
    io.on('connection', (socket) => {
        console.log(`🔌 Новое соединение: ${socket.id}`);
        console.log(`👤 Тип: ${socket.isAdmin ? 'Администратор' : 'Клиент'}`);
        
        if (socket.isAdmin && socket.decoded != undefined) {
            console.log(`🛡️  Админ: `, socket.decoded, socket.id);
            // require('./sockets/admin')(socket, io, services);
        } else {
            // require('./sockets/chat')(socket, io, services);
        }
        
        socket.on('disconnect', () => {
            console.log(`🔌 Отключение: ${socket.id}`);
        });
    });
    
    // 8. Запуск сервера
    server.listen(config.port, () => {
        console.log(`\n🎯 Сервер запущен!`);
        console.log(`🌐 HTTP API: http://localhost:${config.port}`);
        console.log(`📡 WebSocket: ws://localhost:${config.port}`);
    });
    
    // 9. Graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown(server, closeDatabase));
    process.on('SIGINT', () => gracefulShutdown(server, closeDatabase));
}

async function gracefulShutdown(server, closeDatabase) {
    console.log('🛑 Получен сигнал завершения...');
    
    server.close(async () => {
        console.log('🔒 HTTP сервер закрыт');
        
        await closeDatabase();
        
        console.log('👋 Процесс завершен');
        process.exit(0);
    });
    
    setTimeout(() => {
        console.error('⏳ Принудительное завершение из-за таймаута');
        process.exit(1);
    }, 10000);
}

// Запуск
bootstrap().catch(error => {
    console.error('❌ Ошибка запуска:', error);
    process.exit(1);
});