// client/src/components/AuthForm.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
    // 1. Стан: перемикання між Входом та Реєстрацією
    const [isRegister, setIsRegister] = useState(false);
    
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
        
        // Визначаємо URL залежно від режиму (Вхід або Реєстрація)
        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
        
        // Створення об'єкта запиту
        const requestBody = isRegister ? { name, email, password } : { email, password };
        
        try {
            // Відправка запиту до бекенду
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await res.json();

            if (res.ok) {
                console.log(data.msg);
                
                // 5. Збереження токена та ID користувача у локальному сховищі
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                
                // 6. Перенаправлення на сторінку завдань
                navigate('/tasks');

            } else {
                alert(data.msg || 'Помилка авторизації');
            }

        } catch (err) {
            console.error(err);
            alert('Помилка сервера. Спробуйте пізніше.');
        }
    };

    return (
        <div className="auth-container">
            <h2>{isRegister ? 'Реєстрація (Алг. 2.1.1)' : 'Вхід (Алг. 2.1.2)'}</h2>
            
            <form onSubmit={onSubmit}>
                {/* Поле "Ім'я" лише для Реєстрації */}
                {isRegister && (
                    <input
                        type="text"
                        placeholder="Ім'я"
                        name="name"
                        value={name}
                        onChange={onChange}
                        required={isRegister}
                    />
                )}
                
                <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                />
                
                <input
                    type="password"
                    placeholder="Пароль"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                />
                
                <button type="submit">
                    {isRegister ? 'Зареєструватися' : 'Увійти'}
                </button>
            </form>
            
            <p>
                {isRegister ? 'Вже маєте акаунт?' : 'Не маєте акаунту?'}
                <button 
                    type="button" 
                    onClick={() => setIsRegister(!isRegister)}
                    style={{ marginLeft: '10px' }}
                >
                    {isRegister ? 'Увійти' : 'Зареєструватися'}
                </button>
            </p>
        </div>
    );
};

export default AuthForm;