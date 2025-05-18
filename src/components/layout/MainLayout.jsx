// src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useTranslation } from 'react-i18next';

const MainLayout = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col bg-page-bg text-bank-gray-dark">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
            <footer className="bg-bank-green-dark text-white text-center p-4 mt-auto">
                {t('footer.copyrightSimple', {
                    year: new Date().getFullYear(),
                    shopName: t('shopName', 'Giraffe Kids KZ')
                })}

            </footer>
        </div>
    );
};

export default MainLayout;