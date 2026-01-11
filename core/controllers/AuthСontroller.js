// controllers/AuthController.js - УПРОЩЕННАЯ версия
const { validationResult } = require('express-validator');

class AuthController {
    constructor({authService}) {
        if (!authService) {
            throw new Error('AuthService is required');
        }
        this.authService = authService;
    }

    /**
     * Вход администратора
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            // Проверка валидации
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array().map(err => ({
                        field: err.path,
                        message: err.msg
                    })),
                    message: 'Ошибка валидации'
                });
            }

            const { login, password } = req.body;
            
            console.log(`🔐 Попытка входа: ${login}`);
            
            // Аутентификация
            const result = await this.authService.loginAdmin(login, password);
            
            if (!result.success) {
                return res.status(401).json({
                    success: false,
                    message: result.error || 'Ошибка аутентификации'
                });
            }
            
            // Устанавливаем refresh token в cookie
            res.cookie('refresh_token', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            
            // Успешный ответ
            return res.status(200).json({
                success: true,
                token: result.token,
                admin: result.admin,
                expiresIn: result.expiresIn
            });
            
        } catch (error) {
            console.error('💥 Ошибка в AuthController.login:', error);
            return res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }

    /**
     * Проверка токена
     */
    async verify(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Токен отсутствует'
                });
            }
            
            const result = this.authService.verifyToken(token);
            
            if (!result.success) {
                console.log('🔥 Ошибка верификации токена!')
                return res.status(401).json({
                    success: false,
                    message: 'Невалидный токен'
                });
            }
            console.log('✅ Токен прошел верификацию!', result)
            return res.status(200).json({
                success: true,
                data: {
                    user: result.payload
                }
            });
            
        } catch (error) {
            console.error('💥 Ошибка в AuthController.verify:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка проверки токена'
            });
        }
    }

    /**
     * Обновление токена
     * POST /api/auth/refresh
     */
    async refresh(req, res) {
        try {
            const refreshToken = req.cookies?.refresh_token;
            
            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token отсутствует'
                });
            }
            
            const result = await this.authService.refreshToken(refreshToken);
            
            if (!result.success) {
                return res.status(401).json({
                    success: false,
                    message: 'Ошибка обновления токена'
                });
            }
            
            // Устанавливаем новый refresh token
            res.cookie('refresh_token', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            
            return res.status(200).json({
                success: true,
                data: {
                    token: result.token
                }
            });
            
        } catch (error) {
            console.error('💥 Ошибка в AuthController.refresh:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка обновления токена'
            });
        }
    }

    /**
     * Выход из системы
     * POST /api/auth/logout
     */
    async logout(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            
            if (token) {
                await this.authService.logout(token);
            }
            
            // Очищаем cookie
            res.clearCookie('refresh_token');
            
            return res.status(200).json({
                success: true,
                message: 'Успешный выход'
            });
            
        } catch (error) {
            console.error('💥 Ошибка в AuthController.logout:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка при выходе'
            });
        }
    }

    /**
     * Профиль пользователя
     * GET /api/auth/profile
     */
    async profile(req, res) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Требуется аутентификация'
                });
            }
            
            const userProfile = await this.authService.getUserProfile(req.user.id);
            
            if (!userProfile) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }
            
            return res.status(200).json({
                success: true,
                data: userProfile
            });
            
        } catch (error) {
            console.error('💥 Ошибка в AuthController.profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка получения профиля'
            });
        }
    }

    async verifySocket(socket, next) {
        try {
            const token = socket.handshake.query?.token;
            
            if (!token) {
                // Если токена нет, но подключение публичное - разрешаем
                console.log("🛑 Токен отсутствиет в сокет соединении");
                socket.isAdmin = false;
                return next();
            }

            const decoded = this.authService.verifyToken(token); //jwt.verify(token, process.env.JWT_SECRET);
            // Проверяем, не истек ли токен
            if (decoded.exp && Date.now() >= decoded.exp * 1000) {
                 console.log("🛑 Срок действия токена истек");
                return next(new Error('Token expired'));
            }
            console.log("🟢 Токен прошел верификацию при сокет соединении");
            socket.isAdmin = true;
            socket.decoded = decoded.payload;
            next();
        } catch (error) {
           console.log("🛑 Ошибка при верификации токена");
           return next(new Error('Token expired'));
        }
    }

}

module.exports = AuthController;