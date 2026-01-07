// api/settings.js
const express = require('express');
const router = express.Router();

module.exports = function(settingsService) {
    
    // Получить все настройки (для админ-панели)
    router.get('/admin', async (req, res) => {
        try {
            const settings = await settingsService.getAllSettings();
            res.json({
                success: true,
                settings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // Получить публичные настройки (для клиента)
    router.get('/public', async (req, res) => {
        try {
            const settings = await settingsService.getPublicSettings();
            res.json({
                success: true,
                settings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // Обновить настройки сокета
    router.put('/socket', async (req, res) => {
        try {
            const result = await settingsService.updateSocketSettings(req.body);
            res.json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // Обновить цвета
    router.put('/colors', async (req, res) => {
        try {
            const result = await settingsService.updateColors(req.body);
            res.json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // Обновить вопрос
    router.put('/question', async (req, res) => {
        try {
            const result = await settingsService.updateQuestion(req.body);
            res.json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // Обновить контакт
    router.put('/contact', async (req, res) => {
        try {
            const result = await settingsService.updateContact(req.body);
            res.json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    });
    
    return router;
};