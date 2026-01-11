const AdminService = require('./AdminService');
const AuthService = require('./AuthService');
const ChatService = require('./ChatService');
const UserService = require('./UserService');
const SettingsService = require('./SettingsService');
const SocketAuthService = require('./SocketAuthService');

const init = (repositories, jwtSecret) => {
    // Затем остальные сервисы
    return {
        authService: new AuthService(repositories, jwtSecret),
        adminService: new AdminService(repositories),
        chatService: new ChatService(repositories),
        userService: new UserService(repositories),
    };
}

module.exports = { init };