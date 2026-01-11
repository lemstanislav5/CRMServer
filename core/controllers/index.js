const AuthController = require('./AuthСontroller');
const AdminController = require('./AdminController');

const init = (services) => {
    return {
        authController: new AuthController(services),
        adminController: new AdminController(services)
    };
}

module.exports = { init };
