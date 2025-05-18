import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, clearProductError } from '../features/products/productsSlice';
import ProductList from '../features/products/ProductList';
import FilterSidebar from '../features/products/FilterSidebar';

const HomePage = () => {
    const dispatch = useDispatch();
    const {
        items: products,
        loading,
        error,
        filters
    } = useSelector((state) => state.products);

    useEffect(() => {
        dispatch(fetchProducts(filters));
        return () => {
            // dispatch(clearProductError()); // Раскомментируйте, если нужна очистка ошибки при уходе со страницы
        };
    }, [dispatch, filters]);

    return (
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
            <div className="w-full md:w-64 lg:w-72 flex-shrink-0">
                <FilterSidebar />
            </div>
            <main className="flex-grow min-w-0">
                <ProductList products={products} loading={loading} error={error} />
            </main>
        </div>
    );
};

export default HomePage;