const sqlite3 = require('sqlite3').verbose();

module.exports = function createConnection(dbPath) {
    const db = new sqlite3.Database(dbPath);
    
    return {
        query(sql, params = []) {
            return new Promise((resolve, reject) => {
                db.all(sql, params, (err, rows) => {
                    err ? reject(err) : resolve(rows);
                });
            });
        },
        
        run(sql, params = []) {
            return new Promise((resolve, reject) => {
                db.run(sql, params, function(err) {
                    err ? reject(err) : resolve({
                        lastID: this.lastID,
                        changes: this.changes
                    });
                });
            });
        },
        
        close() {
            return new Promise((resolve) => {
                db.close(() => resolve());
            });
        }
    };
};