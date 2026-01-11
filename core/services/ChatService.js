class ChatService {
    constructor(repositories) {
        this.users = repositories.users;
        this.messages = repositories.messages;
        this.admin = repositories.admin;
    }
    
    /**
     * ОСНОВНАЯ ЛОГИКА: Отправка сообщения клиента администратору
     */
    async sendMessageToAdmin(fromId, toId, text, time) {
        console.log(`📨 Сообщение от ${fromId} к администратору`);
        
        // 1. Генерируем уникальный ID сообщения
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();
        
        // 2. Сохраняем сообщение в БД
        const dbResult = await this.messages.addMessage(fromId, toId, messageId, text, time, text.type, 0);
        console.log('Сообщение сохранилось как: ', dbResult)
        
        // 3. Получаем данные администратора
        const admin = await this.admin.findAdmin();
        console.log('Найден администратор: ', admin);
        if(admin.socketId == null || admin.setOnline){
            return console.log('Администратор не онлайн или его socketId = null');
        }
        
        // 4. Подготавливаем данные для отправки
        const messageForAdmin = {
            id: dbResult.lastID,
            messageId: messageId,
            fromId,
            fromName: clientData.name || 'Клиент',
            text: clientData.text,
            time: Date.now(),
            type: clientData.type || 'text',
            is_read: 0
        };
        
        // 5. Обновляем статус пользователя (если нужно)
        await this.users.setOnline(clientData.clientId, true);
        
        return {
            success: true,
            message: messageForAdmin,
            adminSocketId: admin.socketId, // Для отправки через WebSocket
            dbResult: dbResult
        };
    }
    
    /**
     * Отправка сообщения от администратора клиенту
     */
    async sendMessageToClient(adminId, clientId, text) {
        console.log(`📨 Ответ от администратора ${adminId} клиенту ${clientId}`);
        
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();
        
        const dbResult = await this.messages.addMessage(
            adminId,      // fromId
            clientId,     // toId
            messageId,
            text,
            timestamp,
            'text',
            0
        );
        
        // Получаем socketId клиента
        const userData = await this.users.findByChatId(clientId);
        const clientSocketId = userData[0]?.socketId || null;
        
        return {
            success: true,
            message: {
                id: dbResult.lastID,
                messageId: messageId,
                fromId: adminId,
                fromName: 'Администратор',
                text: text,
                time: timestamp,
                type: 'text',
                is_read: 0
            },
            clientSocketId: clientSocketId
        };
    }
    
    /**
     * Получить историю переписки
     */
    async getConversation(user1, user2) {
        return await this.messages.getConversation(user1, user2);
    }
    
    /**
     * Получить новые сообщения для пользователя
     */
    async getNewMessages(userId) {
        return await this.messages.getUnreadMessages(userId);
    }
}

module.exports = ChatService;