// client/src/pages/TasksPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm'; // Імпорт форми
import TaskItem from '../components/TaskItem';

const TasksPage = () => {
    // 1. Стан для зберігання списку завдань
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate();

    // Додаємо базову URL API, використовуючи змінну оточення
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    // Змінні стану для сортування та фільтрації
    const [sortBy, setSortBy] = useState('createdAt'); // Датою створення (дефолт)
    const [filterCompleted, setFilterCompleted] = useState('all'); // 'all', 'completed', 'incomplete'
    const [filterPriority, setFilterPriority] = useState('all'); // 'all', 'Високий', 'Середній', 'Низький'


    // Функція для отримання всіх завдань користувача з бекенду
    const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            // Якщо токена немає, перенаправляємо на сторінку входу
            navigate('/');
            return;
        }

        // ФОРМУЄМО ПОВНУ АДРЕСУ
        const fullEndpoint = `${API_BASE_URL}/api/tasks`;

        try {
            const res = await fetch(fullEndpoint, {
                method: 'GET',
                headers: {
                    'x-auth-token': token // Відправка токена для авторизації
                }
            });

            const data = await res.json();

            if (res.ok) {
                // Зберігаємо отриманий список завдань у стані
                setTasks(data);
            } else if (res.status === 401) {
                // Якщо токен недійсний, очищуємо сховище та перенаправляємо
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                navigate('/');
            } else {
                console.error(data.msg || 'Помилка отримання завдань');
            }
        } catch (err) {
            console.error('Помилка сервера при отриманні завдань:', err);
        }
    };
    
    // 2. Хук для завантаження завдань при першому рендері
    useEffect(() => {
        fetchTasks();
    }, []);
    
    // 3. Функція для оновлення списку після додавання нового завдання
    const onTaskAdded = (newTask) => {
        // Додаємо нове завдання на початок списку
        setTasks([newTask, ...tasks]);
    };

    // 4. Оновлення завдання у списку (наприклад, статусу completed)
    const onTaskUpdated = (id, updatedFields) => {
        setTasks(tasks.map(task => 
            task._id === id ? { ...task, ...updatedFields } : task
        ));
    };
    
    // 5. Видалення завдання зі списку
    const onTaskDeleted = (id) => {
        setTasks(tasks.filter(task => task._id !== id));
    };

    // 6. Функція виходу
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
    };

    // ЛОГІКА ФІЛЬТРАЦІЇ ТА СОРТУВАННЯ
    
    const getFilteredAndSortedTasks = useMemo(() => {
        let currentTasks = [...tasks]; // Створюємо копію для безпечної мутації

        // Фільтрація за статусом
        if (filterCompleted === 'completed') {
            currentTasks = currentTasks.filter(task => task.completed);
        } else if (filterCompleted === 'incomplete') {
            currentTasks = currentTasks.filter(task => !task.completed);
        }

        // Фільтрація за пріоритетом
        if (filterPriority !== 'all') {
            currentTasks = currentTasks.filter(task => task.priority === filterPriority);
        }

        // Сортування
        currentTasks.sort((a, b) => {
            if (sortBy === 'createdAt') {
                // Сортування за датою створення: новіші зверху (B - A)
                return new Date(b.createdAt) - new Date(a.createdAt); 
            } 
            
            if (sortBy === 'dueDate') {
                // Сортування за терміном виконання: найближчі зверху (A - B)
                // Завдання без дати виконання переміщуються в кінець (Infinity)
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                return dateA - dateB; 
            }
            
            if (sortBy === 'priority') {
                // Сортування за пріоритетом: Високий > Середній > Низький
                const priorityOrder = { 'Високий': 3, 'Середній': 2, 'Низький': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority]; 
            }

            return 0;
        });

        return currentTasks;
    }, [tasks, sortBy, filterCompleted, filterPriority]); // Залежності: перерахунок при зміні цих змінних
    
    // -------------------

    return (
        <div className="container">
            {/* СЕКЦІЯ: HEADER */}
            <header className="d-flex justify-content-between align-items-center py-3 border-bottom">
                <h1 className="h3 mb-0">📝 PrioList: ваші завдання</h1>
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                    Вийти
                </button>
            </header>
            
            <TaskForm onTaskAdded={onTaskAdded} />

            {/* БЛОК КЕРУВАННЯ ТА ФІЛЬТРАЦІЇ */}
            <section className="card p-3 my-4 shadow-sm">
                <h5 className="card-title mb-3">Управління списком завдань</h5>
                
                <div className="row g-3">
                    {/* Фільтр за статусом */}
                    <div className="col-md-4">
                        <label className="form-label small">Фільтр за статусом:</label>
                        <select value={filterCompleted} onChange={(e) => setFilterCompleted(e.target.value)} className="form-select form-select-sm">
                            <option value="all">Усі</option>
                            <option value="incomplete">Невиконані</option>
                            <option value="completed">Виконані</option>
                        </select>
                    </div>

                    {/* Фільтр за пріоритетом */}
                    <div className="col-md-4">
                        <label className="form-label small">Фільтр за пріоритетом:</label>
                        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="form-select form-select-sm">
                            <option value="all">Усі</option>
                            <option value="Високий">Високий</option>
                            <option value="Середній">Середній</option>
                            <option value="Низький">Низький</option>
                        </select>
                    </div>

                    {/* Сортування */}
                    <div className="col-md-4">
                        <label className="form-label small">Сортувати за:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select form-select-sm">
                            <option value="createdAt">Датою створення (новіші)</option>
                            <option value="dueDate">Терміном виконання (найближчі)</option>
                            <option value="priority">Пріоритетом (вищий)</option>
                        </select>
                    </div>
                </div>
            </section>
            
            <section className="task-list">
                <h4 className="mb-3">Відображається завдань: ({getFilteredAndSortedTasks.length})</h4>
                {getFilteredAndSortedTasks.length === 0 && tasks.length > 0 ? (
                    <p>Немає завдань, що відповідають поточним фільтрам.</p>
                ) : getFilteredAndSortedTasks.length === 0 && tasks.length === 0 ? (
                    <p>Наразі у вас немає завдань. Створіть перше!</p>
                ) : (
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {/* Відображаємо ВІДФІЛЬТРОВАНИЙ/ВІДСОРТОВАНИЙ список */}
                        {getFilteredAndSortedTasks.map(task => (
                            <TaskItem 
                                key={task._id} 
                                task={task} 
                                onUpdate={onTaskUpdated}
                                onDelete={onTaskDeleted}
                            />
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default TasksPage;