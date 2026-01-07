// database/repositories/SettingsRepository.js
module.exports = function createSettingsRepository(db) {
    return {
        // Socket settings
        async getSocketSettings() {
            return db.query('SELECT * FROM setingsSocketUser LIMIT 1');
        },
        
        async updateSocketSettings(data) {
            return db.run(
                'UPDATE setingsSocketUser SET url = ?, ws = ?, port = ? WHERE id = 1',
                [data.url, data.ws, data.port]
            );
        },
        
        // Colors settings
        async getColorSettings() {
            return db.query('SELECT * FROM setingsColorsUser LIMIT 1');
        },
        
        async updateColors(colors) {
            return db.run(
                `UPDATE setingsColorsUser SET 
                 conteiner = ?, top = ?, messages = ?, fromId = ?, 
                 text = ?, notification = ?, toId = ? 
                 WHERE id = 1`,
                [
                    colors.conteiner, colors.top, colors.messages,
                    colors.fromId, colors.text, colors.notification, colors.toId
                ]
            );
        },
        
        // Questions settings
        async getQuestions() {
            return db.query('SELECT * FROM setingsQuestionsUser WHERE offOn = 1 ORDER BY id');
        },
        
        async getAllQuestions() {
            return db.query('SELECT * FROM setingsQuestionsUser ORDER BY id');
        },
        
        async updateQuestion(questionData) {
            if (questionData.id) {
                // Обновление существующего
                return db.run(
                    'UPDATE setingsQuestionsUser SET question = ?, offOn = ? WHERE id = ?',
                    [questionData.question, questionData.offOn || 1, questionData.id]
                );
            } else {
                // Добавление нового
                return db.run(
                    'INSERT INTO setingsQuestionsUser (question, offOn) VALUES (?, ?)',
                    [questionData.question, questionData.offOn || 1]
                );
            }
        },
        
        async deleteQuestion(id) {
            return db.run('DELETE FROM setingsQuestionsUser WHERE id = ?', [id]);
        },
        
        // Contacts settings
        async getContacts() {
            return db.query('SELECT * FROM setingsContactsUser WHERE offOn = 1 ORDER BY id');
        },
        
        async getAllContacts() {
            return db.query('SELECT * FROM setingsContactsUser ORDER BY id');
        },
        
        async updateContact(contactData) {
            if (contactData.id) {
                // Обновление существующего
                return db.run(
                    'UPDATE setingsContactsUser SET socialNetwork = ?, link = ?, offOn = ? WHERE id = ?',
                    [contactData.socialNetwork, contactData.link, contactData.offOn || 1, contactData.id]
                );
            } else {
                // Добавление нового
                return db.run(
                    'INSERT INTO setingsContactsUser (socialNetwork, link, offOn) VALUES (?, ?, ?)',
                    [contactData.socialNetwork, contactData.link, contactData.offOn || 1]
                );
            }
        },
        
        async deleteContact(id) {
            return db.run('DELETE FROM setingsContactsUser WHERE id = ?', [id]);
        },
        
        // Consent settings
        async getConsentSettings() {
            return db.query('SELECT * FROM setingsConsentUser LIMIT 1');
        },
        
        async updateConsent(consentData) {
            return db.run(
                'UPDATE setingsConsentUser SET consentLink = ?, policyLink = ? WHERE id = 1',
                [consentData.consentLink, consentData.policyLink]
            );
        }
    };
};