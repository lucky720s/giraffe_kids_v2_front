// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import NotFoundPage from './pages/NotFoundPage.jsx';
import CartChecker from './utils/CartChecker';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderHistoryPage from "./pages/OrderHistoryPage";
function App() {
    return (
        <Router>
            <CartChecker />
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="products/:productId" element={<ProductDetailPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="order/:orderId" element={<OrderDetailsPage />} />
                    <Route path="history" element={<OrderHistoryPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;