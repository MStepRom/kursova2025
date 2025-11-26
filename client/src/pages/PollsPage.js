// client/src/pages/PollsPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PollItem from '../components/PollItem'; // Імпорт форми

const PollsPage = () => {
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    // Стан для форми створення опитування
    const [title, setTitle] = useState('');
    // Варіанти відповідей (мінімум 2)
    const [options, setOptions] = useState([{ text: '' }, { text: '' }]);
    const [error, setError] = useState(null);
    const [polls, setPolls] = useState([]); // Стан для зберігання списку опитувань
    const [isFormVisible, setIsFormVisible] = useState(false); // Для керування видимістю форми

    // --- ЛОГІКА НАВІГАЦІЇ ТА ВИХОДУ ---
    
    // Функція для переходу назад до завдань
    const goToTasks = () => {
        navigate('/tasks');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
    };

    // --- ЛОГІКА ФОРМИ ОПИТУВАННЯ ---

    // Оновлення тексту варіанта
    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index].text = value;
        setOptions(newOptions);
    };

    // Додавання нового порожнього варіанта
    const addOption = () => {
        // Дозволяємо додати новий варіант, лише якщо останній варіант не порожній
        if (options[options.length - 1].text.trim() !== '') {
            setOptions([...options, { text: '' }]);
        }
    };

    // Видалення варіанта (лише якщо їх більше двох)
    const removeOption = (index) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        } else {
            setError("Опитування повинно мати мінімум два варіанти відповідей.");
        }
    };

    // Скидання форми
    const resetForm = () => {
        setTitle('');
        setOptions([{ text: '' }, { text: '' }]);
        setError(null);
        setIsFormVisible(false);
    }
    
    // --- API ЛОГІКА ---

    // 1. ОТРИМАННЯ ОПИТУВАНЬ
    const fetchPolls = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            handleLogout(); // Використовуємо функцію виходу для перенаправлення
            return;
        }

        const fullEndpoint = `${API_BASE_URL}/api/polls`;

        try {
            const res = await fetch(fullEndpoint, {
                method: 'GET',
                headers: { 'x-auth-token': token }
            });

            const data = await res.json();
            if (res.ok) {
                setPolls(data);
            } else if (res.status === 401) {
                handleLogout();
            } else {
                setError(data.msg || 'Помилка отримання опитувань');
            }
        } catch (err) {
            console.error('Помилка сервера при отриманні опитувань:', err);
            setError('Помилка підключення до сервера.');
        }
    };
    
    // 2. СТВОРЕННЯ ОПИТУВАННЯ
    const handleCreatePoll = async (e) => {
        e.preventDefault();
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) return handleLogout();

        // Фільтруємо порожні варіанти (крім останнього, якщо він є)
        const validOptions = options
            .map(opt => opt.text.trim())
            .filter(text => text.length > 0);

        if (!title.trim() || validOptions.length < 2) {
            setError("Назва та мінімум два варіанти відповідей є обов'язковими.");
            return;
        }

        const fullEndpoint = `${API_BASE_URL}/api/polls`;
        
        try {
            const res = await fetch(fullEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    title: title.trim(),
                    // Надсилаємо масив рядків (бек-енд їх перетворить на об'єкти {text: '...', votes: 0})
                    options: validOptions 
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Оновлюємо список опитувань та скидаємо форму
                setPolls([data, ...polls]);
                resetForm();
            } else if (res.status === 401) {
                 handleLogout();
            } else {
                setError(data.msg || 'Помилка створення опитування');
            }
        } catch (err) {
            console.error('Помилка сервера при створенні опитування:', err);
            setError('Помилка підключення до сервера.');
        }
    };
    
    // 3. ФУНКЦІЯ ГОЛОСУВАННЯ
    const handleVote = async (pollId, optionId) => {
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) return handleLogout();

        const fullEndpoint = `${API_BASE_URL}/api/polls/${pollId}/vote`;
        
        try {
            const res = await fetch(fullEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ optionId })
            });

            const data = await res.json();

            if (res.ok) {
                // Оновлюємо список опитувань, замінюючи старий об'єкт оновленим
                //setPolls(polls.map(poll => (poll._id === pollId ? data : poll)));
                await fetchPolls();
            } else if (res.status === 401) {
                 handleLogout();
            } else {
                // Відображаємо помилку (наприклад, "Ви вже проголосували")
                setError(data.msg || 'Помилка голосування');
            }
        } catch (err) {
            console.error('Помилка сервера при голосуванні:', err);
            setError('Помилка підключення до сервера.');
        }
    };
    
    // 4. ФУНКЦІЯ ВИДАЛЕННЯ
    const handleDelete = async (pollId) => {
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) return handleLogout();

        const fullEndpoint = `${API_BASE_URL}/api/polls/${pollId}`;
        
        try {
            const res = await fetch(fullEndpoint, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                // Видаляємо опитування зі списку
                // Використовуємо функціональний оновлювач стану для уникнення застарілих даних
                setPolls(prevPolls => prevPolls.filter(poll => poll._id !== pollId));
            } else if (res.status === 401) {
                 handleLogout();
            } else {
                setError('Не вдалося видалити опитування. Можливо, ви не є автором.');
            }
        } catch (err) {
            console.error('Помилка сервера при видаленні:', err);
            setError('Помилка підключення до сервера.');
        }
    };
    
    // Хук для завантаження опитувань при першому рендері
    useEffect(() => {
        fetchPolls();
    }, []);

    // --- РЕНДЕР КОМПОНЕНТА ---

    return (
        <div className="container">
            {/* СЕКЦІЯ: HEADER */}
            <header className="d-flex justify-content-between align-items-center py-3 border-bottom">
                <h1 className="h3 mb-0">📊 PrioList: Опитування</h1>
                <div>
                    <button onClick={goToTasks} className="btn btn-outline-secondary btn-sm me-2">
                        📝 Завдання
                    </button>
                    <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                        Вийти
                    </button>
                </div>
            </header>

            {/* БЛОК СТВОРЕННЯ ОПИТУВАННЯ */}
            <section className="mt-4">
                <button 
                    className="btn btn-primary mb-3"
                    onClick={() => setIsFormVisible(!isFormVisible)}
                >
                    {isFormVisible ? 'Приховати форму' : '➕ Створити нове опитування'}
                </button>

                {isFormVisible && (
                    <div className="card p-4 shadow-sm mb-4">
                        <h4 className="card-title mb-3">Створення опитування</h4>
                        {error && <div className="alert alert-danger">{error}</div>}
                        
                        <form onSubmit={handleCreatePoll}>
                            {/* Поле Назви Опитування */}
                            <div className="mb-3">
                                <label className="form-label">Назва опитування:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Поля Варіантів */}
                            <h6 className="mt-4">Варіанти відповідей (мінімум 2):</h6>
                            {options.map((option, index) => (
                                <div key={index} className="input-group mb-3">
                                    <span className="input-group-text">{index + 1}.</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Введіть варіант відповіді"
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        required={index < 2} // Перші два варіанти є обов'язковими
                                    />
                                    {options.length > 2 && (
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-danger" 
                                            onClick={() => removeOption(index)}
                                            title="Видалити варіант"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>
                            ))}
                            
                            {/* Кнопка Додати Варіант */}
                            <button 
                                type="button" 
                                className="btn btn-outline-success btn-sm mb-3" 
                                onClick={addOption}
                            >
                                Додати ще варіант
                            </button>

                            {/* Кнопка Створити */}
                            <button type="submit" className="btn btn-primary w-100 mt-3">
                                Створити опитування
                            </button>
                        </form>
                    </div>
                )}
            </section>
            
            {/* БЛОК СПИСКУ ОПИТУВАНЬ */}
            <section className="mt-4">
                <h4 className="mb-3">Список опитувань ({polls.length})</h4>
                {polls.length === 0 ? (
                    <div className="alert alert-warning">Наразі немає активних опитувань. Створіть перше!</div>
                ) : (
                    <div className="poll-list">
                        {polls.map(poll => (
                            <PollItem 
                                key={poll._id} 
                                poll={poll} 
                                onVote={handleVote} // <<< Передаємо функцію голосування
                                onDelete={handleDelete} // <<< Передаємо функцію видалення
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default PollsPage;