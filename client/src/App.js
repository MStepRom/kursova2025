// client/src/App.js

import React from 'react';
// 1. Імпортуємо необхідні компоненти роутера
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 2. Імпортуємо сторінки
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import PollsPage from './pages/PollsPage';

// Компонент App
const App = () => {
    return (
        // Router забезпечує роботу маршрутизації
        <Router>
            <main>
                <Routes>
                    {/* Маршрут для Входу/Реєстрації */}
                    <Route path="/" element={<LoginPage />} />
                    
                    {/* Маршрут для Завдань */}
                    <Route path="/tasks" element={<TasksPage />} />
                    
                    {/* Маршрут для Опитувань */}
                    <Route path="/polls" element={<PollsPage />} />
                </Routes>
            </main>
        </Router>
    );
};

export default App;