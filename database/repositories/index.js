// const config = require('../../config');
// const createConnection = require('../connection');
const AdminRepository = require('./AdminRepository');
const UserRepository = require('./UserRepository');
const MessageRepository = require('./MessageRepository');

// connection = createConnection(config.database.sqlite.path);

// const repositories = {
//     users: new UserRepository(connection),
//     admin: new AdminRepository(connection),
//     messages: new MessageRepository(connection),
// };
// module.exports = repositories;

module.exports = { AdminRepository, UserRepository, MessageRepository }
