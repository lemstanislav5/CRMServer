const SocketAuthMiddleware = require('./SocketAuthMiddleware');
const HttpAuthMiddleware = require('./HttpAuthMiddleware');

const init = (services) => {
    return {
        socketAuthMiddleware: new SocketAuthMiddleware(services),
        httpAuthMiddleware: new HttpAuthMiddleware(services),
    };
}

module.exports = { init };