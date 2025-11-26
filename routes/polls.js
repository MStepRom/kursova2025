// routes/polls.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Poll = require('../models/Poll'); // <<< ПОВЕРНУЛИ
const Vote = require('../models/Vote'); // <<< ПОВЕРНУЛИ
//const mongoose = require('mongoose');
const { Types } = require('mongoose');

//const Poll = mongoose.model('Poll'); // Гарантовано повертає ініціалізовану модель Poll
//const Vote = mongoose.model('Vote'); // Гарантовано повертає ініціалізовану модель Vote

// ===================================================================
// 1. СТВОРЕННЯ ОПИТУВАННЯ (CREATE)
// Маршрут: POST /api/polls
// ЗАХИЩЕНО: Потребує токена.
// ===================================================================
router.post('/', authMiddleware, async (req, res) => {
    const { title, options } = req.body;
    
    // Перевірка, чи передано хоча б два варіанти
    if (!title || !options || options.length < 2) {
        return res.status(400).json({ msg: 'Будь ласка, надайте назву та мінімум два варіанти відповідей.' });
    }

    // Форматування варіантів для моделі (з votes: 0)
    const formattedOptions = options.map(optionText => ({ text: optionText, votes: 0 }));

    try {
        const newPoll = new Poll({
            title,
            options: formattedOptions,
            user: req.user.id // ID користувача з токена
        });

        const poll = await newPoll.save();
        res.json(poll);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера при створенні опитування.');
    }
});

// ===================================================================
// 2. ОТРИМАННЯ ВСІХ ОПИТУВАНЬ (READ)
// Маршрут: GET /api/polls
// ЗАХИЩЕНО: Потребує токена.
// ===================================================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Отримуємо всі опитування, сортуємо за датою створення
        const polls = await Poll.find().sort({ createdAt: -1 });
        res.json(polls);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера при отриманні опитувань.');
    }
});

// ===================================================================
// 3. ГОЛОСУВАННЯ (VOTE)
// Маршрут: POST /api/polls/:pollId/vote
// ЗАХИЩЕНО: Потребує токена, перевіряє унікальність голосу.
// ===================================================================
router.post('/:pollId/vote', authMiddleware, async (req, res) => {
    const { optionId } = req.body; // Очікуємо ID варіанта, за який голосують
    const { pollId } = req.params;
    const userId = req.user.id;

    if (!optionId) {
        return res.status(400).json({ msg: 'Будь ласка, оберіть варіант для голосування.' });
    }

    try {
        // Крок 1: Перевірка, чи користувач вже голосував за це опитування (на основі унікального індексу у моделі Vote)
        const existingVote = await Vote.findOne({ user: userId, poll: pollId });
        
        if (existingVote) {
            return res.status(400).json({ msg: 'Ви вже проголосували за це опитування.' });
        }

        // Крок 2: Створення запису про голос
        const newVote = new Vote({ user: userId, poll: pollId });
        await newVote.save();

        // Крок 3: Оновлення лічильника голосів у Poll
        const poll = await Poll.findOneAndUpdate(
            {
                _id: pollId, // Шукаємо опитування та варіант
                'options._id': new Types.ObjectId(optionId)
            },
            { $inc: { 'options.$.votes': 1 } }, // Збільшуємо лічильник голосів на 1
            { new: true } // Повертаємо оновлений документ
        );

        if (!poll) {
            return res.status(404).json({ msg: 'Опитування або варіант не знайдено.' });
        }

        res.json(poll); // Повертаємо оновлене опитування (з результатами)

    } catch (err) {
        // Якщо помилка пов'язана з унікальністю (малоймовірно, але можливо), повертаємо 400
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Ви вже проголосували за це опитування (унікальний ключ).' });
        }
        console.error(err.message);
        res.status(500).send('Помилка сервера при голосуванні.');
    }
});

// ===================================================================
// 4. ВИДАЛЕННЯ ОПИТУВАННЯ (DELETE)
// Маршрут: DELETE /api/polls/:id
// ЗАХИЩЕНО: Потребує токена + Перевірка Авторства.
// ===================================================================
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ msg: 'Опитування не знайдено' });
        }

        // ПЕРЕВІРКА АВТОРСТВА: Переконуємося, що ID автора опитування 
        // відповідає ID користувача, який знаходиться в токені (req.user.id).
        if (poll.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Користувач не авторизований для видалення цього опитування' });
        }

        // Видалення опитування
        await Poll.deleteOne({ _id: req.params.id });

        // Також видаляємо всі голоси, пов'язані з цим опитуванням
        await Vote.deleteMany({ poll: req.params.id });

        res.json({ msg: 'Опитування та пов’язані голоси видалено' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера при видаленні опитування.');
    }
});

module.exports = router;