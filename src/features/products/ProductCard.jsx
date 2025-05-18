// src/features/products/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, removeItem, selectIsInCart } from '../cart/cartSlice.js';
import { useTranslation } from 'react-i18next';
import { translateAgeString } from '../../utils/translateAge';
import ConfirmRemoveModal from '../../components/modals/ConfirmRemoveModal.jsx';
import { ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline';

const PLACEHOLDER_IMAGE = '/assets/placeholder.png';

const ProductCard = ({ product }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isInCart = useSelector(selectIsInCart(product.id));

    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

    const imageUrl = product.imageUrl || PLACEHOLDER_IMAGE;

    const handleButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.status === 'available') {
            if (isInCart) {
                setIsRemoveModalOpen(true);
            } else {
                dispatch(addItem(product));
            }
        }
    };

    const handleConfirmRemove = () => {
        dispatch(removeItem(product.id));
        setIsRemoveModalOpen(false);
    };

    const handleCloseModal = () => {
        setIsRemoveModalOpen(false);
    };

    const displayName = product.name || t('unknownProductName', 'Товар');
    const displayAge = translateAgeString(product.age, t);
    const displayGender = product.gender ? t(product.gender) : '';

    const buttonText = isInCart ? t('removeFromCartShort', 'Убрать') : t('addToCart', 'В корзину');
    const ButtonIcon = isInCart ? TrashIcon : ShoppingCartIcon;
    const buttonActionText = isInCart ? t('removeFromCart', 'Убрать из корзины') : t('addToCart', 'В корзину');


    return (
        <>
            <Link
                to={`/products/${product.id}`}
                className={`group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col overflow-hidden border-2 ${isInCart && product.status === 'available' ? 'border-bank-green ring-2 ring-bank-green/50' : 'border-transparent'}`}
            >
                <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                    <img
                        src={imageUrl}
                        alt={displayName}
                        className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                            if (e.target.src !== PLACEHOLDER_IMAGE) {
                                e.target.onerror = null;
                                e.target.src = PLACEHOLDER_IMAGE;
                            }
                        }}
                    />
                    {product.status !== 'available' && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-md">
                                {product.status === 'reserved' ? t('reserved', 'Резерв') : t('sold', 'Продан')}
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <h3 className="text-sm md:text-base font-semibold text-bank-gray-dark group-hover:text-bank-green transition-colors truncate mb-1 h-10 leading-tight flex items-center" title={displayName}>
                        {displayName}
                    </h3>
                    <p className="text-xs text-bank-gray-DEFAULT mb-2">
                        {displayAge && <span>{t('age', 'Возраст')}: {displayAge}</span>}
                        {displayAge && displayGender && <span className="mx-1">/</span>}
                        {displayGender && <span>{t('gender', 'Пол')}: {displayGender}</span>}
                    </p>

                    <div className="mt-auto">
                        <p className="text-base md:text-lg font-bold text-bank-gray-dark mb-3">
                            {product.price?.toFixed(0)} {t('currency', '₸')}
                        </p>
                        {product.status === 'available' ? (
                            <button
                                onClick={handleButtonClick}
                                title={buttonActionText}
                                className={`w-full text-xs sm:text-sm font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center
                                    ${isInCart
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 focus:ring-red-400'
                                    : 'bg-bank-green text-white hover:bg-bank-green-dark focus:ring-bank-green'
                                }`}
                            >
                                <ButtonIcon className={`h-4 w-4 sm:h-5 sm:w-5 mr-1.5 ${isInCart ? 'text-red-500' : ''}`} />
                                {buttonText}
                            </button>
                        ) : (
                            <div className="w-full text-center text-xs sm:text-sm font-semibold py-2.5 px-3 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed">
                                {product.status === 'reserved' ? t('reserved', 'Резерв') : t('sold', 'Продан')}
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            <ConfirmRemoveModal
                isOpen={isRemoveModalOpen}
                onRequestClose={handleCloseModal}
                onConfirm={handleConfirmRemove}
                productName={displayName}
            />
        </>
    );
};

export default ProductCard;