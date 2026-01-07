// services/SettingsService.js - минимальная рабочая версия
class SettingsService {
    constructor(repositories) {
        this.repositories = repositories;
    }
    
    async getAllSettings() {
        console.log('🔄 Получение всех настроек...');
        try {
            // Проверяем, есть ли репозиторий настроек
            if (!this.repositories.settings) {
                console.log('⚠️  Репозиторий настроек не найден');
                return {
                    socket: { url: 'localhost', ws: 'ws', port: '4000' },
                    colors: {},
                    consent: {},
                    questions: [],
                    contacts: []
                };
            }
            
            // Пробуем получить настройки
            const socketSettings = await this.repositories.settings.getSocketSettings?.() || [];
            const colorSettings = await this.repositories.settings.getColorSettings?.() || [];
            const questions = await this.repositories.settings.getQuestions?.() || [];
            const contacts = await this.repositories.settings.getContacts?.() || [];
            
            return {
                socket: socketSettings[0] || { url: 'localhost', ws: 'ws', port: '4000' },
                colors: colorSettings[0] || {},
                consent: {},
                questions: questions,
                contacts: contacts
            };
            
        } catch (error) {
            console.error('❌ Ошибка получения настроек:', error.message);
            return {
                socket: { url: 'localhost', ws: 'ws', port: '4000' },
                colors: {},
                consent: {},
                questions: [],
                contacts: []
            };
        }
    }
    
    async getPublicSettings() {
        console.log('🔄 Получение публичных настроек...');
        try {
            const allSettings = await this.getAllSettings();
            return {
                colors: allSettings.colors || {},
                questions: allSettings.questions || [],
                contacts: allSettings.contacts || []
            };
        } catch (error) {
            console.error('❌ Ошибка получения публичных настроек:', error);
            return {
                colors: {},
                questions: [],
                contacts: []
            };
        }
    }
    
    async updateSocketSettings(data) {
        console.log('🔄 Обновление настроек сокета:', data);
        try {
            if (this.repositories.settings?.updateSocketSettings) {
                const result = await this.repositories.settings.updateSocketSettings(data);
                return { success: true, changes: result.changes };
            }
            return { success: true, message: 'Settings repository not available' };
        } catch (error) {
            console.error('❌ Ошибка обновления настроек:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = SettingsService;