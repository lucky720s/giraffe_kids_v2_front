// src/pages/CartPage.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    selectCartItems,
    selectCartTotalQuantity,
    selectCartTotalPrice,
    clearCart,
    removeItem
} from '../features/cart/cartSlice.js';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, ShoppingBagIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { translateAgeString } from '../utils/translateAge.js';
const PLACEHOLDER_IMAGE = '/assets/placeholder.png';

const CartPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector(selectCartItems);
    const totalQuantity = useSelector(selectCartTotalQuantity);
    const totalPrice = useSelector(selectCartTotalPrice);

    const REDIRECT_DELAY = 1500;

    useEffect(() => {
        let timerId = null;
        if (cartItems.length === 0 && totalQuantity === 0) {
            timerId = setTimeout(() => {
                navigate('/', { replace: true });
            }, REDIRECT_DELAY);
        }
        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, [cartItems, totalQuantity, navigate]);

    const handleClearCart = () => {
        if (window.confirm(t('confirmClearCart', 'Вы уверены, что хотите очистить корзину?'))) {
            dispatch(clearCart());
        }
    };

    const handleRemoveItem = (productId) => {
        dispatch(removeItem(productId));
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
                <ShoppingBagIcon className="h-20 w-20 text-bank-gray-light mb-6" />
                <h1 className="text-2xl font-semibold text-bank-gray-dark mb-3">
                    {t('yourCart', 'Ваша корзина')}
                </h1>
                <p className="text-bank-gray-DEFAULT mb-8">{t('cartIsEmpty', 'Ваша корзина пуста.')}</p>
                <Link
                    to="/"
                    className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-bank-green hover:bg-bank-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bank-green"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    {t('continueShopping', 'Продолжить покупки')}
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            <h1 className="text-2xl md:text-3xl font-bold text-bank-gray-dark mb-6 md:mb-8 text-center">
                {t('yourCart', 'Ваша корзина')}
            </h1>

            <div className="lg:flex lg:gap-x-8 xl:gap-x-12">
                <div className="flex-auto lg:w-2/3 bg-white rounded-xl shadow-lg p-1 sm:p-6 mb-6 lg:mb-0">
                    {cartItems.map((item) => (
                        <div key={item.productDetails.id} className="flex items-start py-4 sm:py-6 border-b border-gray-200 last:border-b-0">
                            <Link to={`/products/${item.productDetails.id}`} className="flex-shrink-0">
                                <img
                                    src={item.productDetails.imageUrl || PLACEHOLDER_IMAGE}
                                    alt={item.productDetails.name}
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-contain border border-gray-200 bg-gray-50"
                                    onError={(e) => { if (e.target.src !== PLACEHOLDER_IMAGE) e.target.src = PLACEHOLDER_IMAGE; }}
                                />
                            </Link>
                            <div className="ml-4 flex-auto">
                                <Link to={`/products/${item.productDetails.id}`} className="hover:text-bank-green transition-colors">
                                    <h3 className="text-sm sm:text-base font-semibold text-bank-gray-dark">
                                        {item.productDetails.name}
                                    </h3>
                                </Link>
                                <p className="text-xs text-bank-gray-DEFAULT mt-1">
                                    {translateAgeString(item.productDetails.age, t)} / {t(item.productDetails.gender)}
                                </p>
                                <p className="text-sm sm:text-base font-semibold text-bank-gray-dark mt-2">
                                    {item.productDetails.price.toFixed(0)} {t('currency', '₸')}
                                </p>
                            </div>
                            <button
                                onClick={() => handleRemoveItem(item.productDetails.id)}
                                title={t('removeItem', 'Удалить товар')}
                                className="ml-4 p-2 text-bank-gray-DEFAULT hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="lg:w-1/3 lg:sticky lg:top-24 self-start bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-bank-gray-dark border-b border-gray-200 pb-3 mb-4">
                        {t('total', 'Итого')}
                    </h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-bank-gray-DEFAULT">
                            <span>{t('totalItems', 'Количество товаров')}:</span>
                            <span className="font-medium text-bank-gray-dark">{totalQuantity} шт.</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-bank-gray-dark mt-4 pt-4 border-t border-gray-200">
                        <span>{t('totalPrice', 'Общая стоимость')}:</span>
                        <span>{totalPrice.toFixed(0)} {t('currency', '₸')}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="mt-6 w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-bank-green hover:bg-bank-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bank-green transition-colors"
                    >
                        {t('checkout', 'Оформить заказ')}
                    </button>
                    {cartItems.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            className="mt-3 w-full flex items-center justify-center px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-bank-gray-dark bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bank-gray-light transition-colors"
                        >
                            <TrashIcon className="h-5 w-5 mr-2 text-gray-400" />
                            {t('clearCart', 'Очистить корзину')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;