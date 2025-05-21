// src/pages/OrderHistoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getOrderIdsFromHistory } from '../utils/localStorageOrders.js';
import apiClient from '../services/api';
import Loader from '../components/Loader.jsx';
import { ArrowPathIcon, TicketIcon, EyeIcon, CalendarDaysIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const PLACEHOLDER_IMAGE = '/assets/placeholder.png'; // Если будете показывать картинки товаров

const formatOrderDateTime = (isoString, locale) => {
    if (!isoString) return '-';
    try {
        const date = new Date(isoString);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleString(locale === 'kk' ? 'kk-KZ' : 'ru-KZ', options);
    } catch (e) { return isoString; }
};

const getStatusInfo = (status, tFunction) => {
    switch (status) {
        case 'pending': return { text: tFunction('orderStatus.pending', 'В ожидании'), icon: ClockIcon, color: 'bg-yellow-100 text-yellow-700', iconColor: 'text-yellow-500' };
        case 'confirmed': return { text: tFunction('orderStatus.confirmed', 'Подтвержден'), icon: CheckCircleIcon, color: 'bg-green-100 text-green-700', iconColor: 'text-green-500' };
        case 'rejected': return { text: tFunction('orderStatus.rejected', 'Отклонен'), icon: XCircleIcon, color: 'bg-red-100 text-red-700', iconColor: 'text-red-500' };
        case 'sold': return { text: tFunction('orderStatus.completed', 'Выполнен'), icon: CheckCircleIcon, color: 'bg-green-100 text-green-700', iconColor: 'text-green-500' };
        default: return { text: status || tFunction('orderStatus.unknown', 'Неизвестен'), icon: InformationCircleIcon, color: 'bg-gray-100 text-gray-700', iconColor: 'text-gray-500' };
    }
};

const OrderHistoryPage = () => {
    const { t, i18n } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllOrderDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        const historyIds = getOrderIdsFromHistory();
        if (historyIds.length === 0) {
            setOrders([]);
            setLoading(false);
            return;
        }

        try {
            const orderDetailsPromises = historyIds.map(histOrder =>
                apiClient.get(`/orders/${histOrder.orderId}`)
                    .then(response => response.data)
                    .catch(err => {
                        console.warn(`Не удалось загрузить детали для заказа ${histOrder.orderId}:`, err.message);
                        return {
                            id: histOrder.orderId,
                            status: 'error_loading',
                            totalAmount: 0, // Или какое-то значение по умолчанию
                            createdAt: histOrder.date, // Используем дату из localStorage
                            items: [],
                            isError: true
                        };
                    })
            );
            const detailedOrders = await Promise.all(orderDetailsPromises);
            // Сортируем по дате (сначала новые)
            detailedOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setOrders(detailedOrders.filter(Boolean));
        } catch (e) {
            console.error("Ошибка при загрузке истории заказов:", e);
            setError(t('history.errorLoading', 'Не удалось загрузить историю заказов.'));
        } finally {
            setLoading(false);
        }
    }, [t]); // t для error message

    useEffect(() => {
        fetchAllOrderDetails();
    }, [fetchAllOrderDetails]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            <div className="flex justify-between items-center mb-6 md:mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-2xl md:text-3xl font-bold text-bank-gray-dark">
                    {t('history.title', 'История заказов')}
                </h1>
                <button
                    onClick={fetchAllOrderDetails}
                    disabled={loading}
                    className="p-2 text-bank-gray-dark hover:text-bank-green disabled:opacity-50 rounded-full hover:bg-gray-100 transition-colors"
                    title={t('history.refresh', 'Обновить историю')}
                >
                    <ArrowPathIcon className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && <div className="mb-4 text-center p-3 text-red-700 bg-red-100 border border-red-300 rounded-lg">{error}</div>}

            {orders.length === 0 && !loading && (
                <div className="text-center py-10 bg-white rounded-xl shadow-md p-8">
                    <TicketIcon className="h-16 w-16 text-bank-gray-300 mx-auto mb-4" />
                    <p className="text-bank-gray-DEFAULT text-lg">{t('history.empty', 'У вас еще нет истории заказов на этом устройстве.')}</p>
                    <Link to="/" className="mt-6 inline-block text-bank-green hover:text-bank-green-dark font-semibold py-2 px-4 rounded-lg border-2 border-bank-green hover:bg-bank-green-light/20 transition-colors">
                        {t('history.goToShop', 'Перейти в магазин')}
                    </Link>
                </div>
            )}

            {orders.length > 0 && (
                <div className="space-y-4 md:space-y-6">
                    {orders.map(order => {
                        if (!order || !order.id) return null;
                        const statusInfo = getStatusInfo(order.status, t);
                        return (
                            <div key={order.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                                <Link to={`/order/${order.id}`} className="block p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                                        <div>
                                            <h2 className="text-base sm:text-lg font-semibold text-bank-green hover:underline">
                                                {t('order', 'Заказ')} №<span className="break-all">{order.id}</span>
                                            </h2>
                                            <p className="text-xs sm:text-sm text-bank-gray-DEFAULT mt-1 flex items-center">
                                                <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0"/>
                                                {formatOrderDateTime(order.createdAt, i18n.language)}
                                            </p>
                                        </div>
                                        <div title={statusInfo.text} className={`mt-2 sm:mt-0 ml-0 sm:ml-4 px-3 py-1 text-xs sm:text-sm font-medium rounded-full inline-flex items-center flex-shrink-0 ${statusInfo.color} ${statusInfo.textColor || ''}`}>
                                            <statusInfo.icon className={`h-4 w-4 sm:h-5 sm:w-5 mr-1.5 ${statusInfo.iconColor || ''}`} />
                                            <span className="hidden sm:inline">{statusInfo.text}</span>
                                            <span className="sm:hidden">{statusInfo.text.substring(0,12)}{statusInfo.text.length > 12 ? '...' : ''}</span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-bank-gray-dark mb-1">
                                        <span>{t('totalItems', 'Товаров')}: {order.items?.length || 0} шт.</span>
                                    </div>
                                    <div className="text-sm text-bank-gray-dark">
                                        <span>{t('totalPrice', 'Сумма')}: </span>
                                        <span className="font-semibold text-lg">{order.totalAmount?.toFixed(0)} {t('currency', '₸')}</span>
                                    </div>
                                    {order.isError && (
                                        <p className="text-xs text-red-500 mt-1">{t('history.errorLoadingDetails', 'Не удалось загрузить полные детали этого заказа.')}</p>
                                    )}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;