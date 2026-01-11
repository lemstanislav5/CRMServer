// core/index.js
const config = require('../config');
const database = require('./database');
const repositories = require('./repositories');
const services = require('./services');
const controllers = require('./controllers');
const middleware = require('./middleware');

/**
 * Инициализирует все ядро приложения
 * @returns {Promise<Object>} Объект с инициализированными компонентами
 */
async function initCore() {
    console.log('🚀 Инициализация ядра приложения...');
    
    // 1. Инициализация базы данных
    const { connection } = await database.initDatabase(config.database);
    console.log('✅ База данных подключена');
    
    // 2. Инициализация репозиториев
    const repoInstances = repositories.init(connection);
    console.log('✅ Репозитории инициализированы');
    
    // 3. Инициализация сервисов
    const serviceInstances = services.init(repoInstances, config.jwtSecret || 'default-secret-key');
    console.log('✅ Сервисы инициализированы');
    
    // 4. Инициализация контроллеров
    const controllerInstances = controllers.init(serviceInstances);
    console.log('✅ Контроллеры инициализированы');

    // 5. Инициализация middleware
    const middlewareInstances = middleware.init(serviceInstances);
    console.log('✅ Middleware инициализированы');
    
    return {
        connection,
        controllers: controllerInstances, // ✅ Явно возвращаем controllers
        services: serviceInstances,
        repositories: repoInstances,
        middleware: middlewareInstances,
        
        // Экспортируем функции для graceful shutdown
        closeDatabase: () => database.closeDatabase(connection)
    };
}

module.exports = { initCore };