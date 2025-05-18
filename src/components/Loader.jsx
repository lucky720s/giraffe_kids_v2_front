// src/components/Loader.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const Loader = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center py-10 text-bank-gray-DEFAULT">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bank-green mb-3"></div>
            <p className="text-sm">{t('loading', 'Загрузка...')}</p>
        </div>
    );
};

export default Loader;