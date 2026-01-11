class AdminController {
    constructor({adminService}) {
        if (!adminService) {
            throw new Error('AuthService is required');
        }
        this.adminService = adminService;
    }
    async updateSocketId(socket){
        const adminId = socket.decoded.id;
        const socketId = socket.id;
        const result = await this.adminService.updateSocketId(adminId, socketId);
        console.log(result);
    }
}
module.exports = AdminController;