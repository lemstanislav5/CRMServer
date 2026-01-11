// const config = require('../../config');
// const createConnection = require('../connection');
const AdminRepository = require('./AdminRepository');
const UserRepository = require('./UserRepository');
const MessageRepository = require('./MessageRepository');

const init = (connection) => {
    return {
        adminRepository: new AdminRepository(connection),
        usersRepository: new UserRepository(connection),
        messagesRepository: new MessageRepository(connection),
    };
}

module.exports = { init };
