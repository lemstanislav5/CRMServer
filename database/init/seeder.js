const bcrypt = require('bcrypt');

async function seedInitialData(db) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin', saltRounds);
    
    const initialData = [
        // Администратор по умолчанию с хешированным паролем
        `INSERT OR IGNORE INTO admin (login, password_hash, online) VALUES ('admin', '${hashedPassword}', 0)`,
        `INSERT OR IGNORE INTO setingsSocketUser (id, url, ws, port) VALUES (1, 'localhost', 'ws', '4000')`,
        
        // Настройки соглашений
        `INSERT OR IGNORE INTO setingsConsentUser (id, consentLink, policyLink) VALUES (1, '', '')`,
        
        // Цвета
        `INSERT OR IGNORE INTO setingsColorsUser (id, conteiner, top, messages, fromId, text, notification, toId) VALUES (1, '#fff', '#fff', '#303245', '#2a306b', '#5f3288', '#333', '#5e785e')`,
        
        // Вопросы
        `INSERT OR IGNORE INTO setingsQuestionsUser (id, question, offOn) VALUES (1, 'Здравствуйте!', 1)`,
        
        // Контакты
        `INSERT OR IGNORE INTO setingsContactsUser (id, socialNetwork, link, offOn) VALUES (1, 'Telegram', 'https://Telegram.com', 1)`,
        `INSERT OR IGNORE INTO setingsContactsUser (id, socialNetwork, link, offOn) VALUES (2, 'VKontakte', 'https://VKontakte.com', 1)`,
        `INSERT OR IGNORE INTO setingsContactsUser (id, socialNetwork, link, offOn) VALUES (3, 'WhatsApp', 'https://WhatsApp.com', 1)`
    ];
    
    for (const sql of initialData) {
        try {
            await db.run(sql);
        } catch (error) {
            console.warn(`⚠️  Не удалось вставить данные: ${error.message}`);
        }
    }
}

module.exports = seedInitialData;