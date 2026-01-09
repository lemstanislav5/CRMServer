// services/auth.service.js
class AuthService {
    constructor(userRepository, tokenService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }

    async authenticate(login, password) {
        // 1. Находим пользователя
        const user = await this.userRepository.findByLogin(login);
        
        // 2. Проверяем пароль
        if (!user || !await bcrypt.compare(password, user.password)) {
            return { success: false, error: 'Invalid credentials' };
        }
        
        // 3. Генерируем токен
        const token = this.tokenService.generateToken(user);
        
        // 4. Логируем событие
        this.logger.info(`User ${user.id} logged in`);
        
        return {
            success: true,
            token,
            user: { id: user.id, login: user.login, role: user.role }
        };
    }
}