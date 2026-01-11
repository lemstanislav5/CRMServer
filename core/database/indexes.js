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

module.exports = indexes;