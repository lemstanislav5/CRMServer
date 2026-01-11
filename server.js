// server.js - с инкапсулированными API маршрутами
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { admin } = require('./database/init/schema');

async function bootstrap() {
    console.log('🚀 Инициализация сервера...');
    
    // 1. Конфигурация
    const config = require('./config');
    
    // 2. База данных 😡 МНЕ НЕ НРАВИТСЯ, ЧТО К БАЗЕ ПОДКЛЮЧАЕТСЯ ВЛОЖЕННАЯ ФУУНКЦИЯ INIT, А ПОТОМ ВОЗВРАЩАЕТ СОЕДИНЕНИЕ И ПРИХОДИТСЯ РАЗДАВАТЬ РЕПОЗИТОРИИ!!
    const database = require('./database/init');
    console.log('✅ База данных подключена');
    const { connection } = await database.initDatabase(config.database);
    // Импортируем репозитории
    const { AdminRepository, UserRepository, MessageRepository } = require('./database/repositories');
    const repositories = {
        usersRepository: new UserRepository(connection),
        adminRepository: new AdminRepository(connection),
        messagesRepository: new MessageRepository(connection),
    };
    console.log('✅ Репозитории инициализированы');
    
    // 3. Импортируем сервисы и создаем их инстансы
    const { AdminService, AuthService, ChatService, UserService, SettingsService, SocketAuthService} = require('./services');
    const services = {
        authService: new AuthService(repositories, config.jwtSecret || 'default-secret-key'),
        adminService: new AdminService(repositories),
        chatService: new ChatService(repositories),
        userService: new UserService(repositories),
        socketAuthService: new SocketAuthService(this.authService),
    };
    console.log('✅ Сервисы инициализированы');
    
    // 4. Импортируем контроллеры и создаем их инстансы
    const { AuthController, AdminController } = require('./controllers');
    const controllers = {
        authController: new AuthController(services),
        adminController: new AdminController(services)
    }

    // 4. Express приложение
    const app = express();
    const server = http.createServer(app);
    
    // 5. Middleware
    app.use(cors(config.corsOptions));
    
    app.options('*', cors(config.corsOptions));
    app.use(express.json());
    app.use(express.static('public'));
    
    
    // 6. Создаем главный роутер и передаем ему контроллеры
    const createRouter = require('./routes');
    const router = createRouter(controllers);
    app.use('/api', router);
    
    
    // 7. Socket.IO
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

    // 8. Инициализируем middleware
    const {SocketAuthMiddleware } = require('./middleware');
    const middleware = {
        socketAuthMiddleware: new SocketAuthMiddleware(services),    
    }
    // 9. Проверяем верификацию токена при соект соединении
    io.use((socket, next) =>
        middleware.socketAuthMiddleware.verifySocket(socket, next)
    );

    // 10. WebSocket обработчики
    io.on('connection', (socket) => {
        console.log(`🔌 Новое соединение: ${socket.id}`);
        console.log(`👤 Тип: ${socket.isAdmin ? 'Администратор' : 'Клиент'}`);
        
        if (socket.isAdmin && socket.decoded != undefined) {
            console.log(`🛡️  Админ: `,  socket.decoded, socket.id);
            // Сохраняем socketId администратора
            // controllers.adminController.updateSocketId(socket.decoded.id, socket.id);
            
            // Обработчик для администратора
            // require('./sockets/admin')(socket, io, services);
        } else {
            // Обработчик для клиента
            // require('./sockets/chat')(socket, io, services);
        }
        
        // Отслеживание отключения
        socket.on('disconnect', () => {
            console.log(`🔌 Отключение: ${socket.id}`);
            
            if (socket.isAdmin && socket.adminId) {
                // controllers.adminController.updateSocketId(socket.decoded.id, null)
                //     .catch(err => console.error('❌ Ошибка очистки socketId:', err));
            }
        });
    });
    
    // 15. Запуск сервера
    server.listen(config.port, () => {
        console.log(`\n🎯 Сервер запущен!`);
        console.log(`🌐 HTTP API: http://localhost:${config.port}`);
        console.log(`📡 WebSocket: ws://localhost:${config.port}`);
    });
    
    // 16. Graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown(server, database));
    process.on('SIGINT', () => gracefulShutdown(server, database));
}

// Запуск
bootstrap().catch(error => {
    console.error('❌ Ошибка запуска:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
});