class SocketAuthService {
    constructor(authService) {
        this.authService = authService;
    }

    /**
     * Middleware для аутентификации WebSocket соединений
     */
    async socketAuthentication(socket, next) {
        try {
            // 1. Получаем токен из handshake запроса
            const token = socket.handshake.auth?.token || 
                         socket.handshake.query?.token;

            if (!token) {
                // Если нет токена - это клиентское соединение
                socket.isAdmin = false;
                socket.authentication = false;
                return next();
            }

            // 2. Верифицируем токен
            const verification = this.authService.verifyToken(token);
            
            if (!verification.success) {
                socket.isAdmin = false;
                socket.authentication = false;
                return next(new Error('Недействительный токен'));
            }

            // 3. Проверяем роль администратора
            if (verification.payload.role !== 'admin') {
                socket.isAdmin = false;
                socket.authentication = false;
                return next(new Error('Доступ только для администраторов'));
            }

            // 4. Устанавливаем данные администратора в сокет
            socket.isAdmin = true;
            socket.authentication = true;
            socket.adminId = verification.payload.id;
            socket.adminLogin = verification.payload.login;

            next();

        } catch (error) {
            console.error('Ошибка аутентификации сокета:', error);
            next(new Error('Ошибка аутентификации'));
        }
    }

    /**
     * Middleware для проверки прав администратора
     */
    requireAdmin(socket, next) {
        if (!socket.isAdmin) {
            return next(new Error('Требуются права администратора'));
        }
        next();
    }
}

module.exports = SocketAuthService;