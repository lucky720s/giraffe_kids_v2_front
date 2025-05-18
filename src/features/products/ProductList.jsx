// src/features/products/ProductList.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import Loader from '../../components/Loader';

const ProductList = ({ products, loading, error }) => {
    const { t } = useTranslation();

    if (loading === 'pending') {
        return <Loader />;
    }

    if (error) {
        return <div className="p-4 text-center text-red-600 bg-red-100 border border-red-300 rounded-lg">{t('errorLoadingProducts', 'Ошибка загрузки товаров')}: {error}</div>;
    }

    if (!products || products.length === 0) {
        return <div className="py-8 text-center text-bank-gray-DEFAULT">{t('productsNotFound', 'Товары не найдены.')}</div>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductList;