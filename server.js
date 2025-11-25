if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const express = require('express');
// 1. Додаємо Mongoose для роботи з MongoDB
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// 2. Створюємо функцію підключення
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            // Опції для уникнення попереджень
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected successfully!');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Вихід з помилкою
    }
};

// 3. Викликаємо функцію, щоб встановити з'єднання
connectDB();

const app = express();

// CORS Middleware
//app.use(cors()); // Це дозволяє виконувати запити від усіх доменів
// А ми будемо використовувати змінну оточення.
const allowedOrigins = [
    'http://localhost:3000', // Для локального тестування
    process.env.CLIENT_URL   // Для продакшену (Render)
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// express middleware handling the body parsing 
app.use(express.json());

// express middleware handling the form parsing
app.use(express.urlencoded({extended: false}));

// Підключення маршрутів аутентифікації
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Підключення маршрутів завдань (PrioList)
const taskRouter = require('./routes/tasks');
app.use('/api/tasks', taskRouter);

// create static assets from react code for production only
/*
if (process.env.NODE_ENV === 'production') {
    app.use(express.static( 'client/build' ));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
    });
}
*/

// use port from environment variables for production
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
})
