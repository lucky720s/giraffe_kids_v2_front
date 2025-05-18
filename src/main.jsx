// src/main.jsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, persistor } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App.jsx';
import './i18n';
import './index.css';
import Modal from 'react-modal';

const Loader = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-bank-green"></div>
    </div>
);

const rootElement = document.getElementById('root');
if (rootElement) {
    Modal.setAppElement(rootElement);
} else {
    console.warn('Modal.setAppElement: #root element not found. Modals may have accessibility issues.');

}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={<Loader />} persistor={persistor}>
                <Suspense fallback={<Loader />}>
                    <App />
                </Suspense>
            </PersistGate>
        </Provider>
    </React.StrictMode>
);