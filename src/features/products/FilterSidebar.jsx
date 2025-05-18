// src/features/products/FilterSidebar.jsx
import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { translateAgeString } from '../../utils/translateAge';
import { compareAgeStrings } from '../../utils/ageSorter.js';
import {
    toggleBrandFilter,
    toggleAgeFilter,
    setGenderFilter,
    clearFilters,
    fetchProducts,
    fetchFilterOptions
} from './productsSlice';
import Loader from '../../components/Loader.jsx';
import { store } from '../../store/store';

const FilterSidebar = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const {
        filters,
        availableBrands,
        allAvailableAges,
        agesByBrand,
        availableGenders,
        filtersLoading,
        filtersError
    } = useSelector((state) => state.products);

    useEffect(() => {
        if (filtersLoading === 'idle') {
            dispatch(fetchFilterOptions());
        }
    }, [dispatch, filtersLoading]);

    const displayableAges = useMemo(() => {
        const selectedBrands = filters['brand[]'];
        let agesToSort;

        if (selectedBrands.length > 0) {
            const agesForSelectedBrands = new Set();
            selectedBrands.forEach(brand => {
                if (agesByBrand[brand] && Array.isArray(agesByBrand[brand])) {
                    [...agesByBrand[brand]].forEach(age => agesForSelectedBrands.add(age));
                }
            });
            agesToSort = Array.from(agesForSelectedBrands);
        } else {
            agesToSort = [...allAvailableAges];
        }
        return agesToSort.sort(compareAgeStrings);

    }, [filters['brand[]'], agesByBrand, allAvailableAges]);
    const handleFilterChange = (actionCreator, value) => {
        dispatch(actionCreator(value));
        const updatedFilters = store.getState().products.filters;
        dispatch(fetchProducts({ ...updatedFilters }));
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
        dispatch(fetchProducts({}));
    };

    if (filtersLoading === 'pending') {
        return <aside className="w-full md:w-64 lg:w-72 p-4 bg-white rounded-xl shadow-lg space-y-6"><Loader /></aside>;
    }

    if (filtersError) {
        return <aside className="w-full md:w-64 lg:w-72 p-4 bg-white rounded-xl shadow-lg space-y-6 text-red-500">{t('filtersError', 'Ошибка загрузки фильтров')}: {filtersError}</aside>;
    }

    const hasActiveFilters = filters['brand[]'].length > 0 || filters['age[]'].length > 0 || filters.gender !== null;

    return (
        <aside className="w-full md:w-64 lg:w-72 p-4 bg-white rounded-xl shadow-lg space-y-6 sticky top-24 self-start">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-semibold text-bank-gray-dark">{t('filters', 'Фильтры')}</h3>
                {hasActiveFilters && (
                    <button
                        onClick={handleClearFilters}
                        className="text-xs text-bank-green hover:text-bank-green-dark font-medium transition-colors"
                    >
                        {t('clearAllFilters', 'Сбросить все')}
                    </button>
                )}
            </div>

            {availableBrands.length > 0 && (
                <div className="filter-group">
                    <h4 className="text-sm font-semibold text-bank-gray-dark mb-2">{t('brand', 'Бренд')}</h4>
                    <div className="flex flex-wrap gap-2">
                        {availableBrands.map((brand) => (
                            <button
                                key={brand}
                                onClick={() => handleFilterChange(toggleBrandFilter, brand)}
                                className={`px-3 py-1.5 text-xs rounded-full border transition-all
                                    ${filters['brand[]'].includes(brand)
                                    ? 'bg-bank-green text-white border-bank-green-dark shadow-sm'
                                    : 'bg-bank-gray-light text-bank-gray-dark hover:bg-gray-200 border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                {brand}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {displayableAges.length > 0 && (
                <div className="filter-group">
                    <h4 className="text-sm font-semibold text-bank-gray-dark mb-2">{t('age', 'Возраст')}</h4>
                    <div className="flex flex-wrap gap-2">
                        {displayableAges.map((age) => (
                            <button
                                key={age}
                                onClick={() => handleFilterChange(toggleAgeFilter, age)}
                                className={`px-3 py-1.5 text-xs rounded-full border transition-all
                                    ${filters['age[]'].includes(age)
                                    ? 'bg-bank-green text-white border-bank-green-dark shadow-sm'
                                    : 'bg-bank-gray-light text-bank-gray-dark hover:bg-gray-200 border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                {translateAgeString(age, t)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {availableGenders.length > 0 && (
                <div className="filter-group">
                    <h4 className="text-sm font-semibold text-bank-gray-dark mb-2">{t('gender', 'Пол')}</h4>
                    <div className="flex flex-wrap gap-2">
                        {availableGenders.map((gender) => (
                            <button
                                key={gender}
                                onClick={() => handleFilterChange(setGenderFilter, gender)}
                                className={`px-3 py-1.5 text-xs rounded-full border transition-all
                                    ${filters.gender === gender
                                    ? 'bg-bank-green text-white border-bank-green-dark shadow-sm'
                                    : 'bg-bank-gray-light text-bank-gray-dark hover:bg-gray-200 border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                {t(gender)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
};
export default FilterSidebar;