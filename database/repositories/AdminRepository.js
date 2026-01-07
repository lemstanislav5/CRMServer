class AdminRepository {
    constructor(db) {
        this.db = db;
    }

    async findByLogin(login) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM admins WHERE login = ? AND is_active = 1',
                [login],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }

    async findFirst() {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM admins LIMIT 1',
                [],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }

    async updateLastLogin(adminId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                [adminId],
                function(err) {
                    if (err) reject(err);
                    resolve(this);
                }
            );
        });
    }

    async updateSocketId(adminId, socketId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE admins SET socket_id = ? WHERE id = ?',
                [socketId, adminId],
                function(err) {
                    if (err) reject(err);
                    resolve(this);
                }
            );
        });
    }

    async create(adminData) {
        return new Promise((resolve, reject) => {
            const { login, password_hash, name, is_active } = adminData;
            
            this.db.run(
                `INSERT INTO admins (login, password_hash, name, is_active, created_at) 
                 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [login, password_hash, name, is_active || true],
                function(err) {
                    if (err) reject(err);
                    resolve({
                        id: this.lastID,
                        login,
                        name,
                        is_active
                    });
                }
            );
        });
    }

    async findAdmin() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM admins WHERE is_active = 1 LIMIT 1',
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    }
}

module.exports = AdminRepository;
// // database/repositories/AdminRepository.js
// module.exports = function createAdminRepository(db) {
//     return {
//         /**
//          * Найти администратора
//          */
//         async findAdmin() {
//             return db.query('SELECT * FROM admin LIMIT 1');
//         },
        
//         /**
//          * Обновить socketId администратора
//          */
//         async updateSocketId(socketId) {
//             return db.run(
//                 'UPDATE admin SET socketId = ? WHERE id = 1',
//                 [socketId]
//             );
//         },
        
//         /**
//          * Получить администратора по socketId
//          */
//         async findBySocketId(socketId) {
//             return db.query(
//                 'SELECT * FROM admin WHERE socketId = ?',
//                 [socketId]
//             );
//         },
        
//         /**
//          * Получить администратора по логину (для аутентификации)
//          */
//         async findByLogin(login) {
//             return db.query(
//                 'SELECT * FROM admin WHERE login = ?',
//                 [login]
//             );
//         }
//     };
// };