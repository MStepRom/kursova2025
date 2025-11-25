// client/src/components/TaskForm.js

import React, { useState } from 'react';

const TaskForm = ({ onTaskAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Середній', // Дефолтне пріоритет
        dueDate: '' 
    });

    const { title, description, priority, dueDate } = formData;
    // 1. Отримання токена з localStorage (для авторизації)
    const token = localStorage.getItem('token');

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // 2. Відправка токена в заголовку для authMiddleware
                    'x-auth-token': token 
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                // 3. Викликаємо батьківську функцію, щоб оновити список завдань
                onTaskAdded(data); 
                
                // Очищення форми
                setFormData({
                    title: '',
                    description: '',
                    priority: 'Середній',
                    dueDate: ''
                });
            } else {
                alert(data.msg || 'Помилка створення завдання');
            }

        } catch (err) {
            console.error(err);
            alert('Помилка сервера при створенні.');
        }
    };

    return (
        // Використовуємо card для контейнера форми
        <div className="card my-4 shadow-sm">
            <div className="card-body">
                <h4 className="card-title">➕ Створити нове завдання</h4>
                <form onSubmit={onSubmit}>
                    {/* Використовуємо row/col для розміщення полів в один рядок */}
                    <div className="row">
                        {/* Поле Назва */}
                        <div className="col-md-6 mb-3">
                            <input
                                type="text"
                                placeholder="Назва завдання (Обов'язково)"
                                name="title"
                                value={title}
                                onChange={onChange}
                                required
                                className="form-control" // Bootstrap клас для стилізації полів
                            />
                        </div>
                        {/* Поле Пріоритет */}
                        <div className="col-md-3 mb-3">
                            <select 
                                name="priority" 
                                value={priority} 
                                onChange={onChange}
                                className="form-select" // Bootstrap клас для select
                            >
                                <option value="Високий">Високий</option>
                                <option value="Середній">Середній</option>
                                <option value="Низький">Низький</option>
                            </select>
                        </div>
                        {/* Поле Термін */}
                        <div className="col-md-3 mb-3">
                            <input
                                type="date"
                                name="dueDate"
                                value={dueDate}
                                onChange={onChange}
                                className="form-control" // Bootstrap клас
                            />
                        </div>
                    </div>

                    {/* Поле Опис */}
                    <div className="mb-3">
                        <textarea
                            placeholder="Опис завдання (Необов'язково)"
                            name="description"
                            value={description}
                            onChange={onChange}
                            rows="2"
                            className="form-control" // Bootstrap клас
                        />
                    </div>
                    
                    {/* Кнопка Додати */}
                    <button type="submit" className="btn btn-primary w-100">
                        Додати Завдання
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TaskForm;