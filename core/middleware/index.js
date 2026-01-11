const SocketAuthMiddleware = require('./SocketAuthMiddleware');

const init = (services) => {
    return {
        socketAuthMiddleware: new SocketAuthMiddleware(services),
    };
}

module.exports = { init };