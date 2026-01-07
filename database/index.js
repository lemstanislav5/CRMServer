const createConnection = require('./connection');
const bcrypt = require('bcrypt');

let connection = null;
let repositories = null;

/**
 * Создать индексы для оптимизации
 */
async function createIndexes(db) {
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_chatId ON users(chatId)',
        'CREATE INDEX IF NOT EXISTS idx_users_socketId ON users(socketId)',
        'CREATE INDEX IF NOT EXISTS idx_users_online ON users(online)',
        'CREATE INDEX IF NOT EXISTS idx_messages_fromId ON messages(fromId)',
        'CREATE INDEX IF NOT EXISTS idx_messages_toId ON messages(toId)',
        'CREATE INDEX IF NOT EXISTS idx_messages_messageId ON messages(messageId)',
        'CREATE INDEX IF NOT EXISTS idx_messages_time ON messages(time)',
        'CREATE INDEX IF NOT EXISTS idx_admin_chatId ON admin(chatId)',
        'CREATE INDEX IF NOT EXISTS idx_admin_login ON admin(login)',
        'CREATE INDEX IF NOT EXISTS idx_dialogs_dialogId ON dialogs(dialogId)',
        'CREATE INDEX IF NOT EXISTS idx_dialogs_users ON dialogs(user1Id, user2Id)'
    ];
    
    for (const sql of indexes) {
        try {
            await db.run(sql);
        } catch (error) {
            console.warn(`⚠️  Не удалось создать индекс: ${error.message}`);
        }
    }
}

/**
 * 🔴 логин, пароль и id чата администратора "admin"
 */
async function seedInitialData(db) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin', saltRounds);
    
    const initialData = [
        // Администратор по умолчанию с хешированным паролем
        `INSERT OR IGNORE INTO admin (id, chatId, login, password) VALUES (1, 'admin', 'admin', '${hashedPassword}')`,
        
        // Настройки сокета
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

// ФУНКЦИИ РЕПОЗИТОРИЕВ ДОЛЖНЫ БЫТЬ ОБЪЯВЛЕНЫ ДО ИХ ИСПОЛЬЗОВАНИЯ

function createUserRepository(db) {
    return {
        async create(chatId, socketId, name = '') {
            return db.run(
                'INSERT INTO users (chatId, socketId, name) VALUES (?, ?, ?)',
                [chatId, socketId, name]
            );
        },
        
        async findByChatId(chatId) {
            const rows = await db.query(
                'SELECT * FROM users WHERE chatId = ?', 
                [chatId]
            );
            return rows[0];
        },
        
        async setOnline(chatId, online) {
            return db.run(
                'UPDATE users SET online = ? WHERE chatId = ?',
                [online ? 1 : 0, chatId]
            );
        },
        
        async getAll() {
            return db.query('SELECT * FROM users ORDER BY created_at DESC');
        },
    };
}

function createMessageRepository(db) {
    return {
        async create(fromId, toId, messageId, text, time, type = 'text', is_read = 0) {
            return db.run(
                `INSERT INTO messages (fromId, toId, messageId, text, time, type, is_read) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [fromId, toId, messageId, text, time, type, is_read]
            );
        },
        
        async getConversation(user1, user2) {
            return db.query(`
                SELECT * FROM messages 
                WHERE (fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?)
                ORDER BY time ASC
            `, [user1, user2, user2, user1]);
        }
    };
}

function createAdminRepository(db) {
    return {
        async findByLogin(login) {
            const rows = await db.query(
                'SELECT * FROM admin WHERE login = ?', 
                [login]
            );
            return rows[0];
        },

        async findFirst() {
            const rows = await db.query('SELECT * FROM admin LIMIT 1');
            return rows[0];
        },

        async findByChatId(chatId) {
            const rows = await db.query(
                'SELECT * FROM admin WHERE chatId = ?', 
                [chatId]
            );
            return rows[0];
        },

        async updateSocketId(adminId, socketId) {
            return db.run(
                'UPDATE admin SET socketId = ? WHERE id = ?',
                [socketId, adminId]
            );
        },

        async findAll() {
            return db.query('SELECT * FROM admin');
        },

        async create(adminData) {
            const { chatId, login, password, socketId = null } = adminData;
            
            return db.run(
                'INSERT INTO admin (chatId, login, password, socketId) VALUES (?, ?, ?, ?)',
                [chatId, login, password, socketId]
            );
        },

        async updatePassword(adminId, newPassword) {
            return db.run(
                'UPDATE admin SET password = ? WHERE id = ?',
                [newPassword, adminId]
            );
        },

        async findAdmin() {
            const rows = await db.query('SELECT * FROM admin LIMIT 1');
            return rows;
        }
    };
}

async function createTables(db) {
    const tables = [
        `CREATE TABLE IF NOT EXISTS setingsSocketUser (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT,
            ws TEXT,
            port TEXT
        )`,
        
        `CREATE TABLE IF NOT EXISTS setingsConsentUser (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            consentLink TEXT,
            policyLink TEXT
        )`,
        
        `CREATE TABLE IF NOT EXISTS setingsColorsUser (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conteiner TEXT,
            top TEXT,
            messages TEXT,
            fromId TEXT,
            text TEXT,
            notification TEXT,
            toId TEXT
        )`,
        
        `CREATE TABLE IF NOT EXISTS setingsQuestionsUser (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            offOn INTEGER
        )`,
        
        `CREATE TABLE IF NOT EXISTS setingsContactsUser (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            socialNetwork TEXT,
            link TEXT,
            offOn INTEGER
        )`,
        
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chatId TEXT NOT NULL,
            socketId TEXT,
            name TEXT,
            email TEXT,
            phone TEXT,
            online INTEGER DEFAULT 0,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )`,
        
        `CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fromId TEXT NOT NULL,
            toId TEXT NOT NULL,
            messageId TEXT UNIQUE,        
            text TEXT NOT NULL,
            time INTEGER NOT NULL,
            type TEXT DEFAULT 'text',
            is_read INTEGER DEFAULT 0
        )`,
        
        `CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chatId TEXT UNIQUE NOT NULL,
            socketId TEXT,
            login TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`,
        
        `CREATE TABLE IF NOT EXISTS dialogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dialogId TEXT UNIQUE NOT NULL,
            user1Id TEXT NOT NULL,
            user2Id TEXT NOT NULL,
            lastMessage TEXT,
            lastMessageTime INTEGER,
            unreadCount INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )`
    ];
    
    for (const sql of tables) {
        await db.run(sql);
    }
}

async function init(config) {
    console.log('🔄 Подключение к БД...');
    
    connection = createConnection(config.sqlite.path);
    
    // Создаём ВСЕ таблицы
    await createTables(connection);
    await createIndexes(connection);
    await seedInitialData(connection);
    
    // Создаём ВСЕ репозитории
    repositories = {
        users: createUserRepository(connection),
        messages: createMessageRepository(connection),
        admin: createAdminRepository(connection)  // ← Теперь функция объявлена раньше
    };
    
    console.log(`✅ БД: ${config.sqlite.path}`);
    console.log(`✅ Репозитории:`, Object.keys(repositories));
    return { connection, repositories };
}

async function close() {
    if (connection) {
        await connection.close();
        connection = null;
        repositories = null;
    }
}

module.exports = {
    init,
    close,
    getConnection: () => connection,
    getRepositories: () => repositories
};