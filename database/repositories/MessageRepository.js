module.exports = function createMessageRepository(db) {
    return {
        /**
         * Добавить сообщение (как в вашем оригинальном dataBase.js)
         */
        async addMessage(fromId, toId, messageId, text, time, type = 'text', is_read = 0) {
            return db.run(
                `INSERT INTO messages (fromId, toId, messageId, text, time, type, is_read) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [fromId, toId, messageId, text, time, type, is_read]
            );
        },
        
        /**
         * Найти сообщение по messageId
         */
        async findMessage(messageId) {
            return db.query(
                'SELECT * FROM messages WHERE messageId = ?',
                [messageId]
            );
        },
        
        /**
         * Получить историю между двумя пользователями
         */
        async getConversation(user1, user2, limit = 100) {
            return db.query(
                `SELECT * FROM messages 
                 WHERE (fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?)
                 ORDER BY time ASC
                 LIMIT ?`,
                [user1, user2, user2, user1, limit]
            );
        },
        
        /**
         * Отметить сообщения как прочитанные
         */
        async markAsRead(userId, interlocutorId) {
            return db.run(
                `UPDATE messages SET is_read = 1 
                 WHERE toId = ? AND fromId = ? AND is_read = 0`,
                [userId, interlocutorId]
            );
        },
        
        /**
         * Получить непрочитанные сообщения
         */
        async getUnreadMessages(userId) {
            return db.query(
                'SELECT * FROM messages WHERE toId = ? AND is_read = 0 ORDER BY time ASC',
                [userId]
            );
        }
    };
};