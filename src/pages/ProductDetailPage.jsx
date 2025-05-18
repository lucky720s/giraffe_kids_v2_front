// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, removeItem, selectIsInCart } from '../features/cart/cartSlice.js';
import apiClient from '../services/api';
import Loader from '../components/Loader.jsx';
import { useTranslation } from 'react-i18next';
import { translateAgeString } from '../utils/translateAge.js';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ProductCard from '../features/products/ProductCard.jsx';

const PLACEHOLDER_IMAGE = '/assets/placeholder.png';

const ProductDetailPage = () => {
    const { t } = useTranslation();
    const { productId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [similarProducts, setSimilarProducts] = useState([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);

    const isInCart = useSelector(selectIsInCart(productId));

    const fetchSimilarProducts = async (currentProductId) => {
        if (!currentProductId) return;
        setLoadingSimilar(true);
        setSimilarProducts([]);
        try {
            const response = await apiClient.get(`/products/similar/${currentProductId}`);
            setSimilarProducts(response.data || []);
        } catch (err) {
            console.error("Error fetching similar products:", err);
            setSimilarProducts([]);
        } finally {
            setLoadingSimilar(false);
        }
    };

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            setError(null);
            setProduct(null);
            setSimilarProducts([]);

            try {
                const response = await apiClient.get(`/products/${productId}`);
                setProduct(response.data);
                if (response.data && response.data.id) {
                    fetchSimilarProducts(response.data.id);
                }
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError(err.response?.data?.message || err.message || t('failedToLoadProduct', 'Не удалось загрузить информацию о товаре.'));
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductDetails();
        }
        return () => {
            setSimilarProducts([]);
        }
    }, [productId, t]);

    const handleGoBack = () => navigate(-1);
    const handleAddToCart = () => { if (product && product.status === 'available') dispatch(addItem(product)); };
    const handleRemoveFromCart = () => { if (product) dispatch(removeItem(product.id)); };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-red-500 bg-red-100 p-4 rounded-lg">{t('error', 'Ошибка')}: {error}</p>
                <button
                    onClick={handleGoBack}
                    className="mt-6 inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-bank-green hover:bg-bank-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bank-green"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    {t('back', 'Назад')}
                </button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-bank-gray-dark">{t('productNotFound', 'Товар не найден')}</p>
                <button
                    onClick={handleGoBack}
                    className="mt-6 inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-bank-green hover:bg-bank-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bank-green"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    {t('back', 'Назад')}
                </button>
            </div>
        );
    }

    const imageUrl = product.imageUrl || PLACEHOLDER_IMAGE;
    const displayName = product.name || t('unknownProductName', 'Товар');
    const displayAge = translateAgeString(product.age, t);
    const displayGender = product.gender ? t(product.gender) : '';

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            <button
                onClick={handleGoBack}
                className="mb-6 inline-flex items-center text-sm font-medium text-bank-gray-DEFAULT hover:text-bank-green transition-colors group"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2 text-bank-gray-dark group-hover:text-bank-green transition-colors" />
                {t('back', 'Назад')}
            </button>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-10 md:mb-16">
                <div className="md:flex">
                    <div className="md:w-1/2 xl:w-2/5 md:flex-shrink-0">
                        <div className="relative aspect-square bg-gray-100">
                            <img
                                src={imageUrl}
                                alt={displayName}
                                className="absolute inset-0 w-full h-full object-contain p-2 sm:p-4"
                                onError={(e) => {
                                    if (e.target.src !== PLACEHOLDER_IMAGE) {
                                        e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE;
                                    }
                                }}
                            />
                            {product.status !== 'available' && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                    <span className="px-4 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-full uppercase tracking-wider shadow-md">
                                        {product.status === 'reserved' ? t('reserved') : t('sold')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-bank-gray-dark mb-2">
                                {displayName}
                            </h1>
                            <p className="text-2xl lg:text-3xl font-bold text-bank-green mb-4">
                                {product.price?.toFixed(0)} {t('currency', '₸')}
                            </p>
                            <div className="space-y-1 text-sm text-bank-gray-DEFAULT mb-6">
                                {displayAge && <p><span className="font-semibold">{t('age', 'Возраст')}:</span> {displayAge}</p>}
                                {displayGender && <p><span className="font-semibold">{t('gender', 'Пол')}:</span> {displayGender}</p>}
                            </div>
                        </div>
                        <div className="mt-6">
                            {product.status === 'available' ? (
                                isInCart ? (
                                    <button
                                        onClick={handleRemoveFromCart}
                                        className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                        {t('removeFromCart', 'Убрать из корзины')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-bank-green hover:bg-bank-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bank-green transition-colors"
                                    >
                                        {t('addToCart', 'В корзину')}
                                    </button>
                                )
                            ) : (
                                <div className="w-full sm:w-auto text-center px-8 py-3 text-base font-medium rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed">
                                    {product.status === 'reserved' ? t('reserved') : t('sold')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {(loadingSimilar || similarProducts.length > 0) && (
                <div className="pt-6 md:pt-8 border-t border-gray-200">
                    <h2 className="text-xl sm:text-2xl font-bold text-bank-gray-dark mb-4 sm:mb-6">
                        {t('similarProducts', 'Похожие товары')}
                    </h2>
                    {loadingSimilar ? (
                        <Loader />
                    ) : similarProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                            {similarProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    ) : (
                        !error && <p className="text-bank-gray-DEFAULT">{t('noSimilarProducts', 'Похожие товары не найдены.')}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;