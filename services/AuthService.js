// services/AdminService.js
const bcrypt = require('bcrypt');

class AuthService {
    constructor(repositories, jwtSecret) {
       const { adminRepository } = repositories;
        
        if (!adminRepository) {
            throw new Error('adminRepository is required');
        }
        
        this.adminRepository = adminRepository;
        this.jwtSecret = jwtSecret || process.env.JWT_SECRET;
    }

    /**
     * Аутентификация администратора
     * Возвращает данные в том же формате, что и старый httpHandlers.js
     * @param {string} login - Логин администратора
     * @param {string} password - Пароль
     * @returns {Promise<Object>} Результат аутентификации в формате { token, login }
     */
    async loginAdmin(login, password) {
        try {
            console.log(`🔐 AdminService.loginAdmin: ${login}`);
            // 1. Находим администратора
            const admin = await this.adminRepository.findByLogin(login);
            
            if (!admin) {
                console.log(`❌ Администратор не найден: ${login}`);
                return {
                    success: false,
                    error: 'Invalid credentials'
                };
            }
            
            // 2. Проверяем пароль
            // Поддержка старого формата (прямой пароль в БД) и нового (bcrypt)
            let isPasswordValid = false;
            
            if (admin.password_hash) {
                // Новый формат: пароль хеширован bcrypt
                isPasswordValid = await bcrypt.compare(password, admin.password_hash);
            } else if (admin.password) {
                // Старый формат: пароль в открытом виде (для миграции)
                isPasswordValid = (password === admin.password);
            } else {
                // Нет пароля в БД
                isPasswordValid = false;
            }
            
            // 3. Проверяем активность
            if (admin.is_active === false || admin.is_active === 0) {
                return {
                    success: false,
                    error: 'Account disabled'
                };
            }
            
            if (!isPasswordValid) {
                console.log(`❌ Неверный пароль для: ${login}`);
                return {
                    success: false,
                    error: 'Invalid credentials'
                };
            }
            
            // 4. Генерируем токены (в точности как в старом коде)
            const payload = { 
                id: admin.id, 
                login: admin.login 
            };
            
            // Access token - 14 минут (как в старом коде)
            const accessToken = this.generateToken(payload, '14m');
            
            // Refresh token - 30 дней (как в старом коде)
            const refreshToken = this.generateToken(payload, '30d');
            
            
            console.log(`✅ Успешная аутентификация: ${admin.login} (ID: ${admin.id})`);
            
            // 6. Возвращаем данные в ТОЧНО ТАКОМ ЖЕ формате, как старый код
            return {
                success: true,
                token: accessToken,        // Только access token
                login: admin.login,        // Логин администратора
                refreshToken: refreshToken, // Refresh token для cookie
                payload: payload           // Для отладки
            };
            
        } catch (error) {
            console.error('💥 Ошибка в AdminService.loginAdmin:', error);
            return {
                success: false,
                error: 'Internal server error'
            };
        }
    }
    
    /**
     * Проверка refresh token и генерация нового access token
     * В точности как в старом коде
     * @param {string} refreshToken - Refresh token из cookie
     * @returns {Promise<Object>} Новый access token
     */
    async refreshToken(refreshToken) {
        try {
            if (!refreshToken) {
                return {
                    success: false,
                    error: 'Refresh token is undefined'
                };
            }
            
            // Верифицируем refresh token
            const tokenDetails = this.verifyToken(refreshToken);
            
            if (!tokenDetails.success) {
                return {
                    success: false,
                    error: 'Refresh token is not verified'
                };
            }
            
            // Генерируем новый payload
            const payload = { 
                id: tokenDetails.payload.id, 
                login: tokenDetails.payload.login 
            };
            
            // Новые токены (в точности как в старом коде)
            const accessToken = this.generateToken(payload, '14m');
            const newRefreshToken = this.generateToken(payload, '30d');
            
            return {
                success: true,
                token: accessToken,        // Новый access token
                refreshToken: newRefreshToken, // Новый refresh token
                payload: payload           // Данные пользователя
            };
            
        } catch (error) {
            console.error('💥 Ошибка в AdminService.refreshToken:', error);
            return {
                success: false,
                error: 'Internal server error'
            };
        }
    }
    
    /**
     * Получение информации об администраторе
     * @param {number} id - ID администратора
     * @returns {Promise<Object>} Данные администратора
     */
    async getAdmin(id) {
        try {
            const admin = await this.adminRepository.findById(id);
            
            if (!admin) {
                return null;
            }
            
            // Возвращаем в формате, совместимом со старым кодом
            return {
                id: admin.id,
                login: admin.login,
                password: admin.password,          // Для совместимости
                password_hash: admin.password_hash, // Для нового кода
                chatId: admin.chatId,
                socketId: admin.socketId,
                name: admin.name,
                is_active: admin.is_active
            };
            
        } catch (error) {
            console.error('❌ Ошибка получения администратора:', error);
            return null;
        }
    }
    
    /**
     * Получение всех администраторов
     * @returns {Promise<Array>} Список администраторов
     */
    async getAllAdmins() {
        try {
            const admins = await this.adminRepository.findAll();
            
            // Преобразуем в формат совместимый со старым кодом
            return admins.map(admin => ({
                id: admin.id,
                login: admin.login,
                password: admin.password,          // Для совместимости
                chatId: admin.chatId,
                socketId: admin.socketId
            }));
            
        } catch (error) {
            console.error('❌ Ошибка получения списка администраторов:', error);
            return [];
        }
    }
    
    /**
     * Обновление socketId администратора
     * @param {number} id - ID администратора
     * @param {string} socketId - Новый socketId
     */
    async updateSocketId(id, socketId) {
        try {
            await this.adminRepository.updateSocketId(id, socketId);
            console.log(`✅ SocketId обновлен для администратора ID: ${id}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Ошибка обновления socketId:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Генерация JWT токена
     * @param {Object} payload - Данные для токена
     * @param {string} expiresIn - Время жизни
     * @returns {string} JWT токен
     */
    generateToken(payload, expiresIn = '14m') {
        const jwt = require('jsonwebtoken');
        return jwt.sign(payload, this.jwtSecret, { expiresIn });
    }
    
    /**
     * Проверка JWT токена
     * @param {string} token - JWT токен
     * @returns {Object} Результат проверки
     */
    verifyToken(token) {
        try {
            const jwt = require('jsonwebtoken');
            const payload = jwt.verify(token, this.jwtSecret);
            return { success: true, payload };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Получение администратора по логину (старый метод для совместимости)
     * @param {string} login - Логин
     * @returns {Promise<Object>} Администратор
     */
    async getAdminByLogin(login) {
        try {
            const admin = await this.adminRepository.findByLogin(login);
            
            if (!admin) {
                return null;
            }
            
            // Возвращаем в старом формате
            return {
                id: admin.id,
                login: admin.login,
                password: admin.password || admin.password_hash,
                chatId: admin.chatId
            };
            
        } catch (error) {
            console.error('❌ Ошибка получения администратора по логину:', error);
            return null;
        }
    }
}

module.exports = AuthService;