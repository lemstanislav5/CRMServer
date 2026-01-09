const schema = {
    users: `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chatId TEXT NOT NULL,
            socketId TEXT,
            name TEXT,
            email TEXT,
            phone TEXT,
            online INTEGER DEFAULT 0,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `,

    messages: `
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fromId TEXT NOT NULL,
            toId TEXT NOT NULL,
            messageId TEXT UNIQUE,
            text TEXT NOT NULL,
            time INTEGER NOT NULL,
            type TEXT DEFAULT 'text',
            is_read INTEGER DEFAULT 0
        )
    `,

    admin: `
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chatId TEXT UNIQUE,
            socketId TEXT,
            login TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            online INTEGER DEFAULT 0
        )
    `,

    setingsSocketUser: `
        CREATE TABLE IF NOT EXISTS setingsSocketUser (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT,
            ws TEXT,
            port TEXT
        )
    `,

    setingsConsentUser: `
        CREATE TABLE IF NOT EXISTS setingsConsentUser (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            consentLink TEXT,
            policyLink TEXT
        )
    `,

    setingsColorsUser: `
        CREATE TABLE IF NOT EXISTS setingsColorsUser (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conteiner TEXT,
            top TEXT,
            messages TEXT,
            fromId TEXT,
            text TEXT,
            notification TEXT,
            toId TEXT
        )
    `,

    setingsQuestionsUser: `
        CREATE TABLE IF NOT EXISTS setingsQuestionsUser (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            offOn INTEGER
        )
    `,

    setingsContactsUser: `
        CREATE TABLE IF NOT EXISTS setingsContactsUser (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            socialNetwork TEXT,
            link TEXT,
            offOn INTEGER
        )
    `,

    dialogs: `
        CREATE TABLE IF NOT EXISTS dialogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dialogId TEXT UNIQUE NOT NULL,
            user1Id TEXT NOT NULL,
            user2Id TEXT NOT NULL,
            lastMessage TEXT,
            lastMessageTime INTEGER,
            unreadCount INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `
};

module.exports = schema;