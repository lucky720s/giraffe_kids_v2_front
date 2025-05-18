// src/features/cart/cartSlice.js
import { createSlice, createSelector } from '@reduxjs/toolkit';

const MAX_CART_ITEMS = 30;

const initialState = {
    items: {},
    unavailableItems: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addItem(state, action) {
            const product = action.payload;
            if (!product || !product.id) return;

            if (Object.keys(state.items).length >= MAX_CART_ITEMS && !state.items[product.id]) {
                console.warn(`Достигнут лимит корзины (${MAX_CART_ITEMS} товаров). Товар "${product.name}" не добавлен.`);
                alert(`Достигнут лимит корзины (${MAX_CART_ITEMS} уникальных товаров). Вы не можете добавить больше.`);
                return;
            }

            if (!state.items[product.id]) {
                state.items[product.id] = {
                    productDetails: {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        age: product.age,
                        gender: product.gender,
                        status: product.status,
                    },
                };
            }
        },
        removeItem(state, action) {
            const productId = action.payload;
            if (productId && state.items[productId]) {
                delete state.items[productId];
            }
        },
        clearCart(state) {
            state.items = {};
            state.unavailableItems = [];
        },
        removeUnavailableItems(state, action) {
            const unavailableIds = action.payload;
            if (!Array.isArray(unavailableIds)) return;
            unavailableIds.forEach(id => {
                if (state.items[id]) {
                    delete state.items[id];
                }
            });
        },
        setUnavailableItems(state, action) {
            state.unavailableItems = action.payload;
        },
    },
});

export const {
    addItem,
    removeItem,
    clearCart,
    removeUnavailableItems,
    setUnavailableItems,
} = cartSlice.actions;

const selectCartState = (state) => state.cart;

export const selectCartItems = createSelector(
    [selectCartState],
    (cart) => Object.values(cart?.items || {})
);

export const selectCartTotalQuantity = createSelector(
    [selectCartItems],
    (items) => items.length
);

export const selectCartTotalPrice = createSelector(
    [selectCartItems],
    (items) => items.reduce((total, item) => {
        const price = item.productDetails?.price;
        return total + (typeof price === 'number' ? price : 0);
    }, 0)
);

export const selectIsInCart = (productId) => createSelector(
    [selectCartState],
    (cart) => !!cart?.items?.[productId]
);

export const selectUnavailableCartItems = createSelector(
    [selectCartState],
    (cart) => cart.unavailableItems
);

export default cartSlice.reducer;