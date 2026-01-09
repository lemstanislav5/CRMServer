// database/index.js
const createConnection = require('../connection');
const schema = require('./schema');
const indexes = require('./indexes');
const seeder = require('./seeder');

/**
 * Инициализирует базу данных: создает таблицы, индексы и заполняет начальными данными
 * @param {Object} config - Конфигурация базы данных
 * @param {string} config.sqlite.path - Путь к файлу SQLite
 * @returns {Promise<Object>} Объект с подключением к БД
 */
async function initDatabase(config) {
    console.log('🔄 Инициализация базы данных...');
    
    // Создаем подключение
    const connection = createConnection(config.sqlite.path);
    
    try {
        // Создаём таблицы
        console.log('🔄 Создание таблиц...');
        const tables = Object.values(schema);
        for (const sql of tables) {
            try {
                await connection.run(sql);
            } catch (error) {
                console.error(`❌ Ошибка создания таблицы: ${error.message}`);
                throw error;
            }
        }
        
        // Создаём индексы
        console.log('🔄 Создание индексов...');
        for (const sql of indexes) {
            try {
                await connection.run(sql);
            } catch (error) {
                console.warn(`⚠️  Не удалось создать индекс: ${error.message}`);
            }
        }
        
        // Заполняем начальными данными
        console.log('🔄 Заполнение начальными данными...');
        await seeder(connection);
        
        console.log('✅ База данных успешно инициализирована');
        return { connection };
        
    } catch (error) {
        console.error('❌ Ошибка инициализации БД:', error);
        // Закрываем соединение при ошибке
        try {
            await connection.close();
        } catch (closeError) {
            console.warn('⚠️  Не удалось закрыть соединение при ошибке:', closeError.message);
        }
        throw error;
    }
}

/**
 * Закрывает подключение к базе данных
 * @param {Object} connection - Подключение к БД
 * @returns {Promise<void>}
 */
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

// Экспортируем только функции
module.exports = {
    initDatabase,
    closeDatabase,
    
    // Экспортируем схему и другие утилиты для документации/тестов
    schema,
    indexes,
    seeder,
    
    // Экспортируем createConnection для прямого создания подключения (если нужно)
    createConnection
};