// models/Poll.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Підсхема для варіантів відповідей
const OptionSchema = new Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    votes: {
        type: Number,
        default: 0 // Лічильник голосів
    }
}, );

const PollSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    // Варіанти відповідей (масив під-документів)
    options: [OptionSchema], 
    
    // Посилання на користувача, який створив опитування
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//module.exports = mongoose.model('Poll', PollSchema);
module.exports = mongoose.models.Poll || mongoose.model('Poll', PollSchema);