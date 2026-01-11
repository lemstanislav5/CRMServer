class AdminService {
    constructor({adminRepository}) {
        this.adminRepository = adminRepository;
    }

    /**
     * Обновление socketId администратора
     * @param {number} id - ID администратора
     * @param {string} socketId - Новый socketId
     */
    async updateSocketId(id, socketId) {
        try {
            await this.adminRepository.updateSocketId(id, socketId);
            console.log(`✅ SocketId обновлен для администратора ID: ${id}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Ошибка обновления socketId:', error);
            return { success: false, error: error.message };
        }
    }
}
module.exports = AdminService;