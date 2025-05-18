// src/components/layout/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartTotalQuantity } from '../../features/cart/cartSlice';
import { useTranslation } from 'react-i18next';
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const LanguageSwitcherInline = () => {
    const { t, i18n } = useTranslation();
    const languages = [
        { code: 'kk', name: t('language.kk', 'Қаз') },
        { code: 'ru', name: t('language.ru', 'Рус') },
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center space-x-1">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    disabled={i18n.resolvedLanguage === lang.code}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors
                        ${i18n.resolvedLanguage === lang.code
                        ? 'bg-bank-green-light text-bank-green-dark shadow-sm'
                        : 'text-bank-gray-DEFAULT hover:text-bank-green hover:bg-gray-100'
                    }
                        disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                    {lang.name}
                </button>
            ))}
        </div>
    );
};

const Header = () => {
    const { t } = useTranslation();
    const totalQuantity = useSelector(selectCartTotalQuantity);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('#mobile-menu-button')) {
                setIsMobileMenuOpen(false);
            }
        };
        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);
    const CartIconLink = ({ className = "" }) => (
        <Link
            to="/cart"
            className={`relative text-bank-gray-dark hover:text-bank-green p-2 rounded-full hover:bg-bank-gray-light transition-colors ${className}`}
            title={t('cart', 'Корзина')}
            onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
        >
            <ShoppingCartIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            {totalQuantity > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
                    {totalQuantity}
                </span>
            )}
        </Link>
    );

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                    {/* Логотип */}
                    <Link to="/" className="text-2xl sm:text-3xl font-bold text-bank-green flex items-center hover:opacity-80 transition-opacity">
                        <img src="/assets/favicon.ico" alt={t('shopName', 'Giraffe Kids KZ')} className="h-8 w-8 mr-2 sm:h-9 sm:w-9" />
                        {t('shopName', 'Giraffe Kids KZ')}
                    </Link>
                    <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
                        <LanguageSwitcherInline />
                        <CartIconLink />
                    </nav>
                    <div className="md:hidden flex items-center space-x-2">
                        <CartIconLink />
                        <button
                            id="mobile-menu-button"
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-md text-bank-gray-dark hover:text-bank-green hover:bg-bank-gray-light focus:outline-none"
                            aria-label="Открыть меню"
                        >
                            {isMobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
                        </button>
                    </div>
                </div>
            </div>

            <div
                ref={mobileMenuRef}
                className={`md:hidden absolute top-16 md:top-20 left-0 w-full bg-white shadow-xl rounded-b-lg border-t border-gray-200 transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}`}
            >
                {isMobileMenuOpen && (
                    <div className="px-4 pt-3 pb-4 space-y-3">
                        <Link
                            to="/"
                            onClick={toggleMobileMenu}
                            className="block px-3 py-3 rounded-md text-base font-medium text-bank-gray-dark hover:text-bank-green hover:bg-bank-gray-light transition-colors"
                        >
                            {t('navbar.home', 'Главная')}
                        </Link>
                        <div className="border-t border-gray-200 pt-3">
                            <p className="px-1 text-xs font-semibold uppercase text-bank-gray-DEFAULT/80 tracking-wider mb-1.5">{t('navbar.languageTitle', 'Язык')}</p>
                            <LanguageSwitcherInline />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;