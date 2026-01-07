class AuthService {
    constructor(repositories, jwtSecret) {
        this.adminRepository = repositories.admin;
        this.jwtSecret = jwtSecret;
        this.jwt = require('jsonwebtoken');
        this.bcrypt = require('bcrypt');
    }

    /**
     * Аутентификация администратора по логину/паролю
     */
    async authenticateAdmin(login, password) {
        try {
            // 1. Ищем администратора в БД
            const admin = await this.adminRepository.findByLogin(login);
            
            if (!admin) {
                return {
                    success: false,
                    error: 'Администратор не найден'
                };
            }

            // 2. Проверяем пароль
            const isPasswordValid = await this.bcrypt.compare(password, admin.password_hash);
            
            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Неверный пароль'
                };
            }

            // 3. Генерируем JWT токен
            const token = this.jwt.sign(
                {
                    id: admin.id,
                    login: admin.login,
                    role: 'admin',
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 часа
                },
                this.jwtSecret
            );

            // 4. Обновляем последний вход
            await this.adminRepository.updateLastLogin(admin.id);

            return {
                success: true,
                token,
                admin: {
                    id: admin.id,
                    login: admin.login,
                    name: admin.name || 'Администратор'
                }
            };

        } catch (error) {
            console.error('Ошибка аутентификации:', error);
            return {
                success: false,
                error: 'Ошибка сервера при аутентификации'
            };
        }
    }

    /**
     * Верификация JWT токена (для Socket.IO middleware)
     */
    verifyToken(token) {
        try {
            const decoded = this.jwt.verify(token, this.jwtSecret);
            return {
                success: true,
                payload: decoded
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Создание нового администратора (для инициализации)
     */
    async createAdmin(login, password, name = 'Администратор') {
        try {
            const saltRounds = 10;
            const passwordHash = await this.bcrypt.hash(password, saltRounds);

            return await this.adminRepository.create({
                login,
                password_hash: passwordHash,
                name,
                is_active: true
            });
        } catch (error) {
            console.error('Ошибка создания администратора:', error);
            throw error;
        }
    }
}

module.exports = AuthService;