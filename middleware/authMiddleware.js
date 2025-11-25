// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Отримати токен із заголовка запиту
    // Токен зазвичай має вигляд: 'Bearer <token_value>'
    const token = req.header('x-auth-token');

    // 2. Перевірка наявності токена
    if (!token) {
        return res.status(401).json({ msg: 'Немає токена, авторизація відхилена' });
    }

    try {
        // 3. Верифікація токена за допомогою секретного ключа
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Додавання користувача до об'єкта запиту
        // Тепер в усіх захищених маршрутах ми матимемо доступ до ID користувача через req.user.id
        req.user = decoded.user;
        next();
        
    } catch (err) {
        // Якщо токен недійсний (наприклад, термін дії минув)
        res.status(401).json({ msg: 'Токен недійсний' });
    }
};