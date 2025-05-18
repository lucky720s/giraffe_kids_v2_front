// src/store/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import productsReducer from '../features/products/productsSlice';
import cartReducer from '../features/cart/cartSlice';
import orderReducer from '../features/order/orderSlice.js';
const cartPersistConfig = {
    key: 'cart',
    storage,
    whitelist: ['items']
};

const rootReducer = combineReducers({
    products: productsReducer,
    cart: persistReducer(cartPersistConfig, cartReducer),
    order: orderReducer, // Теперь используется правильный orderReducer
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);