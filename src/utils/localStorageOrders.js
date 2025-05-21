// src/utils/localStorageOrders.js
const HISTORY_KEY = 'giraffekids_orderHistory_v2'; // Изменил ключ на случай, если есть старые данные
const MAX_HISTORY_ITEMS = 30; // Максимальное количество ID заказов в истории


export const getOrderIdsFromHistory = () => {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (e) {
        console.error("Error reading order history from localStorage", e);
        return [];
    }
};

export const addOrderToHistory = (orderId, orderDate) => {
    if (!orderId || !orderDate) {
        console.error("Invalid orderId or orderDate for history", { orderId, orderDate });
        return;
    }
    try {
        let history = getOrderIdsFromHistory();
        if (history.find(o => o.orderId === orderId)) {
            return; // Уже есть такой заказ
        }
        history.unshift({ orderId, date: orderDate }); // Добавляем в начало
        if (history.length > MAX_HISTORY_ITEMS) {
            history = history.slice(0, MAX_HISTORY_ITEMS);
        }
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error("Error saving order to history in localStorage", e);
    }
};

export const clearOrderHistoryStorage = () => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
        console.error("Error clearing order history from localStorage", e);
    }
};