class AdminRepository {
    constructor(db) {
        this.db = db;
    }

    async findByLogin(login) {
        const rows = await this.db.query(
            'SELECT * FROM admin WHERE login = ?',
            [login]
        );
        return rows[0] || null;
    }

    async findFirst() {
        const rows = await this.db.query(
            'SELECT * FROM admin LIMIT 1',
            []
        );
        return rows[0] || null;
    }

    async updateSocketId(adminId, socketId) {
        const result = await this.db.run(
            'UPDATE admin SET socketId = ? WHERE id = ?',
            [socketId, adminId]
        );
        return result;
    }

    async create(adminData) {
        const { login, password_hash, name, is_active } = adminData;
        
        const result = await this.db.run(
            `INSERT INTO admin (login, password_hash, name, is_active, created_at) 
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [login, password_hash, name, is_active || true]
        );
        
        return {
            id: result.lastID,
            login,
            name,
            is_active: is_active || true
        };
    }

    async findAdmin() {
        const rows = await this.db.query(
            'SELECT * FROM admin LIMIT 1',
            []
        );
        return rows[0] || null;
    }
}

module.exports = AdminRepository;