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
    const corsOptions = config.getCorsOptions();
    const socketIOOptions = config.getSocketIOOptions(corsOptions);
    const staticFolder = config.getStaticFolder();
    
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
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
    app.use(express.json());
    app.use(express.static(staticFolder));
    
    // 4. Импортируем роутер как функцию и передаем в него мидлвер
    const apiRouter = require('./routes/api')(controllers, middleware);

    // Подключаем роутер к приложению
    app.use('/api', apiRouter);
    
    // 5. Socket.IO
    const io = socketIO(server, socketIOOptions);

    // 6. Socket middleware
    io.use((socket, next) =>
        middleware.socketAuthMiddleware.verifySocket(socket, next)
    );

    // 7. WebSocket обработчики
    io.on('connection', (socket) => {
        console.log(`🔌 Новое соединение: ${socket.id}`);
        console.log(`👤 Тип: ${socket.isAdmin ? 'Администратор' : 'Клиент'}`);
        
        if (socket.isAdmin && socket.decoded != undefined) {
            console.log(`👮‍♂️  Подключено сокет соединение с администратором: `, socket.decoded, socket.id);
            // require('./sockets/admin')(socket, io, services);
        } else {
            console.log(`🙍‍♀️  Подключено сокет соединение с пользователем: `, socket.decoded, socket.id);
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
        console.log(`📂 Статика: ${staticFolder}`);
        console.log(`🔧 CORS Origin: ${corsOptions.origin.join(', ')}`);
    });
    
    // 9. Graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown(server, connection));
    process.on('SIGINT', () => gracefulShutdown(server, connection));
}

async function gracefulShutdown(server, connection) {
    console.log('🛑 Получен сигнал завершения...');
    
    server.close(async () => {
        console.log('🔒 HTTP сервер закрыт');
        
        if (connection && typeof connection.close === 'function') {
            await connection.close();
            console.log('🗄️  База данных закрыта');
        }
        
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