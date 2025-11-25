import React from 'react';
import AuthForm from '../components/AuthForm';

const LoginPage = () => {
    return (
        <div className="container">
            {/* Рендеримо компонент форми */}
            <AuthForm />
        </div>
    );
};

export default LoginPage;