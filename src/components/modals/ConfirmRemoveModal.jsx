import React from 'react';
import Modal from 'react-modal';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const customModalStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0',
        border: 'none',
        borderRadius: '0.75rem',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        maxWidth: '400px',
        width: '90%',
        overflow: 'hidden',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 50,
    },
};



const ConfirmRemoveModal = ({ isOpen, onRequestClose, onConfirm, productName }) => {
    const { t } = useTranslation();

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customModalStyles}
            contentLabel={t('confirmRemoveModal.title', 'Подтверждение удаления')}
        >
            <div className="bg-white rounded-xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-bank-gray-dark flex items-center">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
                        {t('confirmRemoveModal.header', 'Удалить товар?')}
                    </h3>
                    <button
                        onClick={onRequestClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label={t('common.close', 'Закрыть')}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-5 sm:p-6">
                    <p className="text-sm text-bank-gray-DEFAULT">
                        {t('confirmRemoveModal.message', { productName: productName || t('confirmRemoveModal.thisItem', 'этот товар') })}
                    </p>
                </div>
                <div className="flex justify-end space-x-3 bg-gray-50 p-4 border-t border-gray-200 rounded-b-xl">
                    <button
                        onClick={onRequestClose}
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-bank-gray-dark bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-bank-gray-light transition-colors"
                    >
                        {t('common.cancel', 'Отмена')}
                    </button>
                    <button
                        onClick={onConfirm}
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-colors"
                    >
                        {t('confirmRemoveModal.confirmButton', 'Да, убрать')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmRemoveModal;