// services/SettingsService.js
class SettingsService {
    constructor(repositories) {
        this.settingsRepo = repositories.settings;
    }
    
    /**
     * Получить все настройки для фронтенда
     */
    async getAllSettings() {
        try {
            const [
                socketSettings,
                colorSettings,
                consentSettings,
                questions,
                contacts
            ] = await Promise.all([
                this.settingsRepo.getSocketSettings(),
                this.settingsRepo.getColorSettings(),
                this.settingsRepo.getConsentSettings(),
                this.settingsRepo.getQuestions(),
                this.settingsRepo.getContacts()
            ]);
            
            return {
                socket: socketSettings[0] || {},
                colors: colorSettings[0] || {},
                consent: consentSettings[0] || {},
                questions: questions || [],
                contacts: contacts || []
            };
        } catch (error) {
            console.error('❌ Ошибка получения настроек:', error);
            throw error;
        }
    }
    
    /**
     * Обновить настройки сокета
     */
    async updateSocketSettings(data) {
        try {
            // Валидация
            if (!data.url || !data.port) {
                throw new Error('URL и порт обязательны');
            }
            
            const result = await this.settingsRepo.updateSocketSettings({
                url: data.url,
                ws: data.ws || 'ws',
                port: data.port.toString()
            });
            
            return {
                success: true,
                changes: result.changes,
                settings: {
                    url: data.url,
                    ws: data.ws || 'ws',
                    port: data.port
                }
            };
        } catch (error) {
            console.error('❌ Ошибка обновления настроек сокета:', error);
            throw error;
        }
    }
    
    /**
     * Обновить цвета
     */
    async updateColors(colors) {
        try {
            // Здесь будет вызов репозитория когда добавим метод
            console.log('🔄 Обновление цветов:', colors);
            return { success: true, colors };
        } catch (error) {
            console.error('❌ Ошибка обновления цветов:', error);
            throw error;
        }
    }
    
    /**
     * Добавить/обновить вопрос
     */
    async updateQuestion(questionData) {
        try {
            // Здесь будет вызов репозитория
            console.log('🔄 Обновление вопроса:', questionData);
            return { success: true, question: questionData };
        } catch (error) {
            console.error('❌ Ошибка обновления вопроса:', error);
            throw error;
        }
    }
    
    /**
     * Добавить/обновить контакт
     */
    async updateContact(contactData) {
        try {
            // Здесь будет вызов репозитория
            console.log('🔄 Обновление контакта:', contactData);
            return { success: true, contact: contactData };
        } catch (error) {
            console.error('❌ Ошибка обновления контакта:', error);
            throw error;
        }
    }
    
    /**
     * Получить настройки для клиента (публичные)
     */
    async getPublicSettings() {
        try {
            const [questions, contacts, colors] = await Promise.all([
                this.settingsRepo.getQuestions(),
                this.settingsRepo.getContacts(),
                this.settingsRepo.getColorSettings()
            ]);
            
            return {
                colors: colors[0] || {},
                questions: questions || [],
                contacts: contacts || []
            };
        } catch (error) {
            console.error('❌ Ошибка получения публичных настроек:', error);
            throw error;
        }
    }
}

module.exports = SettingsService;