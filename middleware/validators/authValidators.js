// middleware/validators/authValidators.js
const { body, param } = require('express-validator');

module.exports = {
    loginValidator: [
        body('login')
            .trim()
            .notEmpty()
            .withMessage('Логин обязателен')
            .isLength({ min: 3, max: 50 })
            .withMessage('Логин должен быть от 3 до 50 символов'),
        
        body('password')
            .notEmpty()
            .withMessage('Пароль обязателен')
            .isLength({ min: 5 })
            .withMessage('Пароль должен содержать минимум 5 символов')
    ],
    
    changePasswordValidator: [
        body('currentPassword')
            .notEmpty()
            .withMessage('Текущий пароль обязателен'),
        
        body('newPassword')
            .notEmpty()
            .withMessage('Новый пароль обязателен')
            .isLength({ min: 6 })
            .withMessage('Новый пароль должен содержать минимум 6 символов')
            .custom((value, { req }) => {
                if (value === req.body.currentPassword) {
                    throw new Error('Новый пароль должен отличаться от текущего');
                }
                return true;
            })
    ],
    
    registerValidator: [
        body('login')
            .trim()
            .notEmpty()
            .withMessage('Логин обязателен')
            .isLength({ min: 3, max: 50 })
            .withMessage('Логин должен быть от 3 до 50 символов')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Логин может содержать только буквы, цифры и подчеркивания'),
        
        body('password')
            .notEmpty()
            .withMessage('Пароль обязателен')
            .isLength({ min: 6 })
            .withMessage('Пароль должен содержать минимум 6 символов'),
        
        body('name')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Имя не должно превышать 100 символов')
    ]
};