// client/src/components/TaskItem.js

import React, { useState } from 'react';

const TaskItem = ({ task, onUpdate, onDelete }) => {
    // Стан для перемикання режиму: true - редагування, false - відображення
    const [isEditing, setIsEditing] = useState(false); 
    
    // Стан для зберігання локальних даних форми при редагуванні
    const [editData, setEditData] = useState({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        // Форматуємо дату для коректного відображення в полі <input type="date">
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : ''
    });
    
    // Отримання токена для авторизації
    const token = localStorage.getItem('token');

    // Додаємо базову URL API, використовуючи змінну оточення
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    // Стилі для режиму відображення/редагування
    const itemStyle = {
        textDecoration: task.completed ? 'line-through' : 'none',
        opacity: task.completed ? 0.6 : 1,
        border: '1px solid #eee',
        margin: '10px 0',
        padding: '15px',
        display: 'flex',
        flexDirection: isEditing ? 'column' : 'row', // Зміна на 'column' у режимі редагування
        justifyContent: 'space-between',
        alignItems: isEditing ? 'stretch' : 'center'
    };

    // Обробка змін у полях редагування
    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    // 1. Обробник оновлення статусу (Виконано/Відновити)
    const handleToggleComplete = async () => {
        // Ми надсилаємо лише одне поле: completed
        const newCompletedStatus = !task.completed;
        
        // ФОРМУЄМО ПОВНУ АДРЕСУ
        const fullEndpoint = `${API_BASE_URL}/api/tasks/${task._id}`;

        try {
            const res = await fetch(fullEndpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ completed: newCompletedStatus }) 
            });

            if (res.ok) {
                // Оновлення стану в TasksPage
                onUpdate(task._id, { completed: newCompletedStatus });
            } else {
                alert('Помилка оновлення статусу');
            }
        } catch (err) {
            console.error(err);
        }
    };
    
    // 2. Обробник збереження змін (Редагування)
    const handleSaveEdit = async (e) => {
        e.preventDefault();

        // ФОРМУЄМО ПОВНУ АДРЕСУ
        const fullEndpoint = `${API_BASE_URL}/api/tasks/${task._id}`;
        
        try {
            const res = await fetch(fullEndpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(editData) // Надсилаємо ВСІ поля editData на бекенд
            });

            const updatedTask = await res.json();

            if (res.ok) {
                // Оновлення стану в TasksPage новим завданням, отриманим від бекенду
                onUpdate(task._id, updatedTask); 
                setIsEditing(false); // Вихід з режиму редагування
            } else {
                alert(updatedTask.msg || 'Помилка збереження змін');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 3. Обробник видалення завдання
    const handleDelete = async () => {
        // ФОРМУЄМО ПОВНУ АДРЕСУ
        const fullEndpoint = `${API_BASE_URL}/api/tasks/${task._id}`;

        try {
            const res = await fetch(fullEndpoint, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token
                }
            });

            if (res.ok) {
                // Викликаємо батьківську функцію для видалення зі списку
                onDelete(task._id);
            } else {
                alert('Помилка видалення завдання');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // --- УМОВНИЙ РЕНДЕРИНГ: Режим Редагування ---
    if (isEditing) {
        return (
            // Використовуємо Bootstrap класи для оформлення форми
            <li style={itemStyle} className="list-group-item"> 
                <form onSubmit={handleSaveEdit} className="w-100">
                    <div className="mb-2">
                        <input
                            type="text"
                            name="title"
                            value={editData.title}
                            onChange={handleEditChange}
                            required
                            className="form-control form-control-sm"
                            placeholder="Назва завдання"
                        />
                    </div>
                    <div className="mb-2">
                        <textarea
                            name="description"
                            value={editData.description}
                            onChange={handleEditChange}
                            className="form-control form-control-sm"
                            placeholder="Опис"
                        />
                    </div>
                    
                    <div className="d-flex gap-3 mb-3">
                        <div>
                            <label className="form-label small mb-0">Пріоритет:</label>
                            <select name="priority" value={editData.priority} onChange={handleEditChange} className="form-select form-select-sm">
                                <option value="Високий">Високий</option>
                                <option value="Середній">Середній</option>
                                <option value="Низький">Низький</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label small mb-0">Термін:</label>
                            <input
                                type="date" 
                                name="dueDate"
                                value={editData.dueDate}
                                onChange={handleEditChange}
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                            Скасувати
                        </button>
                        <button type="submit" className="btn btn-success btn-sm">
                            Зберегти зміни
                        </button>
                    </div>
                </form>
            </li>
        );
    }

    // --- УМОВНИЙ РЕНДЕРИНГ: Режим Відображення ---
    return (
        <li style={itemStyle} className="list-group-item d-flex">
            {/* Ліва частина: текст завдання */}
            <div>
                <strong className="d-block">{task.title}</strong>
                {task.description && <p className="mb-0 mt-1 small">{task.description}</p>}
                
                <small className="d-block mt-1 text-muted">
                    Пріоритет: <span className={`badge ${task.priority === 'Високий' ? 'bg-danger' : task.priority === 'Середній' ? 'bg-warning text-dark' : 'bg-success'}`}>{task.priority}</span> |
                    Створено: {new Date(task.createdAt).toLocaleDateString('uk-UA')}
                    {task.dueDate && <span> | Термін: {new Date(task.dueDate).toLocaleDateString('uk-UA')}</span>}
                </small>
            </div>

            {/* Права частина: Кнопки керування */}
            <div className="d-flex gap-2 align-items-center ms-auto">
                <button 
                    onClick={() => setIsEditing(true)}
                    className="btn btn-info btn-sm text-white"
                >
                    Редагувати
                </button>
                <button 
                    onClick={handleToggleComplete}
                    className={`btn btn-sm ${task.completed ? 'btn-secondary' : 'btn-success'}`}
                >
                    {task.completed ? 'Відновити' : 'Виконано'}
                </button>
                <button 
                    onClick={handleDelete}
                    className="btn btn-danger btn-sm"
                >
                    Видалити
                </button>
            </div>
        </li>
    );
};

export default TaskItem;