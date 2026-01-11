/**
 * Мидлвер для аутентификации запросов
 */
class HttpAuthMiddleware {
    constructor({ authService }) {
        if (!authService) {
            throw new Error('AuthService is required');
        }
        this.authService = authService;
    }

    /**
     * Основной метод мидлвера.
     * Используем стрелочную функцию, чтобы сохранить контекст 'this' 
     * при передаче метода в роутер Express.
     */
    handle = async (req, res, next) => {
        try {
            // Предполагаем, что логика верификации находится в authService
            // Например, проверка заголовка Authorization или Cookies
            const user = await this.authService.verify(req);

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Сохраняем данные пользователя в объект запроса для дальнейшего использования
            req.user = user;

            next();
        } catch (error) {
            // Логируем ошибку и возвращаем ответ
            console.error('Auth Middleware Error:', error.message);
            res.status(401).json({ error: 'Authentication failed' });
        }
    };
}

module.exports = HttpAuthMiddleware;
