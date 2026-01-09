class MessageRepository {
    constructor(db) {
        this.db = db;
    }

    async addMessage(fromId, toId, messageId, text, time, type = 'text', is_read = 0) {
        const result = await this.db.run(
            `INSERT INTO messages (fromId, toId, messageId, text, time, type, is_read) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [fromId, toId, messageId, text, time, type, is_read]
        );
        
        return {
            fromId,
            toId,
            messageId,
            text,
            time,
            type,
            is_read
        };
    }

    async getConversation(user1, user2, limit = 100) {
        return await this.db.query(
            `SELECT * FROM messages 
             WHERE (fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?)
             ORDER BY time DESC
             LIMIT ?`,
            [user1, user2, user2, user1, limit]
        );
    }

    async getUnreadMessages(userId) {
        return await this.db.query(
            `SELECT * FROM messages 
             WHERE toId = ? AND is_read = 0
             ORDER BY time ASC`,
            [userId]
        );
    }

    async markAsRead(messageId) {
        const result = await this.db.run(
            `UPDATE messages SET is_read = 1, read_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [messageId]
        );
        return result;
    }

    async markConversationAsRead(user1, user2) {
        const result = await this.db.run(
            `UPDATE messages SET is_read = 1, read_at = CURRENT_TIMESTAMP 
             WHERE ((fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?)) 
             AND is_read = 0`,
            [user1, user2, user2, user1]
        );
        return result;
    }

    async deleteMessage(messageId) {
        const result = await this.db.run(
            'DELETE FROM messages WHERE id = ?',
            [messageId]
        );
        return result;
    }

    async getMessageById(messageId) {
        const rows = await this.db.query(
            'SELECT * FROM messages WHERE id = ?',
            [messageId]
        );
        return rows[0] || null;
    }

    async getRecentMessages(userId, limit = 20) {
        return await this.db.query(
            `SELECT * FROM messages 
             WHERE fromId = ? OR toId = ?
             ORDER BY time DESC
             LIMIT ?`,
            [userId, userId, limit]
        );
    }

    async getConversationPartners(userId) {
        return await this.db.query(
            `SELECT DISTINCT 
                CASE 
                    WHEN fromId = ? THEN toId 
                    ELSE fromId 
                END as partnerId,
                MAX(time) as last_message_time
             FROM messages 
             WHERE fromId = ? OR toId = ?
             GROUP BY partnerId
             ORDER BY last_message_time DESC`,
            [userId, userId, userId]
        );
    }

    async searchMessages(userId, searchText) {
        return await this.db.query(
            `SELECT * FROM messages 
             WHERE (fromId = ? OR toId = ?) 
             AND text LIKE ?
             ORDER BY time DESC`,
            [userId, userId, `%${searchText}%`]
        );
    }

    async getMessageCountBetweenUsers(user1, user2) {
        const rows = await this.db.query(
            `SELECT COUNT(*) as count FROM messages 
             WHERE (fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?)`,
            [user1, user2, user2, user1]
        );
        return rows[0]?.count || 0;
    }
}

module.exports = MessageRepository;