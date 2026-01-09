// middleware/auth.js - Middleware для аутентификации HTTP запросов
const jwt = require('jsonwebtoken');

/**
 * Фабрика middleware аутентификации
 * @param {AuthService} authService - Сервис аутентификации
 * @returns {Function} Express middleware
 */
module.exports = (authService) => {
    if (!authService) {
        throw new Error('AuthService is required for auth middleware');
    }

    /**
     * Middleware для обязательной аутентификации
     */
    const requireAuth = async (req, res, next) => {
        try {
            // 1. Получаем токен из заголовка Authorization
            const authHeader = req.headers.authorization;
            
            if (!authHeader) {
                return res.status(401).json({
                    success: false,
                    message: 'Требуется аутентификация. Добавьте заголовок Authorization',
                    code: 'AUTH_REQUIRED'
                });
            }

            // 2. Проверяем формат: Bearer <token>
            const parts = authHeader.split(' ');
            
            if (parts.length !== 2 || parts[0] !== 'Bearer') {
                return res.status(401).json({
                    success: false,
                    message: 'Неверный формат токена. Используйте: Bearer <token>',
                    code: 'INVALID_TOKEN_FORMAT'
                });
            }

            const token = parts[1];

            // 3. Проверяем токен через AuthService
            const verificationResult = authService.verifyToken(token);
            
            if (!verificationResult.success) {
                return res.status(401).json({
                    success: false,
                    message: verificationResult.error || 'Невалидный токен',
                    code: verificationResult.code || 'INVALID_TOKEN'
                });
            }

            // 4. Получаем информацию о пользователе
            const userInfo = await authService.getUserInfo(verificationResult.payload.id);
            
            if (!userInfo) {
                return res.status(401).json({
                    success: false,
                    message: 'Пользователь не найден',
                    code: 'USER_NOT_FOUND'
                });
            }

            // 5. Проверяем активность пользователя
            if (!userInfo.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Учетная запись заблокирована',
                    code: 'ACCOUNT_DISABLED'
                });
            }

            // 6. Добавляем пользователя в запрос
            req.user = {
                id: userInfo.id,
                login: userInfo.login,
                name: userInfo.name,
                email: userInfo.email,
                role: userInfo.role,
                isAuthenticated: true,
                tokenData: verificationResult.payload
            };

            // 7. Логируем (опционально)
            if (process.env.NODE_ENV === 'development') {
                console.log(`[AUTH] User ${userInfo.id} (${userInfo.role}) authenticated for ${req.method} ${req.path}`);
            }

            next();

        } catch (error) {
            console.error('💥 Ошибка middleware аутентификации:', error);
            
            return res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка при аутентификации',
                code: 'AUTH_INTERNAL_ERROR'
            });
        }
    };

    /**
     * Middleware для опциональной аутентификации
     * (продолжает выполнение даже если токен отсутствует или невалиден)
     */
    const optionalAuth = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader) {
                req.user = { isAuthenticated: false };
                return next();
            }

            const parts = authHeader.split(' ');
            
            if (parts.length !== 2 || parts[0] !== 'Bearer') {
                req.user = { isAuthenticated: false };
                return next();
            }

            const token = parts[1];
            const verificationResult = authService.verifyToken(token);
            
            if (!verificationResult.success) {
                req.user = { isAuthenticated: false };
                return next();
            }

            const userInfo = await authService.getUserInfo(verificationResult.payload.id);
            
            if (!userInfo || !userInfo.isActive) {
                req.user = { isAuthenticated: false };
                return next();
            }

            req.user = {
                id: userInfo.id,
                login: userInfo.login,
                name: userInfo.name,
                email: userInfo.email,
                role: userInfo.role,
                isAuthenticated: true,
                tokenData: verificationResult.payload
            };

            next();

        } catch (error) {
            // В случае ошибки - считаем неаутентифицированным
            req.user = { isAuthenticated: false };
            next();
        }
    };

    /**
     * Middleware для проверки роли пользователя
     * @param {string|string[]} allowedRoles - Разрешенные роли
     */
    const requireRole = (allowedRoles) => {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        return async (req, res, next) => {
            // Сначала проверяем аутентификацию
            if (!req.user || !req.user.isAuthenticated) {
                return res.status(401).json({
                    success: false,
                    message: 'Требуется аутентификация',
                    code: 'AUTH_REQUIRED'
                });
            }

            // Проверяем роль
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Недостаточно прав',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    requiredRoles: roles,
                    userRole: req.user.role
                });
            }

            next();
        };
    };

    /**
     * Middleware для проверки, что пользователь - администратор
     */
    const requireAdmin = requireRole('admin');

    /**
     * Middleware для проверки прав доступа по действиям
     * @param {string|string[]} requiredPermissions - Требуемые права
     */
    const requirePermission = (requiredPermissions) => {
        const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
        
        return async (req, res, next) => {
            if (!req.user || !req.user.isAuthenticated) {
                return res.status(401).json({
                    success: false,
                    message: 'Требуется аутентификация',
                    code: 'AUTH_REQUIRED'
                });
            }

            // Проверяем права (можно расширить логикой из БД)
            if (req.user.role === 'admin') {
                // Администратор имеет все права
                return next();
            }

            // Для других ролей можно реализовать проверку конкретных прав
            // const userPermissions = req.user.permissions || [];
            // const hasPermission = permissions.every(perm => userPermissions.includes(perm));
            
            // if (!hasPermission) {
            //     return res.status(403).json({
            //         success: false,
            //         message: 'Недостаточно прав доступа',
            //         code: 'INSUFFICIENT_PERMISSIONS'
            //     });
            // }

            // Временная реализация - для не-админов проверяем роль
            if (req.user.role === 'manager') {
                // Менеджер имеет ограниченные права
                const managerPermissions = ['users:read', 'messages:read', 'messages:write'];
                const hasAllPermissions = permissions.every(perm => managerPermissions.includes(perm));
                
                if (!hasAllPermissions) {
                    return res.status(403).json({
                        success: false,
                        message: 'Недостаточно прав доступа для менеджера',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    });
                }
            } else {
                // Для других ролей запрещаем по умолчанию
                return res.status(403).json({
                    success: false,
                    message: 'Недостаточно прав доступа',
                    code: 'INSUFFICIENT_PERMISSIONS'
                });
            }

            next();
        };
    };

    /**
     * Middleware для проверки, что пользователь обращается к своим данным
     * @param {string} idParamName - Имя параметра с ID в URL
     */
    const requireSelfOrAdmin = (idParamName = 'id') => {
        return async (req, res, next) => {
            if (!req.user || !req.user.isAuthenticated) {
                return res.status(401).json({
                    success: false,
                    message: 'Требуется аутентификация',
                    code: 'AUTH_REQUIRED'
                });
            }

            const requestedId = req.params[idParamName] || req.body.userId;
            
            // Администратор может обращаться к любым данным
            if (req.user.role === 'admin') {
                return next();
            }

            // Проверяем, что пользователь обращается к своим данным
            if (parseInt(requestedId) !== parseInt(req.user.id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Вы можете обращаться только к своим данным',
                    code: 'ACCESS_DENIED'
                });
            }

            next();
        };
    };

    // Возвращаем объект с middleware функциями
    return {
        // Основные middleware
        requireAuth,
        optionalAuth,
        
        // Middleware для проверки прав
        requireRole,
        requireAdmin,
        requirePermission,
        requireSelfOrAdmin,
        
        // Короткие алиасы для удобства
        auth: requireAuth,
        optional: optionalAuth,
        admin: requireAdmin,
        role: requireRole,
        permission: requirePermission,
        selfOrAdmin: requireSelfOrAdmin
    };
};

// Экспорт для использования без фабрики (для обратной совместимости)
module.exports.default = (authService) => module.exports(authService);