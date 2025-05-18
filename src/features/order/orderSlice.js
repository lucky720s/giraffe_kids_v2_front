// src/features/order/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api.js';
export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (orderDetails, { rejectWithValue /*, dispatch */ }) => {
        try {
            const response = await apiClient.post('/orders', orderDetails);
            return response.data; // { orderId, totalAmount }
        } catch (error) {
            console.error("Error creating order (orderSlice):", error.response?.data || error.message);
            return rejectWithValue(error.response?.data || { message: 'Не удалось создать заказ' });
        }
    }
);

const initialState = {
    loading: 'idle',
    error: null,
    currentOrder: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        resetOrderState(state) {
            state.loading = 'idle';
            state.error = null;
            state.currentOrder = null;
        },
        clearOrderError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
                state.currentOrder = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.currentOrder = action.payload;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            });
    },
});

export const { resetOrderState, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;