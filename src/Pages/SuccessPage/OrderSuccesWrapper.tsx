import { useLocation, Navigate } from 'react-router-dom';
import { OrderSucces } from './SuccessPage';
import type { OrderData } from './SuccessPage'; // обов'язково експортуй його

export const OrderSuccesWrapper = () => {
    const location = useLocation();
    const orderData = location.state?.order as OrderData | undefined;

    if (!orderData) {
        return <Navigate to="/" replace />;
    }

    return <OrderSucces data={orderData} />;
};
