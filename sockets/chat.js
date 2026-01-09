// sockets/chat.js
module.exports = function(socket, io, services) {
    
    // КЛИЕНТ отправляет сообщение администратору
    socket.on('message', async (data) => {
        console.log(`💬 Клиентское сообщение:`, data);
        const { fromId, toId, text, timestamp} = data;
        try {
            // 1. Обрабатываем через сервис (добавляем в базу данных)
            const result = await services.chatService.sendMessageToAdmin(fromId, toId, text, timestamp);
            // 2. Отправляем подтверждение клиенту
            socket.emit('message_sent', {
                success: true,
                messageId: result.message.messageId,
                timestamp: result.message.time
            });
            
            // 3. Отправляем сообщение администратору (если онлайн)
            if (result.adminSocketId) {
                io.to(result.adminSocketId).emit('new_client_message', {
                    ...result.message,
                    is_admin: true
                });
                console.log(`📤 Сообщение отправлено администратору: ${result.adminSocketId}`);
            } else {
                console.log('⚠️  Администратор оффлайн, сообщение сохранено в БД');
                // Можно добавить уведомление по другим каналам
            }
            
        } catch (error) {
            console.error('❌ Ошибка отправки сообщения:', error);
            socket.emit('message_error', {
                error: error.message
            });
        }
    });
    
    // АДМИНИСТРАТОР отправляет ответ клиенту
    socket.on('admin_message', async (data) => {
        console.log(`👑 Сообщение от администратора:`, data);
        
        try {
            // Проверяем, что это администратор
            const admin = await chatService.admin.findBySocketId(socket.id);
            if (!admin || admin.length === 0) {
                throw new Error('Только администратор может отправлять сообщения');
            }
            
            const result = await chatService.sendMessageToClient(
                'admin',          // fromId
                data.clientId,    // toId
                data.text
            );
            
            // Подтверждение администратору
            socket.emit('admin_message_sent', {
                success: true,
                messageId: result.message.messageId
            });
            
            // Отправка клиенту
            if (result.clientSocketId) {
                io.to(result.clientSocketId).emit('new_admin_message', result.message);
                console.log(`📤 Ответ отправлен клиенту: ${result.clientSocketId}`);
            }
            
        } catch (error) {
            console.error('❌ Ошибка отправки сообщения администратора:', error);
            socket.emit('admin_message_error', {
                error: error.message
            });
        }
    });
    
    // Администратор подключается
    socket.on('admin_connect', async (data) => {
        try {
            // Аутентификация администратора
            const admin = await chatService.admin.findByLogin(data.login);
            
            if (!admin || admin.length === 0 || admin[0].password !== data.password) {
                throw new Error('Неверные логин или пароль');
            }
            
            // Обновляем socketId администратора
            await chatService.admin.updateSocketId(socket.id);
            
            socket.emit('admin_connected', {
                success: true,
                adminId: 'admin',
                socketId: socket.id
            });
            
            console.log(`👑 Администратор подключен: ${socket.id}`);
            
        } catch (error) {
            socket.emit('admin_connect_error', {
                error: error.message
            });
        }
    });
};
// // sockets/chat.js - базовый обработчик
// module.exports = function(socket, io, chatService, userService) {
    
//     console.log(`🔌 Новое подключение: ${socket.id}`);
    
//     // Приветственное сообщение
//     socket.emit('connected', {
//         message: 'Добро пожаловать в чат!',
//         socketId: socket.id,
//         timestamp: Date.now()
//     });
    
//     // Регистрация пользователя
//     socket.on('register', async (data) => {
//         try {
//             const result = await chatService.registerUser(
//                 data.chatId,
//                 socket.id,
//                 data.name || ''
//             );
            
//             socket.emit('registered', result);
            
//             // Вступаем в комнату пользователя
//             socket.join(data.chatId);
            
//         } catch (error) {
//             socket.emit('error', {
//                 type: 'registration_error',
//                 message: error.message
//             });
//         }
//     });
    
//     // Отправка сообщения
//     socket.on('message', async (data) => {
//         try {
//             const result = await chatService.sendMessage(
//                 data.fromId,
//                 data.toId,
//                 data.text
//             );
            
//             // Отправляем подтверждение отправителю
//             socket.emit('message_sent', result);
            
//             // Отправляем сообщение получателю (если подключён)
//             socket.to(data.toId).emit('new_message', {
//                 fromId: data.fromId,
//                 text: data.text,
//                 timestamp: Date.now()
//             });
            
//         } catch (error) {
//             socket.emit('error', {
//                 type: 'message_error',
//                 message: error.message
//             });
//         }
//     });
    
//     // Установка онлайн статуса
//     socket.on('set_online', async (data) => {
//         try {
//             await chatService.setUserOnline(data.chatId, true);
//             socket.broadcast.emit('user_online', {
//                 chatId: data.chatId,
//                 socketId: socket.id
//             });
//         } catch (error) {
//             console.error('Ошибка установки онлайн:', error);
//         }
//     });
    
//     socket.on('set_offline', async (data) => {
//         try {
//             await chatService.setUserOnline(data.chatId, false);
//             socket.broadcast.emit('user_offline', {
//                 chatId: data.chatId
//             });
//         } catch (error) {
//             console.error('Ошибка установки оффлайн:', error);
//         }
//     });
    
//     // Отключение
//     socket.on('disconnect', () => {
//         console.log(`🔌 Отключение: ${socket.id}`);
//         // Автоматическая установка оффлайн будет позже
//     });
// };