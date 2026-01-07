// api/auth/auth.controller.js - контроллер авторизации
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    /**
     * Вход администратора
     */
    async login(req, res) {
        try {
            const { login, password } = req.body;
            
            if (!login || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Логин и пароль обязательны'
                });
            }
            
            const result = await this.authService.authenticateAdmin(login, password);
            
            if (!result.success) {
                return res.status(401).json(result);
            }
            
            res.json({
                success: true,
                token: result.token,
                admin: result.admin,
                message: 'Авторизация успешна'
            });
            
        } catch (error) {
            console.error('Ошибка входа:', error);
            res.status(500).json({
                success: false,
                error: 'Ошибка сервера'
            });
        }
    }

    /**
     * Проверка токена
     */
    async verifyToken(req, res) {
        try {
            const { token } = req.body;
            
            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'Токен обязателен'
                });
            }
            
            const verification = this.authService.verifyToken(token);
            
            if (!verification.success) {
                return res.status(401).json(verification);
            }
            
            res.json({
                success: true,
                payload: verification.payload,
                message: 'Токен действителен'
            });
            
        } catch (error) {
            console.error('Ошибка проверки токена:', error);
            res.status(500).json({
                success: false,
                error: 'Ошибка сервера'
            });
        }
    }

    /**
     * Создание администратора (только для разработки)
     */
    async createAdmin(req, res) {
        try {
            // Проверяем окружение
            if (process.env.NODE_ENV !== 'development') {
                return res.status(403).json({
                    success: false,
                    error: 'Доступно только в режиме разработки'
                });
            }
            
            const { login, password, name } = req.body;
            
            if (!login || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Логин и пароль обязательны'
                });
            }
            
            const result = await this.authService.createAdmin(login, password, name);
            
            res.json({
                success: true,
                admin: result,
                message: 'Администратор создан'
            });
            
        } catch (error) {
            console.error('Ошибка создания администратора:', error);
            res.status(500).json({
                success: false,
                error: 'Ошибка сервера'
            });
        }
    }

    /**
     * Получить профиль администратора
     */
    async getProfile(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: 'Токен не предоставлен'
                });
            }
            
            const verification = this.authService.verifyToken(token);
            
            if (!verification.success) {
                return res.status(401).json(verification);
            }
            
            res.json({
                success: true,
                admin: verification.payload,
                message: 'Профиль получен'
            });
            
        } catch (error) {
            console.error('Ошибка получения профиля:', error);
            res.status(500).json({
                success: false,
                error: 'Ошибка сервера'
            });
        }
    }
}

module.exports = AuthController;