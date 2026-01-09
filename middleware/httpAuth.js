// middleware/authHttp.js
const jwt = require('jsonwebtoken');

/**
 * Middleware для аутентификации HTTP запросов
 * Проверяет JWT токен и добавляет данные пользователя в req.user
 */
const authHttp = (req, res, next) => {
  try {
    // 1. Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Требуется аутентификация',
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

    // 3. Валидируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.PRIVATE_KEY);

    // 4. Проверяем срок действия
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Срок действия токена истек',
        code: 'TOKEN_EXPIRED'
      });
    }

    // 5. Проверяем обязательные поля
    if (!decoded.userId || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: 'Невалидный токен: отсутствуют обязательные поля',
        code: 'INVALID_TOKEN_PAYLOAD'
      });
    }

    // 6. Добавляем данные пользователя в запрос
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
      isAuthenticated: true,
      // Дополнительные данные из токена
      ...(decoded.permissions && { permissions: decoded.permissions }),
      ...(decoded.department && { department: decoded.department })
    };

    // 7. Логируем успешную аутентификацию (опционально)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH] User ${decoded.userId} (${decoded.role}) authenticated`);
    }

    next();
  } catch (error) {
    // 8. Обрабатываем различные ошибки
    let statusCode = 401;
    let message = 'Ошибка аутентификации';
    let code = 'AUTH_ERROR';

    switch (error.name) {
      case 'JsonWebTokenError':
        message = 'Невалидный токен';
        code = 'INVALID_TOKEN';
        break;
      case 'TokenExpiredError':
        message = 'Срок действия токена истек';
        code = 'TOKEN_EXPIRED';
        break;
      case 'NotBeforeError':
        message = 'Токен еще не активен';
        code = 'TOKEN_NOT_ACTIVE';
        break;
      default:
        statusCode = 500;
        message = 'Внутренняя ошибка сервера при аутентификации';
        code = 'SERVER_ERROR';
    }

    // Логируем ошибку
    console.error(`[AUTH ERROR] ${error.name}: ${error.message}`);

    return res.status(statusCode).json({
      success: false,
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && { detail: error.message })
    });
  }
};

/**
 * Middleware для проверки роли пользователя
 * @param {Array|string} roles - Разрешенные роли
 */
authHttp.requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Требуется аутентификация',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware для проверки прав доступа
 * @param {Array} permissions - Требуемые права
 */
authHttp.requirePermission = (permissions) => {
  const requiredPerms = Array.isArray(permissions) ? permissions : [permissions];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Требуется аутентификация',
        code: 'AUTH_REQUIRED'
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasAllPermissions = requiredPerms.every(perm => userPermissions.includes(perm));

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав доступа',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredPermissions: requiredPerms,
        userPermissions
      });
    }

    next();
  };
};

/**
 * Middleware для опциональной аутентификации
 * (позволяет продолжить без аутентификации, но добавляет user если токен есть)
 */
authHttp.optional = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    req.user = { isAuthenticated: false };
    return next();
  }

  try {
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      req.user = { isAuthenticated: false };
      return next();
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.PRIVATE_KEY);

    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
      isAuthenticated: true,
      ...(decoded.permissions && { permissions: decoded.permissions })
    };
  } catch (error) {
    // В случае ошибки - считаем пользователя неаутентифицированным
    req.user = { isAuthenticated: false };
  }

  next();
};

module.exports = authHttp;