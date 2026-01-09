// services/UserService.js - заглушка
class UserService {
    constructor(repositories) {
        this.users = repositories.users;
    }
    
    async getUser(chatId) {
        return await this.users.findByChatId(chatId);
    }
    
    async getAllUsers() {
         return await this.users.getAllUsers();
    }
}

module.exports = UserService;