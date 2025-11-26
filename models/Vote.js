// models/Vote.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
    // Посилання на користувача, який проголосував
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Посилання на опитування, за яке проголосували
    poll: {
        type: Schema.Types.ObjectId,
        ref: 'Poll',
        required: true
    }
});

// Створення унікального індексу: гарантує, що user може проголосувати лише 
// один раз за одне опитування (комбінація user + poll має бути унікальною)
VoteSchema.index({ user: 1, poll: 1 }, { unique: true });

//module.exports = mongoose.model('Vote', VoteSchema);
module.exports = mongoose.models.Vote || mongoose.model('Vote', VoteSchema);