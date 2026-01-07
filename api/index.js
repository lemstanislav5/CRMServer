const express = require('express');

module.exports = function(authService) {
    const router = express.Router();
    
    if (!authService) {
        console.error('❌ AuthService не передан в API router');
        // Возвращаем роутер с обработкой ошибок
        router.use('*', (req, res) => {
            res.status(500).json({
                success: false,
                error: 'API не инициализирован'
            });
        });
        return router;
    }
    
    try {
        // Подключение маршрутов с передачей зависимостей
        const authRoutes = require('./auth/auth.routes')(authService);
        router.use('/auth', authRoutes);
        router.post('/login', async (req, res) => {
            console.log('🔐 Запрос на /api/login от:', req.headers.origin);
            console.log('📦 Тело запроса:', req.body);
            
            try {
                const { login, password } = req.body;
                
                if (!login || !password) {
                    return res.status(400).json({
                        success: false,
                        error: 'Логин и пароль обязательны'
                    });
                }
                
                // Используем authService для аутентификации
                const result = await authService.authenticateAdmin(login, password);
                
                // Добавляем сообщение для клиента
                if (result.success) {
                    res.json({
                        success: true,
                        token: result.token,
                        admin: result.admin,
                        message: 'Авторизация успешна'
                    });
                } else {
                    // 401 для неверных учетных данных
                    res.status(401).json(result);
                }
                
            } catch (error) {
                console.error('❌ Ошибка в /api/login:', error);
                res.status(500).json({
                    success: false,
                    error: 'Ошибка сервера'
                });
            }
        });
        // Другие API модули можно добавлять здесь
        // const chatRoutes = require('./chat/chat.routes')(chatService);
        // router.use('/chat', chatRoutes);
        
        // Health check API
        router.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                endpoint: 'api',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });
        
        // Тестовый маршрут
        router.get('/test', (req, res) => {
            res.json({ 
                message: 'API работает!',
                version: '1.0.0'
            });
        });
        
        // 404 для API
        router.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'API endpoint не найден'
            });
        });
        
        console.log('✅ API роутер инициализирован');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации API:', error);
        // Fallback обработчик
        router.use('*', (req, res) => {
            res.status(500).json({
                success: false,
                error: 'Ошибка инициализации API'
            });
        });
    }
    
    return router;
};