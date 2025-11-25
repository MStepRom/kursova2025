// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Поле email буде використовуватися як логін
    email: {
        type: String,
        required: true,
        unique: true, // Гарантує, що не може бути двох однакових email
        trim: true,
        lowercase: true
    },
    // Поле для зберігання хешованого пароля ( bcryptjs )
    password: {
        type: String,
        required: true
    },
    // Додаткове поле, яке можна використовувати для відображення імені
    name: {
        type: String,
        required: true
    }
}, {
    // Додає поля createdAt і updatedAt
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;