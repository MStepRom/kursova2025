// client/src/components/PollItem.js

import React, { useState, useMemo } from 'react';

const PollItem = ({ poll, onVote, onDelete }) => {
    const userId = localStorage.getItem('userId');
    // 1. Спочатку визначаємо фактичний ID власника опитування:
    //    Якщо poll.user є об'єктом, беремо poll.user._id. Якщо це вже рядок, беремо poll.user.
    const pollOwnerId = poll.user ? (poll.user._id || poll.user) : null;
    // 2. Порівнюємо їх, роблячи стійку перевірку
    const isOwner = userId && pollOwnerId && String(pollOwnerId).trim() === userId.trim();
    
    // Стан для відстеження обраного варіанта (для кліку)
    const [selectedOption, setSelectedOption] = useState(null); 
    
    // Перевірка, чи користувач вже проголосував
    // (У реальному додатку ця перевірка має бути надійною на бекенді,
    // але для відображення ми можемо її спростити)
    // NOTE: Наразі ми не можемо ефективно перевірити це на фронтенді,
    // оскільки бекенд не повертає інформацію про голоси користувача.
    // Ми будемо покладатися на логіку бекенду і відображати результати
    // після того, як користувач спробує проголосувати.
    const hasVoted = poll.hasVoted; // Поки що ігноруємо, додамо пізніше, якщо буде потрібно
    // Право голосувати: Тільки якщо користувач ще не голосував.
    const canVote = !poll.hasVoted;
    const shouldShowResults = poll.hasVoted;

    // --- ЛОГІКА ПІДРАХУНКУ РЕЗУЛЬТАТІВ (useMemo) ---
    
    const results = useMemo(() => {
        const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
        
        // Обчислюємо відсотки
        const optionsWithPercentages = poll.options.map(option => ({
            ...option,
            percentage: totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100)
        }));

        return { totalVotes, optionsWithPercentages };
    }, [poll.options]);

    // --- ОБРОБНИКИ ПОДІЙ ---

    const handleVoteSubmit = (e) => { // <<< ЗМІНА: ПЕРЕЙМЕНОВАНО І ДОДАНО e
        e.preventDefault();
        if (selectedOption) {
            // Викликаємо функцію onVote, передану з PollsPage
            onVote(poll._id, selectedOption);
            setSelectedOption(null); // Скидаємо вибір після спроби голосування
        }
    };

    const handleDeleteClick = () => {
        if (window.confirm("Ви впевнені, що хочете видалити це опитування? Це також видалить усі голоси.")) {
            onDelete(poll._id);
        }
    };

    // --- РЕНДЕР ---
    
    return (
        <div className="card mb-4 shadow-sm">
            <div className="card-body">
                <h5 className="card-title text-primary">{poll.title}</h5>
                <p className="card-subtitle mb-2 text-muted small">
                    Створено: {new Date(poll.createdAt).toLocaleDateString()}
                    {isOwner && <span className="badge bg-success ms-2">Ви - Автор</span>}
                </p>

                {/* 1. Секція Голосування або Результатів */}
                {canVote ? (
                    // 1. Нова Секція Голосування
                    <form id="voteForm" onSubmit={handleVoteSubmit}>
                        <p className="fw-bold mt-3">Проголосуйте:</p>
                        <div className="list-group">
                            {poll.options.map((option) => (
                                <button
                                    key={option._id}
                                    type="button" 
                                    className={`list-group-item list-group-item-action ${selectedOption === option._id ? 'active' : ''}`}
                                    onClick={() => setSelectedOption(option._id)}
                                >
                                    {option.text}
                                </button>
                            ))}
                        </div>
                    </form>
                ) : (
                    // 2. Секція Результатів
                    <div className="mt-3">
                        <p className="fw-bold mb-1">Результати голосування (Всього: {results.totalVotes})</p>
                        {results.optionsWithPercentages.map((option, index) => (
                            <div key={option._id} className="mb-2">
                                <small className="d-block">{option.text} ({option.votes} голосів)</small>
                                <div className="progress" style={{ height: '20px' }}>
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{ width: `${option.percentage}%` }}
                                        aria-valuenow={option.percentage}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    >
                                        {option.percentage}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* 3. КОНТЕЙНЕР ДЛЯ КНОПОК: Голосувати та Видалити (ГОРИЗОНТАЛЬНИЙ) */}
                <div className="d-flex justify-content-between align-items-center mt-3"> 
                    
                    {/* Кнопка Голосувати (відображається лише, якщо форму видно) */}
                    {canVote && (
                        <button
                            type="submit" // Зв'язуємо з формою
                            form="voteForm" // <<< ЗВ'ЯЗОК З ФОРМОЮ
                            className="btn btn-success" // <<< Прибираємо w-100
                            disabled={!selectedOption}
                        >
                            Проголосувати
                        </button>
                    )}

                    {/* Кнопка Видалення (Тільки для Автора) */}
                    {isOwner && (
                        <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleDeleteClick}
                        >
                            Видалити опитування
                        </button>
                    )}
                </div>
                
            </div>
        </div>
    );
};

export default PollItem;