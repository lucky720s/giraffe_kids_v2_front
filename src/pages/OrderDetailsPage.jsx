import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import Loader from '../components/Loader.jsx';
import { useTranslation } from 'react-i18next';
import { translateAgeString } from '../utils/translateAge.js';
import { ArrowLeftIcon, ShoppingCartIcon, UserCircleIcon, TruckIcon, CalendarDaysIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const PLACEHOLDER_IMAGE = '/assets/placeholder.png';

const formatOrderDateTime = (isoString, locale) => {
    if (!isoString) return '-';
    try {
        const date = new Date(isoString);
        const options = {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        };
        return date.toLocaleString(locale === 'kk' ? 'kk-KZ' : 'ru-KZ', options);
    } catch (e) {
        console.error("Error formatting date:", e);
        return isoString;
    }
};

const getStatusInfo = (status, tFunction) => {
    switch (status) {
        case 'pending':
            return { text: tFunction('orderStatus.pending', 'В ожидании'), icon: ClockIcon, color: 'text-yellow-600 bg-yellow-100' };
        case 'confirmed':
            return { text: tFunction('orderStatus.confirmed', 'Подтвержден'), icon: CheckCircleIcon, color: 'text-green-600 bg-green-100' };
        case 'rejected':
            return { text: tFunction('orderStatus.rejected', 'Отклонен'), icon: XCircleIcon, color: 'text-red-600 bg-red-100' };
        case 'sold':
            return { text: tFunction('orderStatus.completed', 'Выполнен'), icon: CheckCircleIcon, color: 'text-green-600 bg-green-100' };
        default:
            return { text: status || tFunction('orderStatus.unknown', 'Неизвестен'), icon: InformationCircleIcon, color: 'text-gray-600 bg-gray-100' };
    }
};

const DELIVERY_OPTIONS_TRANSLATION_KEYS = {
    pickup: 'pickup',
    post: 'deliveryByPost',
};

const OrderDetailsPage = () => {
    const { orderId } = useParams();
    const { t, i18n } = useTranslation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            setError(null);
            window.scrollTo(0, 0);
            try {
                const response = await apiClient.get(`/orders/${orderId}`);
                setOrder(response.data);
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError(err.response?.data?.message || t('orderNotFound', 'Заказ не найден или ошибка загрузки.'));
            } finally {
                setLoading(false);
            }
        };
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId, t]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-red-500 bg-red-100 p-4 rounded-lg mb-4">{error || t('orderNotFound', 'Заказ не найден.')}</p>
                <Link
                    to="/"
                    className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-bank-green hover:bg-bank-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bank-green"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    {t('backToHome', 'На главную')}
                </Link>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status, t);

    let displayDeliveryOption = order.deliveryOptionNameSnapshot || '-';
    if (order.deliveryOptionId && DELIVERY_OPTIONS_TRANSLATION_KEYS[order.deliveryOptionId]) {
        displayDeliveryOption = t(DELIVERY_OPTIONS_TRANSLATION_KEYS[order.deliveryOptionId], order.deliveryOptionNameSnapshot || order.deliveryOptionId);
    }


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            <Link
                to="/"
                className="mb-6 inline-flex items-center text-sm font-medium text-bank-gray-DEFAULT hover:text-bank-green transition-colors group"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2 text-bank-gray-dark group-hover:text-bank-green transition-colors" />
                {t('backToHome', 'На главную')}
            </Link>

            <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-bank-gray-dark">
                            {t('order', 'Заказ')} №{order.id}
                        </h1>
                        <p className="text-sm text-bank-gray-DEFAULT mt-1 flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                            {formatOrderDateTime(order.createdAt, i18n.language)}
                        </p>
                    </div>
                    <div className={`mt-3 sm:mt-0 px-3 py-1.5 text-sm font-medium rounded-full inline-flex items-center ${statusInfo.color}`}>
                        <statusInfo.icon className="h-5 w-5 mr-1.5" />
                        {statusInfo.text}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-bank-gray-dark flex items-center">
                            <UserCircleIcon className="h-6 w-6 mr-2 text-bank-green" />
                            {t('customerDetails', 'Данные клиента')}
                        </h2>
                        <div className="text-sm space-y-1 pl-8">
                            <p><span className="font-medium">{t('yourName', 'Имя')}:</span> {order.customerData?.name || '-'}</p>
                            <p><span className="font-medium">{t('phoneNumber', 'Телефон')}:</span> {order.customerData?.phone || '-'}</p>
                        </div>

                        <h2 className="text-lg font-semibold text-bank-gray-dark pt-4 mt-4 border-t border-gray-100 flex items-center">
                            <TruckIcon className="h-6 w-6 mr-2 text-bank-green" />
                            {t('deliveryMethod', 'Способ доставки')}
                        </h2>
                        <p className="text-sm pl-8">{displayDeliveryOption}</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-bank-gray-dark flex items-center">
                            <ShoppingCartIcon className="h-6 w-6 mr-2 text-bank-green" />
                            {t('orderedItems', 'Товары в заказе')} ({order.items?.length || 0})
                        </h2>
                        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                            {order.items?.map(item => (
                                <li key={item.productId} className="rounded-lg transition-shadow hover:shadow-md">
                                    <Link
                                        to={`/products/${item.productId}?source=order`}
                                        className="flex items-start p-3 bg-gray-50 hover:bg-gray-100 rounded-lg block"
                                    >
                                        <img
                                            src={item.imageUrl || PLACEHOLDER_IMAGE}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-md object-contain border border-gray-200 flex-shrink-0 bg-white"
                                            onError={(e) => { if (e.target.src !== PLACEHOLDER_IMAGE) e.target.src = PLACEHOLDER_IMAGE; }}
                                        />
                                        <div className="ml-3 text-xs sm:text-sm flex-auto">
                                            <p className="font-semibold text-bank-gray-dark group-hover:text-bank-green">{item.name}</p>
                                            <p className="text-bank-gray-DEFAULT">{translateAgeString(item.age, t)} / {t(item.gender)}</p>
                                            <p className="mt-1 font-medium">{item.price?.toFixed(0)} {t('currency', '₸')}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 text-right">
                    <p className="text-xl md:text-2xl font-bold text-bank-gray-dark">
                        {t('totalPayable', 'К оплате')}: <span className="text-bank-green">{order.totalAmount?.toFixed(0)} {t('currency', '₸')}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;