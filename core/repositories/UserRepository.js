class UserRepository {
    constructor(db) {
        this.db = db;
    }

    async create(chatId, socketId, name = '') {
        const result = await this.db.run(
            'INSERT INTO users (chatId, socketId, name, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
            [chatId, socketId, name]
        );
        
        return {
            id: result.lastID,
            chatId,
            socketId,
            name,
            created_at: new Date().toISOString()
        };
    }

    async findByChatId(chatId) {
        const rows = await this.db.query(
            'SELECT * FROM users WHERE chatId = ?',
            [chatId]
        );
        return rows[0] || null;
    }

    async setOnline(chatId, online) {
        const result = await this.db.run(
            'UPDATE users SET online = ?, updated_at = CURRENT_TIMESTAMP WHERE chatId = ?',
            [online ? 1 : 0, chatId]
        );
        return result;
    }

    async getAll() {
        return await this.db.query(
            'SELECT * FROM users ORDER BY created_at DESC',
            []
        );
    }

    async updateSocketId(chatId, socketId) {
        const result = await this.db.run(
            'UPDATE users SET socketId = ?, updated_at = CURRENT_TIMESTAMP WHERE chatId = ?',
            [socketId, chatId]
        );
        return result;
    }

    async findBySocketId(socketId) {
        const rows = await this.db.query(
            'SELECT * FROM users WHERE socketId = ?',
            [socketId]
        );
        return rows[0] || null;
    }

    async removeBySocketId(socketId) {
        const result = await this.db.run(
            'DELETE FROM users WHERE socketId = ?',
            [socketId]
        );
        return result;
    }

    async getOnlineUsers() {
        return await this.db.query(
            'SELECT * FROM users WHERE online = 1 ORDER BY name',
            []
        );
    }

    async updateName(chatId, name) {
        const result = await this.db.run(
            'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE chatId = ?',
            [name, chatId]
        );
        return result;
    }

    async getAllUsers() {
        return await this.db.query(
            'SELECT * FROM users',
            []
        );
    } 
}

module.exports = UserRepository;