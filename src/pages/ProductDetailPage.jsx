// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [similarProducts, setSimilarProducts] = useState([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);

    const isInCart = useSelector(selectIsInCart(productId));

    const queryParams = new URLSearchParams(location.search);
    const source = queryParams.get('source');
    const hideSimilarProducts = source === 'order';

    const fetchSimilarProducts = async (currentProductId) => {
        if (!currentProductId || hideSimilarProducts) {
            setSimilarProducts([]);
            return;
        }
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
            window.scrollTo(0, 0);

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
    }, [productId, t, hideSimilarProducts]);

    const handleGoBack = () => navigate(-1);
    const handleAddToCart = () => { if (product && product.status === 'available' && !isInCart) dispatch(addItem(product)); };
    const handleRemoveFromCart = () => { if (product && isInCart) dispatch(removeItem(product.id)); };

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
                <p className="text-red-500 bg-red-100 p-4 rounded-lg mb-4">{t('error', 'Ошибка')}: {error}</p>
                <button
                    onClick={handleGoBack}
                    className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-bank-green hover:bg-bank-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bank-green"
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
                <p className="text-bank-gray-dark mb-4">{t('productNotFound', 'Товар не найден')}</p>
                <button
                    onClick={handleGoBack}
                    className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-bank-green hover:bg-bank-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bank-green"
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

    const imageContainerClasses = hideSimilarProducts
        ? 'aspect-square max-h-[70vh] sm:max-h-[75vh] md:max-h-[60vh] md:aspect-[4/3] lg:aspect-square lg:max-h-[70vh] rounded-xl'
        : 'aspect-[4/3] sm:aspect-square max-h-[50vh] sm:max-h-[60vh] md:aspect-square md:max-h-none md:rounded-l-2xl md:rounded-tr-none';

    const mainProductCardFlexDirection = hideSimilarProducts ? 'flex-col md:flex-row' : 'md:flex';


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            <button
                onClick={handleGoBack}
                className="mb-6 inline-flex items-center text-sm font-medium text-bank-gray-DEFAULT hover:text-bank-green transition-colors group"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2 text-bank-gray-dark group-hover:text-bank-green transition-colors" />
                {t('back', 'Назад')}
            </button>

            <div className={`${!hideSimilarProducts ? 'lg:flex lg:gap-x-8 xl:gap-x-12' : 'flex justify-center'}`}> {/* Центрируем, если только товар */}
                <div className={`${!hideSimilarProducts ? 'lg:w-3/5 xl:w-[60%]' : 'w-full lg:max-w-4xl xl:max-w-5xl'} mb-10 lg:mb-0`}>
                    {product && (
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className={mainProductCardFlexDirection}>
                                <div className={`${!hideSimilarProducts ? 'md:w-1/2' : 'w-full md:w-3/5'} md:flex-shrink-0`}> {/* Увеличиваем долю картинки если она одна */}
                                    <div className={`relative w-full bg-gray-50 ${imageContainerClasses} overflow-hidden`}>
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
                                        {/* УСЛОВНОЕ ОТОБРАЖЕНИЕ СТАТУСА ТОВАРА */}
                                        {product.status !== 'available' && !hideSimilarProducts && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                                <span className="px-4 py-1.5 bg-red-600 text-white text-xs sm:text-sm font-semibold rounded-full uppercase tracking-wider shadow-lg">
                                                    {product.status === 'reserved' ? t('reserved') : t('sold')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={`p-5 sm:p-6 md:p-8 flex-grow flex flex-col ${!hideSimilarProducts ? '' : 'w-full md:w-2/5'}`}> {/* Уменьшаем долю текста если картинка большая */}
                                    <div className="flex-grow">
                                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-bank-gray-dark mb-2 leading-tight">
                                            {displayName}
                                        </h1>
                                        <p className="text-2xl sm:text-3xl font-bold text-bank-green mb-4">
                                            {product.price?.toFixed(0)} {t('currency', '₸')}
                                        </p>
                                        <div className="space-y-1.5 text-sm text-bank-gray-DEFAULT mb-6">
                                            {displayAge && <p><span className="font-semibold text-bank-gray-dark">{t('age', 'Возраст')}:</span> {displayAge}</p>}
                                            {displayGender && <p><span className="font-semibold text-bank-gray-dark">{t('gender', 'Пол')}:</span> {displayGender}</p>}
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-4">
                                        {/* Кнопки "В корзину" не нужны, если мы просматриваем товар из заказа */}
                                        {/* Можно оставить статус, если он 'available', но без возможности добавить */}
                                        {!hideSimilarProducts && product.status === 'available' ? (
                                            isInCart ? (
                                                <button
                                                    onClick={handleRemoveFromCart}
                                                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                >
                                                    {t('removeFromCart', 'Убрать из корзины')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleAddToCart}
                                                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-bank-green hover:bg-bank-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bank-green transition-colors shadow-md hover:shadow-lg"
                                                >
                                                    {t('addToCart', 'В корзину')}
                                                </button>
                                            )
                                        ) : !hideSimilarProducts ? (
                                            <div className="w-full sm:w-auto text-center px-6 py-3 text-sm sm:text-base font-medium rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed">
                                                {product.status === 'reserved' ? t('reserved') : t('sold')}
                                            </div>
                                        ) : null /* Ничего не показываем в кнопках, если смотрим из заказа */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!hideSimilarProducts && (loadingSimilar || similarProducts.length > 0) && (
                    <div className="lg:w-2/5 xl:w-[40%] mt-10 lg:mt-0 lg:sticky lg:top-24 self-start lg:max-h-[calc(100vh-theme(space.24)-theme(space.8))] lg:overflow-y-auto no-scrollbar">
                        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-bank-gray-dark mb-5">
                                {t('similarProducts', 'Похожие товары')}
                            </h2>
                            {loadingSimilar ? (
                                <Loader />
                            ) : similarProducts.length > 0 ? (
                                <>
                                    <div className="lg:hidden -mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto pb-4 -mb-4 no-scrollbar">
                                        <div className="flex space-x-4 py-1">
                                            {similarProducts.map(p => (
                                                <div key={p.id} className="w-36 sm:w-40 md:w-44 flex-shrink-0">
                                                    <ProductCard product={p} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="hidden lg:grid lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                        {similarProducts.map(p => (
                                            <ProductCard key={p.id} product={p} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                !error && product && <p className="text-bank-gray-DEFAULT text-sm">{t('noSimilarProducts', 'Похожие товары не найдены.')}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;