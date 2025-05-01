import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import HeaderCheckout from './components/HeaderCheckout/HeaderCheckout'; // твій інший хедер для Checkout
import CartDrawer from './components/CartDrawer/CartDrawer.tsx';
import Footer from './components/Footer/Footer';
import HomePage from './Pages/HomePage/HomePage';
import CategoryPage from './Pages/CategoryPage/CategoryPage';
import ProductPage from './Pages/ProductPage/ProductPage';
import SalePage from './Pages/SalePage/SalePage.tsx';
import NewPage from './Pages/NewPage/NewPage.tsx';
import DeliveryPage from './Pages/DeliveryAndPaymentPage/DeliveryAndPaymentPage.tsx';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import CheckoutPage from './Pages/CheckoutPage/CheckoutPage';
import { OrderSuccesWrapper } from './Pages/SuccessPage/OrderSuccesWrapper';
import FaqPage from './Pages/FaqPage/FaqPage.tsx';
import PrivacyPolicyPage from './Pages/PrivacyPolicyPage/PrivacyPolicyPage.tsx';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';

import './App.css';
import './assets/styles/reset.css';
import './assets/fonts/stylesheet.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const apiUrlWp = 'https://www.say.projection-learn.website/';
export const apiUrl = 'https://www.say.projection-learn.website/wp-json/wc/v3/products';
export const consumerKey = 'ck_49130dfdfc750a8753ce12f98c540d6fc3d7bb77';
export const consumerSecret = 'cs_6793be5b47938c68448ba978d3aeb661a6a72a3f';


const Layout: React.FC = () => {

    const location = useLocation();

    const isCheckoutPage = location.pathname.includes('/checkout'); // або точна перевірка location.pathname === '/checkout'



    return (

        <div className="flex flex-col min-h-screen relative">


            {isCheckoutPage ? <HeaderCheckout /> : <Header />}




            <CartDrawer />

            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<CategoryPage />} />
                    <Route path="/product-category/:slug" element={<CategoryPage />} />
                    <Route path="/product/:slug/:color?" element={<ProductPage />} />
                    <Route path="/sales" element={<SalePage />} />
                    <Route path="/new" element={<NewPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/checkout-success" element={<OrderSuccesWrapper />} />
                    <Route path="/how-to-buy" element={<DeliveryPage />} />
                    <Route path="/faqs" element={<FaqPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <ScrollToTop />
            <Layout />
        </Router>
    );
};

export default App;
