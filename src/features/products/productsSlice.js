// src/features/products/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/products', { params: filters });
            return response.data;
        } catch (error) {
            console.error("Error fetching products:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Не удалось загрузить товары');
        }
    }
);
export const fetchFilterOptions = createAsyncThunk(
    'products/fetchFilterOptions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/filters');
            return response.data;
        } catch (error) {
            console.error("Error fetching filter options:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Не удалось загрузить опции фильтров');
        }
    }
);

const initialState = {
    items: [],
    loading: 'idle',
    error: null,
    filters: {
        'brand[]': [],
        'age[]': [],
        gender: null,
    },
    availableBrands: [],
    allAvailableAges: [],
    agesByBrand: {},
    availableGenders: ["Мальчик", "Девочка"],

    filtersLoading: 'idle',
    filtersError: null,
};

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        toggleBrandFilter(state, action) {
            const brand = action.payload;
            const currentBrandFilter = state.filters['brand[]'];
            const brandIndex = currentBrandFilter.indexOf(brand);

            if (brandIndex === -1) {
                currentBrandFilter.push(brand);
            } else {
                currentBrandFilter.splice(brandIndex, 1);
            }
            state.filters['age[]'] = [];
        },
        toggleAgeFilter(state, action) {
            const age = action.payload;
            const currentAgeFilter = state.filters['age[]'];
            const ageIndex = currentAgeFilter.indexOf(age);

            if (ageIndex === -1) {
                currentAgeFilter.push(age);
            } else {
                currentAgeFilter.splice(ageIndex, 1);
            }
        },
        setGenderFilter(state, action) {
            const gender = action.payload;
            state.filters.gender = state.filters.gender === gender ? null : gender;
        },
        clearFilters(state) {
            state.filters['brand[]'] = [];
            state.filters['age[]'] = [];
            state.filters.gender = null;
        },
        clearProductError(state) {
            state.error = null;
        },
        clearFiltersError(state) {
            state.filtersError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload || 'Произошла неизвестная ошибка при загрузке товаров';
            })
            .addCase(fetchFilterOptions.pending, (state) => {
                state.filtersLoading = 'pending';
                state.filtersError = null;
            })
            .addCase(fetchFilterOptions.fulfilled, (state, action) => {
                state.filtersLoading = 'succeeded';
                state.availableBrands = action.payload.brands || [];
                state.allAvailableAges = action.payload.allAges || [];
                state.agesByBrand = action.payload.agesByBrand || {};
            })
            .addCase(fetchFilterOptions.rejected, (state, action) => {
                state.filtersLoading = 'failed';
                state.filtersError = action.payload || 'Произошла неизвестная ошибка при загрузке фильтров';
            });
    },
});

export const {
    toggleBrandFilter,
    toggleAgeFilter,
    setGenderFilter,
    clearFilters,
    clearProductError,
    clearFiltersError
} = productsSlice.actions;

export default productsSlice.reducer;