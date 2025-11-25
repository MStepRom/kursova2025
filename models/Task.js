// models/Task.js

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    // 1. Поля для опису завдання
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['Високий', 'Середній', 'Низький'],
        default: 'Середній'
    },
    dueDate: {
        type: Date,
        default: null // Може бути необов'язковим
    },
    completed: {
        type: Boolean,
        default: false
    },
    
    // 2. Зв'язок із користувачем
    // Це поле гарантує, що завдання належить конкретному користувачу (ownerId)
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Посилання на модель 'User'
    }
}, {
    // Додає поля createdAt і updatedAt
    timestamps: true
});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;