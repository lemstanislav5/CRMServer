// server.js - с инкапсулированными API маршрутами
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

async function bootstrap() {
    console.log('🚀 Инициализация сервера...');
    
    // 1. Конфигурация
    const config = require('./config');
    console.log(`📡 Порт: ${config.port}, Режим: ${config.nodeEnv}`);
    console.log(`🌍 Разрешённые origins:`, config.cors.origin);
    
    // 2. База данных
    const database = require('./database');
    const { repositories } = await database.init(config.database);
    console.log('✅ База данных подключена');
    
    // 3. Проверяем репозитории
    if (!repositories.admin) {
        console.error('❌ Репозиторий администратора не найден!');
        console.log('Доступные репозитории:', Object.keys(repositories));
        process.exit(1);
    }
    
    // 4. Создаем authService
    const AuthService = require('./services/AuthService');
    const authService = new AuthService(repositories, config.jwtSecret || 'default-secret-key');
    
    // 5. Инициализация администратора
    await initializeAdmin(repositories, authService);

    // 6. Импортируем остальные сервисы
    const ChatService = require('./services/ChatService');
    const UserService = require('./services/UserService');
    const SocketAuthService = require('./services/SocketAuthService');

    // 7. Создаем объект services
    const services = {
        chatService: new ChatService(repositories),
        userService: new UserService(repositories),
        authService: authService,
        socketAuthService: new SocketAuthService(authService),
    };
    console.log('✅ Сервисы инициализированы');
    
    // 8. Express приложение
    const app = express();
    const server = http.createServer(app);
    
    // 9. Middleware
    app.use(cors({
        origin: config.cors.origin,
        credentials: config.cors.credentials,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    app.options('*', cors(config.cors));
    app.use(express.json());
    app.use(express.static('public'));
    
    
    // 10. Подключаем API маршруты
    // Подключаем API роутер
    try {
        const apiRouter = require('./api')(services.authService);
        app.use('/api', apiRouter);
        console.log('✅ API роутер подключен к /api');
    } catch (error) {
        console.error('❌ Ошибка подключения API роутера:', error);
    }
    
    // 11. Health check (глобальный)
    app.get('/health', (req, res) => {
        res.json({ 
            status: 'ok',
            app: config.appName,
            version: config.version,
            cors: {
                allowedOrigins: config.cors.origin,
                clientOrigin: req.headers.origin || 'unknown'
            },
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
    
    // 12. Socket.IO
    const io = socketIO(server, {
        cors: {
            origin: config.cors.origin,
            credentials: config.cors.credentials,
            methods: ['GET', 'POST']
        },
        allowEIO3: true,
        transports: ['polling', 'websocket'],
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // 13. WebSocket middleware аутентификации
    io.use((socket, next) => {
        services.socketAuthService.socketAuthentication(socket, next);
    });

    // 14. WebSocket обработчики
    io.on('connection', (socket) => {
        console.log(`🔌 Новое соединение: ${socket.id}`);
        console.log(`👤 Тип: ${socket.isAdmin ? 'Администратор' : 'Клиент'}`);
        
        if (socket.isAdmin) {
            console.log(`🛡️  Админ: ${socket.adminLogin} (ID: ${socket.adminId})`);
            
            // Сохраняем socketId администратора
            repositories.admin.updateSocketId(socket.adminId, socket.id)
                .then(() => console.log('✅ SocketId администратора сохранен'))
                .catch(err => console.error('❌ Ошибка сохранения socketId:', err));
            
            // Обработчик для администратора
            require('./sockets/admin')(socket, io, services);
        } else {
            // Обработчик для клиента
            require('./sockets/chat')(socket, io, services);
        }
        
        // Отслеживание отключения
        socket.on('disconnect', () => {
            console.log(`🔌 Отключение: ${socket.id}`);
            
            if (socket.isAdmin && socket.adminId) {
                repositories.admin.updateSocketId(socket.adminId, null)
                    .catch(err => console.error('❌ Ошибка очистки socketId:', err));
            }
        });
    });
    
    // 15. Запуск сервера
    server.listen(config.port, () => {
        console.log(`\n🎯 Сервер запущен!`);
        console.log(`🌐 HTTP API: http://localhost:${config.port}`);
        console.log(`📡 WebSocket: ws://localhost:${config.port}`);
        console.log(`🔐 API Endpoints:`);
        console.log(`   POST /api/auth/login`);
        console.log(`   POST /api/auth/verify`);
        console.log(`   GET  /api/auth/profile`);
        console.log(`👁️  Health check: http://localhost:${config.port}/health`);
        console.log(`🌍 Разрешённые клиенты:`, config.cors.origin);
        console.log('\n✅ Готов к подключению клиентов!');
    });
    
    // 16. Graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown(server, database));
    process.on('SIGINT', () => gracefulShutdown(server, database));
}

/**
 * Инициализация администратора
 */
async function initializeAdmin(repositories, authService) {
    try {
        if (!repositories.admin.findFirst) {
            console.error('❌ Метод findFirst не найден');
            return;
        }
        
        const admin = await repositories.admin.findFirst();
        
        if (!admin) {
            console.log('👨‍💼 Администратор не найден, создаем стандартного...');
            await authService.createAdmin('admin', 'admin', 'Главный администратор');
            console.log('✅ Стандартный администратор создан');
            console.log('🔑 Логин: admin, Пароль: admin');
        } else {
            console.log('✅ Администратор найден в БД');
        }
    } catch (error) {
        console.error('❌ Ошибка инициализации администратора:', error.message);
    }
}

async function gracefulShutdown(server, database) {
    console.log('\n🛑 Завершение работы...');
    server.close();
    await database.close();
    console.log('✅ Сервер остановлен');
    process.exit(0);
}

// Запуск
bootstrap().catch(error => {
    console.error('❌ Ошибка запуска:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
});