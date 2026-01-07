// services/UserService.js - заглушка
class UserService {
    constructor(repositories) {
        this.users = repositories.users;
    }
    
    async getUser(chatId) {
        return await this.users.findByChatId(chatId);
    }
    
    async getAllUsers() {
        // Временный метод - добавим позже в репозиторий
        const connection = require('../database').getConnection();
        return await connection.query('SELECT * FROM users');
    }
}

module.exports = UserService;