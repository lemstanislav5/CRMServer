// core/database/index.js
const createConnection = require('./connection');
const schema = require('./schema');
const indexes = require('./indexes');
const seeder = require('./seeder');

async function initDatabase(dbConfig) {
    console.log('🔄 Инициализация базы данных...');
    
    const connection = createConnection(dbConfig.sqlite.path);
    
    try {
        // Создаём таблицы
        for (const sql of Object.values(schema)) {
            await connection.run(sql);
        }
        
        // Создаём индексы
        for (const sql of indexes) {
            try {
                await connection.run(sql);
            } catch (error) {
                console.warn(`⚠️  Не удалось создать индекс: ${error.message}`);
            }
        }
        
        // Заполняем начальными данными
        await seeder(connection);
        
        console.log('✅ База данных успешно инициализирована');
        return { connection };
        
    } catch (error) {
        console.error('❌ Ошибка инициализации БД:', error);
        await connection.close();
        throw error;
    }
}

async function closeDatabase(connection) {
    if (connection && typeof connection.close === 'function') {
        try {
            await connection.close();
            console.log('🔌 Соединение с БД закрыто');
        } catch (error) {
            console.error('❌ Ошибка закрытия соединения:', error);
        }
    }
}

module.exports = {
    initDatabase,
    closeDatabase,
    createConnection
};