// routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Для хешування паролів
const jwt = require('jsonwebtoken'); // Для роботи з токенами
const User = require('../models/User'); // модель користувача

// ===================================================================
// АЛГОРИТМ 2.1.1: РЕЄСТРАЦІЯ НОВОГО КОРИСТУВАЧА
// Маршрут: POST /api/auth/register
// ===================================================================
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. Перевірка, чи користувач вже існує
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Користувач з таким email вже існує' });
        }

        // 2. Створення нового об'єкта користувача
        user = new User({
            name,
            email,
            password 
        });

        // 3. Хешування пароля
        const salt = await bcrypt.genSalt(10); // Генерація "солі" для безпеки
        user.password = await bcrypt.hash(password, salt); // Хешування
        
        // 4. Збереження нового користувача у MongoDB
        await user.save();

        // Після реєстрації одразу генеруємо токен для входу
        const payload = {
            user: {
                id: user.id // Унікальний ID користувача
            }
        };

        // Генерація токена з ID користувача та секретним ключем
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // секретний ключ з .env
            { expiresIn: '1h' }, // Токен дійсний 1 годину
            (err, token) => {
                if (err) throw err;
                // Успіх: повертаємо токен
                res.status(201).json({ token, userId: user.id, msg: 'Реєстрація успішна' });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера при реєстрації');
    }
});

// ===================================================================
// АЛГОРИТМ 2.1.2: АВТОРИЗАЦІЯ (ВХІД) КОРИСТУВАЧА
// Маршрут: POST /api/auth/login
// ===================================================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Пошук користувача за email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Невірні облікові дані' });
        }

        // 2. Порівняння пароля
        // bcrypt.compare() порівнює введений пароль з хешем у базі даних
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Невірні облікові дані' });
        }
        
        // Якщо пароль збігся, генеруємо токен
        const payload = {
            user: {
                id: user.id 
            }
        };

        // Генерація токена
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, 
            (err, token) => {
                if (err) throw err;
                // Успіх: повертаємо токен
                res.json({ token, userId: user.id, msg: 'Вхід успішний' });
            }
        );
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка сервера при вході');
    }
});

module.exports = router;