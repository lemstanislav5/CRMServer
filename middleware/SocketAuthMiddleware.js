module.exports = class SocketAuthMiddleware {
  constructor({authService}) {
    this.authService = authService;
  }
  
  async verifySocket(socket, next) {
        try {
            const token = socket.handshake.query?.token;
            
            if (!token) {
                // Если токена нет, но подключение публичное - разрешаем
                console.log("🛑 Токен отсутствиет в сокет соединении");
                socket.isAdmin = false;
                return next();
            }

            const decoded = this.authService.verifyToken(token); //jwt.verify(token, process.env.JWT_SECRET);
            // Проверяем, не истек ли токен
            if (decoded.exp && Date.now() >= decoded.exp * 1000) {
                 console.log("🛑 Срок действия токена истек");
                return next(new Error('Token expired'));
            }
            console.log("🟢 Токен прошел верификацию при сокет соединении");
            socket.isAdmin = true;
            socket.decoded = decoded.payload;
            next();
        } catch (error) {
           console.log("🛑 Ошибка при верификации токена");
           return next(new Error('Token expired'));
        }
    }
}