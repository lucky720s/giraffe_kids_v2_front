import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
    selectCartItems,
    selectCartTotalPrice,
    clearCart,
    removeUnavailableItems
} from '../features/cart/cartSlice.js';
import {
    createOrder,
    resetOrderState,
    clearOrderError
} from '../features/order/orderSlice.js';
import Loader from '../components/Loader.jsx';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { addOrderToHistory, getOrderIdsFromHistory } from '../utils/localStorageOrders.js'; // <-- ИСПРАВЛЕНИЕ: Добавлен импорт
import apiClient from '../services/api'; // <-- ИСПРАВЛЕНИЕ: Добавлен импорт

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '77023289343';
const PENDING_ORDER_LIMIT = 3;

const DELIVERY_OPTIONS = (t) => [
    { id: 'pickup', name: t('pickup', 'Самовывоз'), price: 0 },
    { id: 'post', name: t('deliveryByPost', 'Доставка почтой'), price: 1500 },
];

const CheckoutPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cartItems = useSelector(selectCartItems);
    const cartTotalPrice = useSelector(selectCartTotalPrice);
    const orderState = useSelector((state) => state.order);

    const currentDeliveryOptions = DELIVERY_OPTIONS(t);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedDelivery, setSelectedDelivery] = useState(currentDeliveryOptions[0]);
    const [formError, setFormError] = useState('');
    const [isCheckingPendingOrders, setIsCheckingPendingOrders] = useState(false);

    const finalTotalPrice = cartTotalPrice + (selectedDelivery?.price || 0);
    const actualSelectedDeliveryOption = currentDeliveryOptions.find(opt => opt.id === selectedDelivery.id) || currentDeliveryOptions[0];
    const currentDeliveryNameForMessage = actualSelectedDeliveryOption.name;

    useEffect(() => {
        if (orderState.loading === 'succeeded' && orderState.currentOrder) {
            console.log(orderState.currentOrder)
            const order = orderState.currentOrder;
            addOrderToHistory(order.orderId, order.createdAt); // <-- Теперь эта функция должна быть доступна

            const frontendOrderUrl = `${window.location.origin}/order/${order.orderId}`;
            const whatsappMessage =
                `${t('whatsappGreetingSimple', 'Здравствуйте!')}\n` +
                `${t('whatsapp.orderAssembled', 'Заказ собран на сайте.')}\n` +
                `${t('whatsapp.orderDetailsLink', 'Детали заказа')}: ${frontendOrderUrl}`;

            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

            dispatch(clearCart());
            dispatch(resetOrderState());
            navigate(`/order/${order.orderId}`, { replace: true });
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }
    }, [orderState.loading, orderState.currentOrder, navigate, dispatch, t]);

    useEffect(() => {
        return () => {
            if (orderState.loading !== 'pending') {
                dispatch(clearOrderError());
            }
        };
    }, [dispatch, orderState.loading]);

    useEffect(() => {
        if (orderState.error && orderState.error.unavailableItems && orderState.error.unavailableItems.length > 0) {
            const unavailableIds = orderState.error.unavailableItems.map(item => item.id);
            dispatch(removeUnavailableItems(unavailableIds));
        }
    }, [orderState.error, dispatch]);

    const handleDeliveryChange = (event) => {
        const selectedOpt = currentDeliveryOptions.find(opt => opt.id === event.target.value);
        setSelectedDelivery(selectedOpt || currentDeliveryOptions[0]);
    };

    const handleSubmitOrder = async (event) => {
        event.preventDefault();
        setFormError('');
        dispatch(clearOrderError());

        if (cartItems.length === 0) {
            alert(t('cartIsEmptyMessage', 'Ваша корзина пуста. Нечего оформлять.'));
            navigate('/cart');
            return;
        }
        if (customerName.trim() && customerName.trim().length < 2) {
            setFormError(t('error.nameTooShort', 'Имя должно содержать хотя бы 2 символа, если указано.'));
            return;
        }
        const phoneRegex = /^\+?[78][-\s(]?\d{3}\)?[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;
        if (customerPhone.trim() && !phoneRegex.test(customerPhone.trim())) {
            setFormError(t('error.invalidPhone', 'Пожалуйста, введите корректный номер телефона (например, +7 XXX XXX XX XX) или оставьте поле пустым.'));
            return;
        }

        setIsCheckingPendingOrders(true);
        const orderHistoryIds = getOrderIdsFromHistory();
        let pendingCount = 0;
        if (orderHistoryIds.length > 0) {
            try {
                const recentOrderIdsToFetch = orderHistoryIds.slice(0, 10).map(o => o.orderId);
                if (recentOrderIdsToFetch.length > 0) {
                    const statusPromises = recentOrderIdsToFetch.map(id =>
                        apiClient.get(`/orders/${id}`).then(res => res.data.status)
                    );
                    const statuses = await Promise.all(statusPromises);
                    pendingCount = statuses.filter(status => status === 'pending').length;
                }
            } catch (e) {
                console.error("Ошибка проверки активных заказов:", e);
                setFormError(t('error.checkingOrdersError', 'Не удалось проверить активные заказы. Попробуйте позже.'));
                setIsCheckingPendingOrders(false);
                return;
            }
        }
        setIsCheckingPendingOrders(false);

        if (pendingCount >= PENDING_ORDER_LIMIT) {
            setFormError(t('error.pendingOrderLimit', { count: PENDING_ORDER_LIMIT }));
            return;
        }

        const orderDetails = {
            items: cartItems.map(item => ({ productId: item.productDetails.id })),
            customerData: { name: customerName.trim(), phone: customerPhone.trim() },
            deliveryOptionId: selectedDelivery.id,
            deliveryOptionName: currentDeliveryNameForMessage
        };
        dispatch(createOrder(orderDetails));
    };

    const handleGoToCartOnError = () => {
        dispatch(clearOrderError());
        navigate('/cart');
    };

    useEffect(() => {
        if (cartItems.length === 0 && orderState.loading !== 'pending' && !orderState.currentOrder) {
            setTimeout(() => navigate('/'), 100);
        }
    }, [cartItems, orderState.loading, orderState.currentOrder, navigate]);

    if (isCheckingPendingOrders || (cartItems.length > 0 && orderState.loading === 'pending')) {
        return (
            <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (cartItems.length === 0 && orderState.loading !== 'pending' && !orderState.currentOrder) {
        return (
            <div className="container mx-auto px-4 py-8 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
                <ShoppingBagIcon className="h-20 w-20 text-bank-gray-light mb-6" />
                <p className="text-bank-gray-DEFAULT mb-8">{t('cartIsEmptyMessage', 'Ваша корзина пуста. Нечего оформлять.')}</p>
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

    let specificErrorMessageComponent = null;
    if (orderState.error && orderState.loading === 'failed') {
        if (orderState.error.unavailableItems && orderState.error.unavailableItems.length > 0) {
            const unavailableNames = orderState.error.unavailableItems.map(item => item.name || `ID: ${item.id}`).join(', ');
            specificErrorMessageComponent = (
                <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg text-sm shadow">
                    <p className="font-semibold">{t('unavailableItemsError', { items: unavailableNames, defaultValue: `Некоторые товары стали недоступны: ${unavailableNames}` })}</p>
                    <p className="mt-1">{t('unavailableItemsGuidance', 'Пожалуйста, вернитесь в корзину, чтобы обновить заказ.')}</p>
                    <button
                        onClick={handleGoToCartOnError}
                        className="mt-3 px-4 py-2 text-xs font-medium text-yellow-900 bg-yellow-300 hover:bg-yellow-400 rounded-md border border-yellow-500 transition-colors"
                    >
                        {t('returnToCart', 'Вернуться в корзину')}
                    </button>
                </div>
            );
        } else {
            specificErrorMessageComponent = (
                <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm shadow">
                    {orderState.error.message || t('unknownError', 'Произошла неизвестная ошибка при оформлении заказа.')}
                </div>
            );
        }
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-2xl">
            <button
                onClick={() => navigate('/cart')}
                className="mb-6 inline-flex items-center text-sm font-medium text-bank-gray-DEFAULT hover:text-bank-green transition-colors group"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2 text-bank-gray-dark group-hover:text-bank-green transition-colors" />
                {t('backToCart', 'Вернуться в корзину')}
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-bank-gray-dark mb-6 md:mb-8 text-center">
                {t('checkoutPageTitle', 'Оформление Заказа')}
            </h1>

            <form onSubmit={handleSubmitOrder} className="bg-white rounded-xl shadow-xl p-6 sm:p-8 space-y-6">
                <div className="pb-6">
                    <h2 className="text-lg font-semibold text-bank-gray-dark mb-4 border-b border-gray-200 pb-3">1. {t('contactInfo', 'Контактные данные')}</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="customerName" className="block text-sm font-medium text-bank-gray-dark mb-1.5">{t('yourName', 'Ваше имя')}</label>
                            <input
                                type="text"
                                id="customerName"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder={t('namePlaceholder', 'Введите ваше имя')}
                                disabled={orderState.loading === 'pending' || isCheckingPendingOrders}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-bank-green-light focus:border-bank-green sm:text-sm transition-colors bg-white placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="customerPhone" className="block text-sm font-medium text-bank-gray-dark mb-1.5">{t('phoneNumber', 'Номер телефона')} <span className="text-xs text-gray-400">({t('optionalField', 'необязательно')})</span></label>
                            <input
                                type="tel"
                                id="customerPhone"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder={t('phonePlaceholder', '+7 (XXX) XXX-XX-XX')}
                                disabled={orderState.loading === 'pending' || isCheckingPendingOrders}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-bank-green-light focus:border-bank-green sm:text-sm transition-colors bg-white placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="pb-6">
                    <h2 className="text-lg font-semibold text-bank-gray-dark mb-4 border-b border-gray-200 pb-3">2. {t('deliveryMethod', 'Способ доставки')}</h2>
                    <div className="space-y-3">
                        {currentDeliveryOptions.map(option => (
                            <label key={option.id} className={`flex items-center p-3.5 border rounded-lg hover:border-bank-green hover:bg-bank-green-light/10 transition-all cursor-pointer has-[:checked]:border-bank-green has-[:checked]:ring-2 has-[:checked]:ring-bank-green/50 ${selectedDelivery.id === option.id ? 'border-bank-green ring-2 ring-bank-green/50 bg-bank-green-light/10' : 'border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="deliveryOption"
                                    value={option.id}
                                    checked={selectedDelivery.id === option.id}
                                    onChange={handleDeliveryChange}
                                    disabled={orderState.loading === 'pending' || isCheckingPendingOrders}
                                    className="h-4 w-4 text-bank-green border-gray-300 focus:ring-bank-green focus:ring-offset-0"
                                />
                                <span className="ml-3 block text-sm font-medium text-bank-gray-dark">
                                    {option.name}
                                </span>
                                <span className="ml-auto text-sm font-semibold text-bank-gray-dark">
                                    +{option.price.toFixed(0)} {t('currency', '₸')}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="checkout-summary pt-4">
                    <h2 className="text-lg font-semibold text-bank-gray-dark mb-4 border-b border-gray-200 pb-3">3. {t('summary', 'Итог заказа')}</h2>
                    <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-bank-gray-DEFAULT">
                            <span>{t('itemsCost', 'Стоимость товаров')}:</span>
                            <span className="font-medium text-bank-gray-dark">{cartTotalPrice.toFixed(0)} {t('currency', '₸')}</span>
                        </div>
                        <div className="flex justify-between text-bank-gray-DEFAULT">
                            <span>{t('deliveryCost', { deliveryName: currentDeliveryNameForMessage, defaultValue: `Доставка (${currentDeliveryNameForMessage})` })}:</span>
                            <span className="font-medium text-bank-gray-dark">+{selectedDelivery.price.toFixed(0)} {t('currency', '₸')}</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-bank-gray-dark mt-5 pt-5 border-t border-dashed border-gray-300">
                        <span>{t('totalPayable', 'К оплате')}:</span>
                        <span className="text-bank-green">{finalTotalPrice.toFixed(0)} {t('currency', '₸')}</span>
                    </div>

                    {formError && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md shadow-sm">{formError}</p>}
                    {specificErrorMessageComponent}

                    <button
                        type="submit"
                        className="mt-8 w-full flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-bank-green hover:bg-bank-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bank-green transition-all duration-150 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={orderState.loading === 'pending' || cartItems.length === 0 || isCheckingPendingOrders || (orderState.error && orderState.error.unavailableItems && orderState.error.unavailableItems.length > 0) }
                    >
                        {isCheckingPendingOrders || orderState.loading === 'pending' ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        ) : null}
                        {isCheckingPendingOrders ? t('checkout.checkingOrders', 'Проверка заказов...') : orderState.loading === 'pending' ? t('processingOrder', 'Обработка...') : t('confirmAndWhatsapp', 'Подтвердить и перейти в WhatsApp')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;