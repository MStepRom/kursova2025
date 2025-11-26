// client/src/components/AuthForm.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
    // Використовуємо змінну оточення
    // На Render вона буде задана в налаштуваннях Render, локально - з client/.env
    const API_BASE_URL = process.env.REACT_APP_API_URL || ''; 
    
    // 1. Стан: перемикання між Входом та Реєстрацією
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState(null); // Додаємо стан для помилок

    // 2. Стан: дані форми
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const { name, email, password } = formData;
    const navigate = useNavigate();

    // 3. Обробка змін у полях форми
    const onChange = (e) => 
        setFormData({ ...formData, [e.target.name]: e.target.value });

    // 4. Обробка відправки форми
    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Скидаємо помилки перед відправкою

        // Визначаємо шлях до кінцевої точки залежно від режиму (Вхід або Реєстрація)
        const path = isRegister ? '/api/auth/register' : '/api/auth/login';
        // ФОРМУЄМО ПОВНУ АДРЕСУ:
        const fullEndpoint = `${API_BASE_URL}${path}`;
        
        // Створення об'єкта запиту
        const requestBody = isRegister ? { name, email, password } : { email, password };
        
        try {
            // Відправка запиту до бекенду
            const res = await fetch(fullEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await res.json();

            if (res.ok) {
                // 5. Збереження токена та ID користувача у локальному сховищі
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                
                // 6. Перенаправлення на сторінку завдань
                navigate('/tasks');

            } else {
                setError(data.msg || 'Помилка авторизації'); // Використовуємо setError
            }

        } catch (err) {
            console.error(err);
            setError('Помилка сервера. Спробуйте пізніше.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow-lg p-4">
                        <h2 className="text-center mb-4">
                            {isRegister ? 'Реєстрація у PrioList' : 'Вхід до PrioList'}
                        </h2>

                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={onSubmit}>
                            {/* Поле "Ім'я" лише для Реєстрації */}
                            {isRegister && (
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ім'я"
                                        name="name"
                                        value={name}
                                        onChange={onChange}
                                        required={isRegister}
                                    />
                                </div>
                            )}

                            <div className="mb-3">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Пароль"
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-100">
                                {isRegister ? 'Зареєструватися' : 'Увійти'}
                            </button>
                        </form>

                        {/* Посилання на перемикання режиму */}
                        <p className="mt-3 text-center">
                            {isRegister ? 'Вже маєте акаунт?' : 'Не маєте акаунту?'}
                            <button
                                type="button"
                                onClick={() => setIsRegister(!isRegister)}
                                className="btn btn-link p-0 ms-2"
                            >
                                {isRegister ? 'Увійти' : 'Зареєструватися'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;