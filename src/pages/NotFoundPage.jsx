// src/pages/NotFoundPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        navigate('/', { replace: true });
    }, [navigate]);

    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-bank-gray-dark">{t('redirectingToHome', 'Страница не найдена. Перенаправление на главную...')}</p>
        </div>
    );
};

export default NotFoundPage;