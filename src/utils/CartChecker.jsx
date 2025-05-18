// src/utils/CartChecker.jsx
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeUnavailableItems, setUnavailableItems, selectCartItems } from '../features/cart/cartSlice';
import apiClient from '../services/api';
import { useTranslation } from 'react-i18next';

const CHECK_INTERVAL = 30000;

const CartChecker = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const cartItemsFromStore = useSelector(selectCartItems);

    const latestCartItemsRef = useRef(cartItemsFromStore);

    useEffect(() => {
        latestCartItemsRef.current = cartItemsFromStore;
    }, [cartItemsFromStore]);

    useEffect(() => {
        const checkCartItemsAvailability = async () => {
            const currentCartItems = latestCartItemsRef.current;

            if (!currentCartItems || currentCartItems.length === 0) {
                return;
            }

            try {
                const itemIdsToCheck = currentCartItems.map(item => item.productDetails.id);
                if (itemIdsToCheck.length === 0) return;

                const response = await apiClient.post('/cart/check', {
                    items: itemIdsToCheck,
                });

                const { unavailableItems: serverUnavailableItems } = response.data;

                if (serverUnavailableItems && serverUnavailableItems.length > 0) {
                    const unavailableIds = serverUnavailableItems.map(item => item.id);
                    dispatch(setUnavailableItems(serverUnavailableItems));
                    dispatch(removeUnavailableItems(unavailableIds));

                    const unavailableNames = serverUnavailableItems.map(item => item.name || `ID: ${item.id}`).join(', ');
                    alert(t('unavailableItemsError', { items: unavailableNames, defaultValue: `К сожалению, следующие товары стали недоступны и были удалены из корзины: ${unavailableNames}` }));
                } else {
                    dispatch(setUnavailableItems([]));
                }
            } catch (error) {
                console.error('Ошибка при проверке доступности товаров в корзине:', error);
            }
        };

        if (latestCartItemsRef.current && latestCartItemsRef.current.length > 0) {
            checkCartItemsAvailability();
        }

        const intervalId = setInterval(checkCartItemsAvailability, CHECK_INTERVAL);

        return () => {
            clearInterval(intervalId);
        };
    }, [dispatch, t]);

    return null;
};

export default CartChecker;