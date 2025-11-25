// routes/tasks.js

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware'); // Наш захист

// ===================================================================
// 1. СТВОРЕННЯ ЗАВДАННЯ (CREATE)
// Маршрут: POST /api/tasks
// ЗАХИЩЕНО: Потребує токена
// ===================================================================
router.post('/', authMiddleware, async (req, res) => {
    try {
        // Створюємо нове завдання, використовуючи ID користувача з токена
        const newTask = new Task({
            ...req.body, // title, description, priority, completed
            owner: req.user.id // Прив'язка до поточного користувача
        });

        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера при створенні завдання');
    }
});


// ===================================================================
// 2. ОТРИМАННЯ ВСІХ ЗАВДАНЬ КОРИСТУВАЧА (READ)
// Маршрут: GET /api/tasks
// ЗАХИЩЕНО: Повертає тільки завдання, де owner == req.user.id
// ===================================================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Пошук завдань, де поле 'owner' дорівнює ID користувача з токена
        const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера при отриманні завдань');
    }
});


// ===================================================================
// 3. ОНОВЛЕННЯ ЗАВДАННЯ (UPDATE)
// Маршрут: PUT /api/tasks/:id
// ЗАХИЩЕНО: Потребує токена та перевіряє, чи є користувач власником
// ===================================================================
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        let task = await Task.findOne({ _id: req.params.id, owner: req.user.id });

        if (!task) {
            return res.status(404).json({ msg: 'Завдання не знайдено або доступ заборонено' });
        }
        
        // Оновлення полів
        task = await Task.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true, runValidators: true }
        );

        res.json(task);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера при оновленні завдання');
    }
});


// ===================================================================
// 4. ВИДАЛЕННЯ ЗАВДАННЯ (DELETE)
// Маршрут: DELETE /api/tasks/:id
// ЗАХИЩЕНО
// ===================================================================
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });

        if (!task) {
            return res.status(404).json({ msg: 'Завдання не знайдено або доступ заборонено' });
        }

        await Task.deleteOne({ _id: req.params.id });

        res.json({ msg: 'Завдання видалено' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера при видаленні завдання');
    }
});

module.exports = router;