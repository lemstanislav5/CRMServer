class UserController {
    constructor({adminService}) {
        if (!adminService) {
            throw new Error('AuthService is required');
        }
        this.adminService = adminService;
    }
    async updateSocketId(adminId, socketId){
        const result = await this.adminService.updateSocketId(adminId, socketId);
        console.log(result);
    }
}
module.exports = UserController;