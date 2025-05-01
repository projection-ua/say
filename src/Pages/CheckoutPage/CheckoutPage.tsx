import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { updateQuantity, removeFromCart, clearCart } from '../../store/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { apiUrlWp, consumerKey, consumerSecret } from '../../App';
import { useState, useEffect } from 'react';
import s from './CheckoutPage.module.css';
import Select from 'react-select';
import { NpLocation } from "../../types/npTypes";
import { NovaPoshtaMapPopup } from "../../components/MapPopup/MapPopup";
import { LoaderMini } from "../../components/LoaderMini/LoaderMini";
import { StepNavigation } from '../../components/StepNavigation/StepNavigation';


interface ShippingMethod {
    id: number;
    title: string;
}

interface FormValues {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    shippingMethod: string;
    shippingCity: string;
    shippingStreet: string;
    shippingHouse: string;
    shippingEntrance: string;
    shippingApartment: string;
    shippingComment: string;
    paymentMethod: string;
    comment: string;
    coupon: string;
    giftCard: string;
    newsletter: boolean;
    acceptTerms: boolean;
    deliveryType: 'warehouse' | 'courier' | 'postomat';
    warehouseId: string;
}

interface PaymentMethod {
    id: string;
    title: string;
    enabled: boolean;
}

interface SelectOption {
    value: string;
    label: string;
}


interface CouponData {
    id: number;
    code: string;
    amount: string;
    discount_type: string;
    date_expires: string | null;
    meta_data: { key: string; value: string }[];
}

interface OrderLineItem {
    product_id: number;
    variation_id?: number;
    quantity: number;
}

interface OrderData {
    payment_method: string;
    payment_method_title: string;
    set_paid: boolean;
    billing: {
        first_name: string;
        last_name: string;
        phone: string;
        email: string;
        address_1: string;
        address_2: string;
        city: string;
        country: string;
    };
    shipping: {
        first_name: string;
        last_name: string;
        address_1: string;
        address_2: string;
        city: string;
        country: string;
    };
    shipping_lines: {
        method_id: string;
        method_title: string;
    }[];
    line_items: OrderLineItem[];
    customer_note: string;
    coupon_lines: { code: string }[];
    meta_data: { key: string; value: string }[];
}

const CheckoutPage: React.FC = () => {
    const { items } = useSelector((state: RootState) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCouponOpen, setCouponOpen] = useState(false);
    const [isGiftOpen, setGiftOpen] = useState(false);
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const [isLoadingCheckoutData, setIsLoadingCheckoutData] = useState(true);

    const [showMapPopup, setShowMapPopup] = useState(false);


    const [npLocations, setNpLocations] = useState<NpLocation[]>([]);
    const [selectedCity, setSelectedCity] = useState<string>('');


    const deliveryTypeOptions = [
        { value: 'warehouse', label: 'Відділення' },
        { value: 'courier', label: 'Курʼєр' },
        { value: 'postomat', label: 'Поштомат' }, // 🆕 новий тип доставки
    ];


    const topCities = ['Київ', 'Львів', 'Харків', 'Дніпро', 'Одеса'];

    const allCityOptions: SelectOption[] = npLocations.map(loc => ({
        value: loc.name,
        label: loc.name,
    }));


    const getFilteredWarehouses = (type: 'warehouse' | 'postomat') => {
        const currentCity = npLocations.find(loc => loc.name === selectedCity);
        if (!currentCity) return [];

        const isPostomat = (name: string) => name.toLowerCase().includes('поштомат');

        return currentCity.warehouses
            .filter(w => type === 'postomat' ? isPostomat(w.name) : !isPostomat(w.name))
            .map(w => ({
                value: w.name,
                label: w.name,
            }));
    };





    const filterCityOptions = (candidate: SelectOption, input: string): boolean => {
        // Якщо пошуку немає — показати тільки топ-міста
        if (!input) return topCities.includes(candidate.label);
        // Якщо є пошук — показати всі відповідності
        return candidate.label.toLowerCase().includes(input.toLowerCase());
    };


    const getStreetOptions = (): SelectOption[] =>
        (npLocations.find(loc => loc.name === selectedCity)?.streets || []).map(street => ({
            value: street,
            label: street,
        }));



    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
    const [couponValid, setCouponValid] = useState<boolean | null>(null);
    const [couponError, setCouponError] = useState('');
    const [couponAmount, setCouponAmount] = useState<number | null>(null);


    const [giftValid, setGiftValid] = useState<boolean | null>(null);
    const [giftAmount, setGiftAmount] = useState<number | null>(null);
    const [giftError, setGiftError] = useState('');
    const [isCheckingGift, setIsCheckingGift] = useState(false);



    const [step, setStep] = useState(1);
    const isMobile = window.innerWidth < 1024; // або використовуй хук useIsMobile

    const handleStepClick = (targetStep: number) => {
        setStep(targetStep); // ❗️важливо: не +1
    };




    useEffect(() => {
        (async () => {
            try {
                setIsLoadingCheckoutData(true); // 👉 Перед початком — лоадінг

                const shippingResponse = await fetch(`${apiUrlWp}wp-json/wc/v3/shipping/zones/1/methods`, {
                    headers: { Authorization: 'Basic ' + btoa(`${consumerKey}:${consumerSecret}`) },
                });
                const paymentResponse = await fetch(`${apiUrlWp}wp-json/wc/v3/payment_gateways`, {
                    headers: { Authorization: 'Basic ' + btoa(`${consumerKey}:${consumerSecret}`) },
                });
                const warehouseResponse = await fetch(`${apiUrlWp}wp-json/responses/v1/np_warehouses`, {
                    headers: { Authorization: 'Basic ' + btoa(`${consumerKey}:${consumerSecret}`) },
                });

                const shippingData = await shippingResponse.json();
                const paymentData = await paymentResponse.json();
                const warehouseData = await warehouseResponse.json();

                setShippingMethods(shippingData);
                setPaymentMethods(paymentData.filter((p: PaymentMethod) => p.enabled));
                setNpLocations(Array.isArray(warehouseData) ? warehouseData : []);

                // ✅ Автовибір першого способу доставки
                if (shippingData.length > 0) {
                    formik.setFieldValue('shippingMethod', shippingData[0].id.toString());
                }

            } catch (error) {
                console.error('Помилка при завантаженні даних доставки:', error);
            } finally {
                setIsLoadingCheckoutData(false); // 👉 Після завантаження — вимикаємо лоадінг
            }
        })();
    }, []);


    const subtotal = items.reduce((sum, item) => sum + (item.regular_price * item.quantity), 0);
    const totalProducts = items.reduce((sum, item) => sum + ((item.sale_price ?? item.price) * item.quantity), 0);
    const discountProducts = subtotal - totalProducts;
    const shippingPrice = 0;
    const shippingCost = shippingPrice || 0;

    const appliedCouponDiscount = couponAmount || 0;
    const appliedGiftCard = giftAmount || 0;
    const finalTotal = totalProducts - appliedCouponDiscount - appliedGiftCard + shippingCost;

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required('Обовʼязково'),
        lastName: Yup.string().required('Обовʼязково'),
        phone: Yup.string().required('Обовʼязково'),
        email: Yup.string().email('Невірний формат email').required('Обовʼязково'),
        shippingMethod: Yup.string().required('Оберіть пошту'),
        paymentMethod: Yup.string().required('Оберіть спосіб оплати'),
        acceptTerms: Yup.boolean().oneOf([true], 'Ви повинні погодитися з умовами'),
        deliveryType: Yup.string().required('Оберіть тип доставки'),
        shippingCity: Yup.string().when('deliveryType', {
            is: (val: string) => val === 'courier',
            then: (schema) => schema.required('Місто обовʼязкове'),
            otherwise: (schema) => schema,
        }),
        shippingStreet: Yup.string().when('deliveryType', {
            is: (val: string) => val === 'courier',
            then: (schema) => schema.required('Вулиця обовʼязкова'),
            otherwise: (schema) => schema,
        }),
        shippingHouse: Yup.string().when('deliveryType', {
            is: (val: string) => val === 'courier',
            then: (schema) => schema.required('Будинок обовʼязковий'),
            otherwise: (schema) => schema,
        }),
        warehouseId: Yup.string().when('deliveryType', {
            is: (val: string) => val === 'warehouse',
            then: (schema) => schema.required('Виберіть відділення'),
            otherwise: (schema) => schema,
        }),
    });

    const formik = useFormik<FormValues>({
        initialValues: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            shippingMethod: '',
            shippingCity: '',
            shippingStreet: '',
            shippingHouse: '',
            shippingEntrance: '',
            shippingApartment: '',
            shippingComment: '',
            paymentMethod: '',
            comment: '',
            coupon: '',
            giftCard: '',
            newsletter: false,
            acceptTerms: true,
            deliveryType: 'warehouse',
            warehouseId: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            setErrorMessage('');
            setIsSubmitting(true);

            console.log('Form values', values);
            try {
                // Перевірка обов'язкових полів адреси
                if (values.deliveryType === 'courier' && (!values.shippingStreet || !values.shippingHouse)) {
                    throw new Error('Вкажіть адресу доставки (вулицю та будинок)');
                }

                // Формування даних замовлення
                const isCourier = values.deliveryType === 'courier';
                const isPostomat = values.deliveryType === 'postomat';
                const isWarehouse = values.deliveryType === 'warehouse';

                // Формування адреси залежно від способу доставки
                const shippingAddress = isCourier
                    ? {
                        address_1: `${values.shippingStreet}, буд. ${values.shippingHouse}${values.shippingApartment ? ', кв. ' + values.shippingApartment : ''}`,
                        address_2: values.shippingEntrance ? `підʼїзд ${values.shippingEntrance}` : '',
                        city: values.shippingCity,
                        country: 'UA',
                    }
                    : {
                        address_1: `${isPostomat ? 'Поштомат' : isWarehouse ? 'Відділення' : ''} - ${values.warehouseId}`,
                        address_2: '',
                        city: values.shippingCity,
                        country: 'UA',
                    };


                // Повний об'єкт замовлення
                const orderData: OrderData = {
                    payment_method: values.paymentMethod,
                    payment_method_title: paymentMethods.find(p => p.id === values.paymentMethod)?.title || values.paymentMethod,
                    set_paid: false,
                    status: values.paymentMethod === "cod" ? "on-hold" : "pending_custom",
                    billing: {
                        first_name: values.firstName,
                        last_name: values.lastName,
                        phone: values.phone,
                        email: values.email,
                        ...shippingAddress,
                    },
                    shipping: {
                        first_name: values.firstName,
                        last_name: values.lastName,
                        ...shippingAddress,
                    },
                    shipping_lines: [
                        {
                            method_id: values.shippingMethod,
                            method_title: shippingMethods.find(m => m.id.toString() === values.shippingMethod)?.title || '',
                        },
                    ],
                    line_items: items.map((item) => ({
                        product_id: item.id,
                        variation_id: item.variationId || undefined,
                        quantity: item.quantity,
                    })),
                    customer_note: values.comment,
                    coupon_lines: values.coupon ? [{ code: values.coupon }] : [],
                    meta_data: [
                        ...(values.giftCard ? [{ key: 'gift_card_code', value: values.giftCard }] : []),
                        { key: 'delivery_type', value: values.deliveryType }, // додатково фіксуємо тип доставки
                    ],
                };

                // Відправка замовлення до WooCommerce
                const response = await fetch(`${apiUrlWp}wp-json/wc/v3/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Basic ' + btoa(`${consumerKey}:${consumerSecret}`),
                    },
                    body: JSON.stringify(orderData),
                });

                // Обробка відповіді
                const responseData = await response.json();

                if (!response.ok) {
                    if (responseData.message) {
                        throw new Error(responseData.message);
                    } else {
                        throw new Error(`Помилка сервера: ${response.status}`);
                    }
                }

                // Після успішного створення замовлення
                if (values.paymentMethod === 'mono_gateway') {
                    try {
                        const payResponse = await fetch(`${apiUrlWp}wp-json/plata/v1/pay`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: 'Basic ' + btoa(`${consumerKey}:${consumerSecret}`),
                            },
                            body: JSON.stringify({ order_id: responseData.id }),
                        });

                        const payData = await payResponse.json();

                        if (!payResponse.ok) {
                            throw new Error(payData.message || 'Помилка при запиті до Monopay');
                        }

                        if (payData.payUrl) {
                            window.location.href = payData.payUrl; // редирект користувача на оплату
                        } else {
                            throw new Error('Не вдалося отримати посилання на оплату');
                        }
                    } catch (error) {
                        console.error('❌ Monopay помилка:', error);
                        setErrorMessage('Не вдалося ініціалізувати оплату через Monopay. Спробуйте пізніше.');
                        setIsSubmitting(false);
                        return;
                    }
                }


                console.log('✅ Замовлення створено успішно:', responseData);
                setIsSubmitting(false);
                dispatch(clearCart());
                navigate('/checkout-success', {
                    state: { order: responseData },
                });
            } catch (error) {
                if (error instanceof Error) {
                    console.error('❌ Виникла помилка при оформленні замовлення:', error.message);
                    setErrorMessage(error.message);
                } else {
                    console.error('❌ Виникла невідома помилка:', error);
                    setErrorMessage('Невідома помилка при оформленні замовлення');
                }
                setIsSubmitting(false);
            }
        },
    });



    const checkCoupon = async (): Promise<void> => {
        setIsCheckingCoupon(true);
        setCouponError('');
        setCouponValid(null);
        setCouponAmount(null);

        console.log('🔍 Перевірка купону:', formik.values.coupon);

        try {
            const response = await fetch(`${apiUrlWp}wp-json/wc/v3/coupons?code=${formik.values.coupon}`, {
                headers: {
                    Authorization: 'Basic ' + btoa(`${consumerKey}:${consumerSecret}`),
                },
            });

            const data = await response.json();
            console.log('📦 Отримані дані купону:', data);

            if (!response.ok || !Array.isArray(data) || data.length === 0) {
                throw new Error('Купон не знайдено або недійсний');
            }

            const coupon = data[0] as CouponData;

            // 🧾 Перевірка: це не gift_card?
            const isGiftCard = coupon.meta_data?.some(
                (meta: { key: string; value: string }) =>
                    meta.key === 'coupon_mode' && meta.value === 'gift_card'
            );

            if (isGiftCard) {
                throw new Error('Це подарунковий сертифікат. Введіть його у відповідне поле нижче.');
            }

            // 📅 Перевірка дати завершення
            if (coupon.date_expires) {
                const now = new Date();
                const expiryDate = new Date(coupon.date_expires);
                if (now > expiryDate) {
                    throw new Error('Термін дії купону минув');
                }
            }

            const discountType = coupon.discount_type;
            const amount = parseFloat(coupon.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Невірна знижка в купоні');
            }

            // 💸 Обчислюємо знижку
            const cartTotal = items.reduce((sum, item) => (item.sale_price ?? item.price) * item.quantity + sum, 0);
            const calculatedDiscount = discountType === 'percent'
                ? cartTotal * (amount / 100)
                : amount;

            console.log('✅ Купон дійсний:', {
                code: coupon.code,
                type: discountType,
                amount,
                cartTotal,
                calculatedDiscount,
            });

            setCouponAmount(calculatedDiscount);
            setCouponValid(true);
        } catch (error) {
            console.error('❌ Помилка при перевірці купону:', error instanceof Error ? error.message : 'Невідома помилка');
            setCouponValid(false);
            setCouponAmount(null);
            setCouponError(error instanceof Error ? error.message : 'Невідома помилка');
        } finally {
            setIsCheckingCoupon(false);
        }
    };



    const checkGiftCard = async (): Promise<void> => {
        setIsCheckingGift(true);
        setGiftError('');
        setGiftValid(null);
        setGiftAmount(null);

        console.log('🎁 Перевірка подарункового сертифікату:', formik.values.giftCard);

        try {
            const response = await fetch(`${apiUrlWp}wp-json/wc/v3/coupons?code=${formik.values.giftCard}`, {
                headers: {
                    Authorization: 'Basic ' + btoa(`${consumerKey}:${consumerSecret}`),
                },
            });

            const data = await response.json();
            console.log('📦 Отримані дані сертифікату:', data);

            if (!response.ok || !Array.isArray(data) || data.length === 0) {
                throw new Error('Сертифікат не знайдено або недійсний');
            }

            const coupon = data[0] as CouponData;

            const isGiftCard = coupon.meta_data?.some(
                (meta: { key: string; value: string }) =>
                    meta.key === 'coupon_mode' && meta.value === 'gift_card'
            );

            if (!isGiftCard) {
                throw new Error('Це не подарунковий сертифікат');
            }

            if (coupon.date_expires) {
                const now = new Date();
                const expiryDate = new Date(coupon.date_expires);
                if (now > expiryDate) {
                    throw new Error('Сертифікат протерміновано');
                }
            }

            const amount = parseFloat(coupon.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Невірна сума сертифіката');
            }

            console.log('Сертифікат дійсний:', { code: coupon.code, amount });

            setGiftAmount(amount);
            setGiftValid(true);
        } catch (error) {
            console.error('❌ Помилка при перевірці сертифіката:', error instanceof Error ? error.message : 'Невідома помилка');
            setGiftValid(false);
            setGiftAmount(null);
            setGiftError(error instanceof Error ? error.message : 'Невідома помилка');
        } finally {
            setIsCheckingGift(false);
        }
    };

    return (
        <>
            {isMobile && (
                    <StepNavigation currentStep={step} onStepClick={handleStepClick} />
            )}
            <div className={s.container}>
                {errorMessage && <div className={s.errorAlert}>{errorMessage}</div>}
                <div className={s.checkoutPage}>

                    <form onSubmit={formik.handleSubmit} className={s.checkoutForm}>
                        {isMobile && (
                            <>
                                {step === 1 && (
                                    <div className={s.personalInfo}>
                                        <h2>Персональна інформація</h2>
                                        <div className={s.inputsWrap}>
                                            <div className={s.inputRow}>
                                                <div className={s.inputField}>
                                                    <input placeholder="Прізвище" {...formik.getFieldProps('lastName')} />
                                                    {formik.touched.lastName && formik.errors.lastName && (
                                                        <div className={s.errorText}>{formik.errors.lastName}</div>
                                                    )}
                                                </div>
                                                <div className={s.inputField}>
                                                    <input placeholder="Ім'я" {...formik.getFieldProps('firstName')} />
                                                    {formik.touched.firstName && formik.errors.firstName && (
                                                        <div className={s.errorText}>{formik.errors.firstName}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={s.inputRow}>
                                                <div className={s.inputField}>
                                                    <input placeholder="Телефон" {...formik.getFieldProps('phone')} />
                                                    {formik.touched.phone && formik.errors.phone && (
                                                        <div className={s.errorText}>{formik.errors.phone}</div>
                                                    )}
                                                </div>
                                                <div className={s.inputField}>
                                                    <input placeholder="E-mail" {...formik.getFieldProps('email')} />
                                                    {formik.touched.email && formik.errors.email && (
                                                        <div className={s.errorText}>{formik.errors.email}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className={s.shippingInfo}>
                                        <h2>Доставка</h2>

                                        {isLoadingCheckoutData ? (
                                            <div className={s.checkoutLoader}>
                                                <LoaderMini />
                                            </div>
                                        ) : (

                                            <>

                                                <div className={s.inputRow}>
                                                    <div className={s.inputField}>
                                                        <Select
                                                            placeholder="Оберіть спосіб"
                                                            options={shippingMethods.map(method => ({
                                                                value: method.id.toString(),
                                                                label: method.title,
                                                            }))}
                                                            value={
                                                                shippingMethods.find(method => method.id.toString() === formik.values.shippingMethod)
                                                                    ? {
                                                                        value: formik.values.shippingMethod,
                                                                        label: shippingMethods.find(method => method.id.toString() === formik.values.shippingMethod)?.title || '',
                                                                    }
                                                                    : null
                                                            }
                                                            onChange={(option) => formik.setFieldValue('shippingMethod', option?.value || '')}
                                                            isSearchable
                                                            classNamePrefix="custom-select"
                                                        />
                                                        {formik.touched.shippingMethod && formik.errors.shippingMethod && (
                                                            <div className={s.errorText}>{formik.errors.shippingMethod}</div>
                                                        )}
                                                    </div>
                                                    <div className={s.inputField}>
                                                        <Select
                                                            placeholder="Оберіть спосіб доставки"
                                                            options={deliveryTypeOptions}
                                                            value={deliveryTypeOptions.find(opt => opt.value === formik.values.deliveryType) || null}
                                                            onChange={(option) => {
                                                                const value = option?.value || '';
                                                                formik.setFieldValue('deliveryType', value);
                                                                setSelectedCity('');
                                                                formik.setFieldValue('shippingCity', '');
                                                                formik.setFieldValue('shippingStreet', '');
                                                                formik.setFieldValue('warehouseId', '');
                                                            }}
                                                            isSearchable
                                                            classNamePrefix="custom-select"
                                                        />
                                                    </div>
                                                </div>


                                                {formik.values.deliveryType === 'courier' && (
                                                    <>

                                                        <div className={s.inputRow}>
                                                            <div className={s.inputField}>
                                                                <Select
                                                                    placeholder="Оберіть місто"
                                                                    options={allCityOptions}
                                                                    filterOption={filterCityOptions}
                                                                    value={allCityOptions.find(opt => opt.value === formik.values.shippingCity) || null}
                                                                    onChange={(option) => {
                                                                        const value = option?.value || '';
                                                                        formik.setFieldValue('shippingCity', value);
                                                                        setSelectedCity(value);
                                                                        formik.setFieldValue('shippingStreet', '');
                                                                        formik.setFieldValue('warehouseId', '');
                                                                    }}
                                                                    isSearchable
                                                                    classNamePrefix="custom-select"
                                                                />
                                                                {formik.touched.shippingCity && formik.errors.shippingCity && (
                                                                    <div className={s.errorText}>{formik.errors.shippingCity}</div>
                                                                )}
                                                            </div>

                                                            {selectedCity && (
                                                                <div className={s.inputField}>
                                                                    <Select
                                                                        placeholder="Оберіть вулицю"
                                                                        options={getStreetOptions()}
                                                                        value={
                                                                            formik.values.shippingStreet
                                                                                ? { value: formik.values.shippingStreet, label: formik.values.shippingStreet }
                                                                                : null
                                                                        }
                                                                        onChange={(option) => formik.setFieldValue('shippingStreet', option?.value || '')}
                                                                        isSearchable
                                                                        classNamePrefix="custom-select"
                                                                    />
                                                                    {formik.touched.shippingStreet && formik.errors.shippingStreet && (
                                                                        <div className={s.errorText}>{formik.errors.shippingStreet}</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className={s.inputRow}>
                                                            <div className={s.inputField}>
                                                                <input placeholder="Будинок" {...formik.getFieldProps('shippingHouse')} />
                                                                {formik.touched.shippingHouse && formik.errors.shippingHouse && (
                                                                    <div className={s.errorText}>{formik.errors.shippingHouse}</div>
                                                                )}
                                                            </div>
                                                            <div className={s.inputField}>
                                                                <input placeholder="Підʼїзд" {...formik.getFieldProps('shippingEntrance')} />
                                                            </div>
                                                            <div className={s.inputField}>
                                                                <input placeholder="Квартира" {...formik.getFieldProps('shippingApartment')} />
                                                            </div>
                                                        </div>
                                                        <textarea placeholder="Залишити коментар курʼєру" {...formik.getFieldProps('shippingComment')} />
                                                    </>
                                                )}

                                                {formik.values.deliveryType === 'warehouse' && (
                                                    <>
                                                        <div className={s.inputRow}>
                                                            <div className={s.inputField}>
                                                                <Select
                                                                    placeholder="Оберіть місто"
                                                                    options={allCityOptions}
                                                                    filterOption={filterCityOptions}
                                                                    value={allCityOptions.find(opt => opt.value === formik.values.shippingCity) || null}
                                                                    onChange={(option) => {
                                                                        const value = option?.value || '';
                                                                        formik.setFieldValue('shippingCity', value);
                                                                        setSelectedCity(value);
                                                                        formik.setFieldValue('shippingStreet', '');
                                                                        formik.setFieldValue('warehouseId', '');
                                                                    }}
                                                                    isSearchable
                                                                    classNamePrefix="custom-select"
                                                                />
                                                                {formik.touched.shippingCity && formik.errors.shippingCity && (
                                                                    <div className={s.errorText}>{formik.errors.shippingCity}</div>
                                                                )}
                                                            </div>

                                                            {selectedCity && (

                                                                <>

                                                                    <div className={s.inputField}>
                                                                        <Select
                                                                            placeholder="Оберіть відділення"
                                                                            options={getFilteredWarehouses(formik.values.deliveryType)}
                                                                            value={
                                                                                formik.values.warehouseId
                                                                                    ? { value: formik.values.warehouseId, label: formik.values.warehouseId }
                                                                                    : null
                                                                            }
                                                                            onChange={(option) => formik.setFieldValue('warehouseId', option?.value || '')}
                                                                            isSearchable
                                                                            classNamePrefix="custom-select"
                                                                        />
                                                                        {formik.touched.warehouseId && formik.errors.warehouseId && (
                                                                            <div className={s.errorText}>{formik.errors.warehouseId}</div>
                                                                        )}
                                                                    </div>

                                                                    <button
                                                                        className={s.mapBtn}
                                                                        onClick={() => setShowMapPopup(true)}
                                                                    >
                                                                        Обрати на мапі
                                                                    </button>

                                                                    {showMapPopup && (
                                                                        <NovaPoshtaMapPopup
                                                                            cities={npLocations}
                                                                            selectedCity={selectedCity}
                                                                            deliveryType={formik.values.deliveryType}
                                                                            onClose={() => setShowMapPopup(false)}
                                                                            onSelect={(warehouse) => {
                                                                                formik.setFieldValue('warehouseId', warehouse);
                                                                                setShowMapPopup(false);
                                                                            }}
                                                                            onTabChange={(newType) => formik.setFieldValue('deliveryType', newType)} // 👈 Передаємо зміну типу
                                                                        />
                                                                    )}
                                                                </>



                                                            )}



                                                        </div>
                                                    </>

                                                )}

                                                {formik.values.deliveryType === 'postomat' && (
                                                    <>
                                                        <div className={s.inputRow}>
                                                            <div className={s.inputField}>
                                                                <Select
                                                                    placeholder="Оберіть місто"
                                                                    options={allCityOptions}
                                                                    filterOption={filterCityOptions}
                                                                    value={allCityOptions.find(opt => opt.value === formik.values.shippingCity) || null}
                                                                    onChange={(option) => {
                                                                        const value = option?.value || '';
                                                                        formik.setFieldValue('shippingCity', value);
                                                                        setSelectedCity(value);
                                                                        formik.setFieldValue('shippingStreet', '');
                                                                        formik.setFieldValue('warehouseId', '');
                                                                    }}
                                                                    isSearchable
                                                                    classNamePrefix="custom-select"
                                                                />
                                                                {formik.touched.shippingCity && formik.errors.shippingCity && (
                                                                    <div className={s.errorText}>{formik.errors.shippingCity}</div>
                                                                )}
                                                            </div>

                                                            {selectedCity && (

                                                                <>
                                                                    <div className={s.inputField}>
                                                                        <Select
                                                                            placeholder="Оберіть поштомат"
                                                                            options={getFilteredWarehouses(formik.values.deliveryType)}
                                                                            value={
                                                                                formik.values.warehouseId
                                                                                    ? { value: formik.values.warehouseId, label: formik.values.warehouseId }
                                                                                    : null
                                                                            }
                                                                            onChange={(option) => formik.setFieldValue('warehouseId', option?.value || '')}
                                                                            isSearchable
                                                                            classNamePrefix="custom-select"
                                                                        />

                                                                        {formik.touched.warehouseId && formik.errors.warehouseId && (
                                                                            <div className={s.errorText}>{formik.errors.warehouseId}</div>
                                                                        )}
                                                                    </div>

                                                                    <button
                                                                        className={s.mapBtn}
                                                                        onClick={() => setShowMapPopup(true)}
                                                                    >
                                                                        Обрати на мапі
                                                                    </button>

                                                                    {showMapPopup && (
                                                                        <NovaPoshtaMapPopup
                                                                            cities={npLocations}
                                                                            selectedCity={selectedCity}
                                                                            deliveryType={formik.values.deliveryType}
                                                                            onClose={() => setShowMapPopup(false)}
                                                                            onSelect={(warehouse) => {
                                                                                formik.setFieldValue('warehouseId', warehouse);
                                                                                setShowMapPopup(false);
                                                                            }}
                                                                            onTabChange={(newType) => formik.setFieldValue('deliveryType', newType)} // 👈 Передаємо зміну типу
                                                                        />
                                                                    )}

                                                                </>


                                                            )}


                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className={s.paymentInfo}>
                                        <h2>Оплата</h2>

                                        {isLoadingCheckoutData ? (
                                            <div className={s.checkoutLoader}>
                                                <LoaderMini />
                                            </div>
                                        ) : (
                                            <>

                                                <div className={s.paymentRow}>
                                                    {paymentMethods.map((method) => (
                                                        <label key={method.id}>
                                                            <input
                                                                type="radio"
                                                                name="paymentMethod"
                                                                value={method.id}
                                                                checked={formik.values.paymentMethod === method.id}
                                                                onChange={formik.handleChange}
                                                            />
                                                            <div
                                                                className={s.titlePayment}
                                                                dangerouslySetInnerHTML={{ __html: method.title }}
                                                            />
                                                        </label>
                                                    ))}
                                                </div>


                                                {formik.touched.paymentMethod && formik.errors.paymentMethod && (
                                                    <div className={s.errorText}>{formik.errors.paymentMethod}</div>
                                                )}
                                            </>
                                        )}


                                        <div className={s.desctiptionOrder}>
                                            <h2>Коментар</h2>
                                            <textarea placeholder="Залишити коментар до замовлення" {...formik.getFieldProps('comment')} />

                                            <button type="submit" className={s.submitButton} disabled={isSubmitting}>
                                                {isSubmitting ? 'Надсилаємо...' : 'ПІДТВЕРДИТИ ЗАМОВЛЕННЯ'}
                                            </button>
                                        </div>

                                        <div className={s.checkboxRow}>
                                            <label>
                                                <input type="checkbox" {...formik.getFieldProps('newsletter')} />
                                                Підписатися на e-mail розсилку
                                            </label>
                                            <label>
                                                <input type="checkbox" {...formik.getFieldProps('acceptTerms')} />
                                                Приймаю умови оферти, політики конфіденційності та заяви про обробку персональних даних
                                            </label>
                                            {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                                                <div className={s.errorText}>{formik.errors.acceptTerms}</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className={s.stepButtons}>
                                    {step > 1 && (
                                        <button type="button" className={s.buttonPrev} onClick={() => setStep((prev) => prev - 1)}>
                                            Назад
                                        </button>
                                    )}
                                    {step < 3 && (
                                        <button type="button" className={s.buttonNext} onClick={() => setStep((prev) => prev + 1)}>
                                            Далі
                                        </button>
                                    )}
                                </div>
                            </>
                        )}

                        {!isMobile && (
                            <div className={s.gapFrom}>
                                <div className={s.personalInfo}>
                                    <h2>Персональна інформація</h2>
                                    <div className={s.inputsWrap}>
                                        <div className={s.inputRow}>
                                            <div className={s.inputField}>
                                                <input placeholder="Прізвище" {...formik.getFieldProps('lastName')} />
                                                {formik.touched.lastName && formik.errors.lastName && (
                                                    <div className={s.errorText}>{formik.errors.lastName}</div>
                                                )}
                                            </div>
                                            <div className={s.inputField}>
                                                <input placeholder="Ім'я" {...formik.getFieldProps('firstName')} />
                                                {formik.touched.firstName && formik.errors.firstName && (
                                                    <div className={s.errorText}>{formik.errors.firstName}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={s.inputRow}>
                                            <div className={s.inputField}>
                                                <input placeholder="Телефон" {...formik.getFieldProps('phone')} />
                                                {formik.touched.phone && formik.errors.phone && (
                                                    <div className={s.errorText}>{formik.errors.phone}</div>
                                                )}
                                            </div>
                                            <div className={s.inputField}>
                                                <input placeholder="E-mail" {...formik.getFieldProps('email')} />
                                                {formik.touched.email && formik.errors.email && (
                                                    <div className={s.errorText}>{formik.errors.email}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={s.shippingInfo}>
                                    <h2>Доставка</h2>

                                    {isLoadingCheckoutData ? (
                                        <div className={s.checkoutLoader}>
                                            <LoaderMini />
                                        </div>
                                    ) : (

                                        <>

                                            <div className={s.inputRow}>
                                                <div className={s.inputField}>
                                                    <Select
                                                        placeholder="Оберіть спосіб"
                                                        options={shippingMethods.map(method => ({
                                                            value: method.id.toString(),
                                                            label: method.title,
                                                        }))}
                                                        value={
                                                            shippingMethods.find(method => method.id.toString() === formik.values.shippingMethod)
                                                                ? {
                                                                    value: formik.values.shippingMethod,
                                                                    label: shippingMethods.find(method => method.id.toString() === formik.values.shippingMethod)?.title || '',
                                                                }
                                                                : null
                                                        }
                                                        onChange={(option) => formik.setFieldValue('shippingMethod', option?.value || '')}
                                                        isSearchable
                                                        classNamePrefix="custom-select"
                                                    />
                                                    {formik.touched.shippingMethod && formik.errors.shippingMethod && (
                                                        <div className={s.errorText}>{formik.errors.shippingMethod}</div>
                                                    )}
                                                </div>
                                                <div className={s.inputField}>
                                                    <Select
                                                        placeholder="Оберіть спосіб доставки"
                                                        options={deliveryTypeOptions}
                                                        value={deliveryTypeOptions.find(opt => opt.value === formik.values.deliveryType) || null}
                                                        onChange={(option) => {
                                                            const value = option?.value || '';
                                                            formik.setFieldValue('deliveryType', value);
                                                            setSelectedCity('');
                                                            formik.setFieldValue('shippingCity', '');
                                                            formik.setFieldValue('shippingStreet', '');
                                                            formik.setFieldValue('warehouseId', '');
                                                        }}
                                                        isSearchable
                                                        classNamePrefix="custom-select"
                                                    />
                                                </div>
                                            </div>


                                            {formik.values.deliveryType === 'courier' && (
                                                <>

                                                    <div className={s.inputRow}>
                                                        <div className={s.inputField}>
                                                            <Select
                                                                placeholder="Оберіть місто"
                                                                options={allCityOptions}
                                                                filterOption={filterCityOptions}
                                                                value={allCityOptions.find(opt => opt.value === formik.values.shippingCity) || null}
                                                                onChange={(option) => {
                                                                    const value = option?.value || '';
                                                                    formik.setFieldValue('shippingCity', value);
                                                                    setSelectedCity(value);
                                                                    formik.setFieldValue('shippingStreet', '');
                                                                    formik.setFieldValue('warehouseId', '');
                                                                }}
                                                                isSearchable
                                                                classNamePrefix="custom-select"
                                                            />
                                                            {formik.touched.shippingCity && formik.errors.shippingCity && (
                                                                <div className={s.errorText}>{formik.errors.shippingCity}</div>
                                                            )}
                                                        </div>

                                                        {selectedCity && (
                                                            <div className={s.inputField}>
                                                                <Select
                                                                    placeholder="Оберіть вулицю"
                                                                    options={getStreetOptions()}
                                                                    value={
                                                                        formik.values.shippingStreet
                                                                            ? { value: formik.values.shippingStreet, label: formik.values.shippingStreet }
                                                                            : null
                                                                    }
                                                                    onChange={(option) => formik.setFieldValue('shippingStreet', option?.value || '')}
                                                                    isSearchable
                                                                    classNamePrefix="custom-select"
                                                                />
                                                                {formik.touched.shippingStreet && formik.errors.shippingStreet && (
                                                                    <div className={s.errorText}>{formik.errors.shippingStreet}</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className={s.inputRow}>
                                                        <div className={s.inputField}>
                                                            <input placeholder="Будинок" {...formik.getFieldProps('shippingHouse')} />
                                                            {formik.touched.shippingHouse && formik.errors.shippingHouse && (
                                                                <div className={s.errorText}>{formik.errors.shippingHouse}</div>
                                                            )}
                                                        </div>
                                                        <div className={s.inputField}>
                                                            <input placeholder="Підʼїзд" {...formik.getFieldProps('shippingEntrance')} />
                                                        </div>
                                                        <div className={s.inputField}>
                                                            <input placeholder="Квартира" {...formik.getFieldProps('shippingApartment')} />
                                                        </div>
                                                    </div>
                                                    <textarea placeholder="Залишити коментар курʼєру" {...formik.getFieldProps('shippingComment')} />
                                                </>
                                            )}

                                            {formik.values.deliveryType === 'warehouse' && (
                                                <>
                                                    <div className={s.inputRow}>
                                                        <div className={s.inputField}>
                                                            <Select
                                                                placeholder="Оберіть місто"
                                                                options={allCityOptions}
                                                                filterOption={filterCityOptions}
                                                                value={allCityOptions.find(opt => opt.value === formik.values.shippingCity) || null}
                                                                onChange={(option) => {
                                                                    const value = option?.value || '';
                                                                    formik.setFieldValue('shippingCity', value);
                                                                    setSelectedCity(value);
                                                                    formik.setFieldValue('shippingStreet', '');
                                                                    formik.setFieldValue('warehouseId', '');
                                                                }}
                                                                isSearchable
                                                                classNamePrefix="custom-select"
                                                            />
                                                            {formik.touched.shippingCity && formik.errors.shippingCity && (
                                                                <div className={s.errorText}>{formik.errors.shippingCity}</div>
                                                            )}
                                                        </div>

                                                        {selectedCity && (

                                                            <>

                                                                <div className={s.inputField}>
                                                                    <Select
                                                                        placeholder="Оберіть відділення"
                                                                        options={getFilteredWarehouses(formik.values.deliveryType)}
                                                                        value={
                                                                            formik.values.warehouseId
                                                                                ? { value: formik.values.warehouseId, label: formik.values.warehouseId }
                                                                                : null
                                                                        }
                                                                        onChange={(option) => formik.setFieldValue('warehouseId', option?.value || '')}
                                                                        isSearchable
                                                                        classNamePrefix="custom-select"
                                                                    />
                                                                    {formik.touched.warehouseId && formik.errors.warehouseId && (
                                                                        <div className={s.errorText}>{formik.errors.warehouseId}</div>
                                                                    )}
                                                                </div>

                                                                <button
                                                                    className={s.mapBtn}
                                                                    onClick={() => setShowMapPopup(true)}
                                                                >
                                                                    Обрати на мапі
                                                                </button>

                                                                {showMapPopup && (
                                                                    <NovaPoshtaMapPopup
                                                                        cities={npLocations}
                                                                        selectedCity={selectedCity}
                                                                        deliveryType={formik.values.deliveryType}
                                                                        onClose={() => setShowMapPopup(false)}
                                                                        onSelect={(warehouse) => {
                                                                            formik.setFieldValue('warehouseId', warehouse);
                                                                            setShowMapPopup(false);
                                                                        }}
                                                                        onTabChange={(newType) => formik.setFieldValue('deliveryType', newType)} // 👈 Передаємо зміну типу
                                                                    />
                                                                )}
                                                            </>



                                                        )}



                                                    </div>
                                                </>

                                            )}

                                            {formik.values.deliveryType === 'postomat' && (
                                                <>
                                                    <div className={s.inputRow}>
                                                        <div className={s.inputField}>
                                                            <Select
                                                                placeholder="Оберіть місто"
                                                                options={allCityOptions}
                                                                filterOption={filterCityOptions}
                                                                value={allCityOptions.find(opt => opt.value === formik.values.shippingCity) || null}
                                                                onChange={(option) => {
                                                                    const value = option?.value || '';
                                                                    formik.setFieldValue('shippingCity', value);
                                                                    setSelectedCity(value);
                                                                    formik.setFieldValue('shippingStreet', '');
                                                                    formik.setFieldValue('warehouseId', '');
                                                                }}
                                                                isSearchable
                                                                classNamePrefix="custom-select"
                                                            />
                                                            {formik.touched.shippingCity && formik.errors.shippingCity && (
                                                                <div className={s.errorText}>{formik.errors.shippingCity}</div>
                                                            )}
                                                        </div>

                                                        {selectedCity && (

                                                            <>
                                                                <div className={s.inputField}>
                                                                    <Select
                                                                        placeholder="Оберіть поштомат"
                                                                        options={getFilteredWarehouses(formik.values.deliveryType)}
                                                                        value={
                                                                            formik.values.warehouseId
                                                                                ? { value: formik.values.warehouseId, label: formik.values.warehouseId }
                                                                                : null
                                                                        }
                                                                        onChange={(option) => formik.setFieldValue('warehouseId', option?.value || '')}
                                                                        isSearchable
                                                                        classNamePrefix="custom-select"
                                                                    />

                                                                    {formik.touched.warehouseId && formik.errors.warehouseId && (
                                                                        <div className={s.errorText}>{formik.errors.warehouseId}</div>
                                                                    )}
                                                                </div>

                                                                <button
                                                                    className={s.mapBtn}
                                                                    onClick={() => setShowMapPopup(true)}
                                                                >
                                                                    Обрати на мапі
                                                                </button>

                                                                {showMapPopup && (
                                                                    <NovaPoshtaMapPopup
                                                                        cities={npLocations}
                                                                        selectedCity={selectedCity}
                                                                        deliveryType={formik.values.deliveryType}
                                                                        onClose={() => setShowMapPopup(false)}
                                                                        onSelect={(warehouse) => {
                                                                            formik.setFieldValue('warehouseId', warehouse);
                                                                            setShowMapPopup(false);
                                                                        }}
                                                                        onTabChange={(newType) => formik.setFieldValue('deliveryType', newType)} // 👈 Передаємо зміну типу
                                                                    />
                                                                )}

                                                            </>


                                                        )}


                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className={s.paymentInfo}>
                                    <h2>Оплата</h2>

                                    {isLoadingCheckoutData ? (
                                        <div className={s.checkoutLoader}>
                                            <LoaderMini />
                                        </div>
                                    ) : (
                                        <>

                                            <div className={s.paymentRow}>
                                                {paymentMethods.map((method) => (
                                                    <label key={method.id}>
                                                        <input
                                                            type="radio"
                                                            name="paymentMethod"
                                                            value={method.id}
                                                            checked={formik.values.paymentMethod === method.id}
                                                            onChange={formik.handleChange}
                                                        />
                                                        <div
                                                            className={s.titlePayment}
                                                            dangerouslySetInnerHTML={{ __html: method.title }}
                                                        />
                                                    </label>
                                                ))}
                                            </div>


                                            {formik.touched.paymentMethod && formik.errors.paymentMethod && (
                                                <div className={s.errorText}>{formik.errors.paymentMethod}</div>
                                            )}
                                        </>
                                    )}


                                    <div className={s.desctiptionOrder}>
                                        <h2>Коментар</h2>
                                        <textarea placeholder="Залишити коментар до замовлення" {...formik.getFieldProps('comment')} />

                                        <button type="submit" className={s.submitButton} disabled={isSubmitting}>
                                            {isSubmitting ? 'Надсилаємо...' : 'ПІДТВЕРДИТИ ЗАМОВЛЕННЯ'}
                                        </button>
                                    </div>

                                    <div className={s.checkboxRow}>
                                        <label>
                                            <input type="checkbox" {...formik.getFieldProps('newsletter')} />
                                            Підписатися на e-mail розсилку
                                        </label>
                                        <label>
                                            <input type="checkbox" {...formik.getFieldProps('acceptTerms')} />
                                            Приймаю умови оферти, політики конфіденційності та заяви про обробку персональних даних
                                        </label>
                                        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                                            <div className={s.errorText}>{formik.errors.acceptTerms}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className={s.checkoutSummary}>
                        <div className={s.headingSummaryWrap}>
                            <h3 className={s.headingSummary}>ВСЬОГО ДО ОПЛАТИ</h3>
                            <p className={s.priceMain}>{items.reduce((sum, item) => sum + (item.sale_price || item.price) * item.quantity, 0).toLocaleString()} ₴</p>
                        </div>
                        <div className={s.cartItems}>
                            {items.map((item) => (
                                <div key={`${item.id}-${item.variationId || 'base'}`} className={s.cartItem}>
                                    <div className={s.cartItemLeft}><img src={item.image} alt={item.name} /></div>
                                    <div className={s.cartItemCenter}>
                                        <div className={s.skuPriceWrap}>
                                            <p className={s.skuText}><span className={s.skuItem}>Код товару:</span> {item.sku}</p>
                                            <button className={s.delateItem} type="button" onClick={() => dispatch(removeFromCart(item))}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M1.51863 15.6603L8.00044 9.17851L14.4823 15.6603L15.6608 14.4818L9.17895 8L15.6608 1.51819L14.4823 0.339676L8.00044 6.82149L1.51863 0.339677L0.340119 1.51819L6.82193 8L0.340119 14.4818L1.51863 15.6603Z" fill="#003C3A"/>
                                                </svg>
                                            </button>
                                        </div>
                                        <p className={s.titleProductItem}>{item.name}</p>
                                        <div className={s.priceQuanityWrap}>
                                            <div className={s.quantityControls}>
                                                <button
                                                    onClick={() => dispatch(updateQuantity({
                                                        id: item.id,
                                                        variationId: item.variationId,
                                                        quantity: item.quantity - 1,
                                                    }))}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M13.05 0.5V0.45H13L7.5 0.45H6.5L1 0.45H0.95V0.5V1.5V1.55H1L6.5 1.55L7.5 1.55L13 1.55H13.05V1.5V0.5Z" fill="#003C3A" stroke="#003C3A" stroke-width="0.1"/>
                                                    </svg>
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => dispatch(updateQuantity({
                                                        id: item.id,
                                                        variationId: item.variationId,
                                                        quantity: item.quantity + 1,
                                                    }))}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M13.05 6.5V6.45H13L7.55 6.45V1V0.95H7.5H6.5H6.45V1V6.45H1H0.95V6.5V7.5V7.55H1H6.45L6.45 13V13.05H6.5H7.5H7.55V13L7.55 7.55L13 7.55H13.05V7.5V6.5Z" fill="#003C3A" stroke="#003C3A" stroke-width="0.1"/>
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className={s.priceBlock}>
                                                {item.sale_price && item.sale_price < item.regular_price ? (
                                                    <>
                                                        <p className={s.salePrice}>
                                                            {(item.price * item.quantity).toLocaleString()} ₴
                                                        </p>
                                                        <p className={s.oldPrice}>
                                                            {(item.regular_price * item.quantity).toLocaleString()} ₴
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className={s.priceItem}>
                                                        {(item.price * item.quantity).toLocaleString()} ₴
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>



                        <div className={`${s.wrapCoupon} ${isCouponOpen ? s.active : ''}`}>
                            <button className={s.accordionToggle} onClick={() => setCouponOpen(!isCouponOpen)}>
                                Додати промокод
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                    <g clipPath="url(#clip0_2368_15893)">
                                        <path d="M22.002 10.0833L11.9186 10.0833V0L10.0853 0V10.0833H0.00195312L0.00195312 11.9167H10.0853L10.0853 22H11.9186L11.9186 11.9167L22.002 11.9167V10.0833Z" fill="#1A1A1A"/>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_2368_15893">
                                            <rect width="22" height="22" fill="white"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                            </button>

                            {isCouponOpen && (
                                <div className={s.couponWrapper}>
                                    <div className={s.inputWrap}>
                                        <input
                                            type="text"
                                            {...formik.getFieldProps('coupon')}
                                            placeholder="Ваш купон"
                                            className={s.couponInput}
                                        />
                                        <button type="button" className={s.checkBtn} onClick={checkCoupon} disabled={isCheckingCoupon}>
                                            {isCheckingCoupon ? 'Перевірка...' : 'Перевірити'}
                                        </button>
                                    </div>
                                    {couponValid && couponAmount && (
                                        <p className={s.couponSuccess}>Знижка: -{couponAmount} ₴</p>
                                    )}
                                    {couponError && (
                                        <p className={s.couponError}>{couponError}</p>
                                    )}
                                </div>
                            )}
                        </div>



                        <div className={`${s.wrapCoupon} ${isGiftOpen ? s.active : ''}`}>
                            <button className={s.accordionToggle} onClick={() => setGiftOpen(!isGiftOpen)}>
                                Подарунковий сертифікат
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                    <g clipPath="url(#clip0_2368_15893)">
                                        <path d="M22.002 10.0833L11.9186 10.0833V0L10.0853 0V10.0833H0.00195312L0.00195312 11.9167H10.0853L10.0853 22H11.9186L11.9186 11.9167L22.002 11.9167V10.0833Z" fill="#1A1A1A"/>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_2368_15893">
                                            <rect width="22" height="22" fill="white"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                            </button>

                            {isGiftOpen && (
                                <div className={s.couponWrap}>
                                    <div className={s.inputWrap}>
                                        <input
                                            type="text"
                                            {...formik.getFieldProps('giftCard')}
                                            placeholder="Ваш сертифікат"
                                            className={s.couponInput}
                                        />

                                        <button
                                            type="button"
                                            className={s.checkBtn}
                                            onClick={checkGiftCard} // 👈 твоя функція перевірки
                                            disabled={isCheckingGift}
                                        >
                                            {isCheckingGift ? 'Перевірка...' : 'Перевірити сертифікат'}
                                        </button>
                                    </div>

                                    {giftValid && (
                                        <div className={s.validText}>
                                            ✅ Сертифікат дійсний. Знижка: {giftAmount?.toLocaleString()} ₴
                                        </div>
                                    )}

                                    {giftValid === false && giftError && (
                                        <div className={s.errorText}>❌ {giftError}</div>
                                    )}
                                </div>
                            )}
                        </div>



                        <div className={s.checkoutSummaryBlock}>
                            <div className={s.summaryLine}>
                                <span>Сума замовлення</span>
                                <span className={s.spanBlack}>{subtotal.toLocaleString()} ₴</span>
                            </div>

                            <div className={s.summaryLine}>
                                <span>Сума знижки промокода</span>
                                <span className={s.spanGray}>{appliedCouponDiscount > 0 ? `-${appliedCouponDiscount.toLocaleString()} ₴` : '0 ₴'}</span>
                            </div>

                            <div className={s.summaryLine}>
                                <span>Подарунковий сертифікат</span>
                                <span className={s.spanGray}>{appliedGiftCard > 0 ? `-${appliedGiftCard.toLocaleString()} ₴` : '0 ₴'}</span>
                            </div>

                            <div className={s.summaryLine}>
                                <span>Сума знижки</span>
                                <span className={s.spanGray}>{discountProducts > 0 ? `${discountProducts.toLocaleString()} ₴` : '0 ₴'}</span>
                            </div>

                            <div className={s.summaryLine}>
                                <span>Вартість доставки</span>
                                <span className={s.spanBlack}>{shippingCost > 0 ? `${shippingCost.toLocaleString()} ₴` : 'За тарифами "Нової Пошти"'}</span>
                            </div>

                            <div className={s.checkoutTotal}>
                                <h3 className={s.headingSummary}>РАЗОМ</h3>
                                <p className={s.priceMain}>{finalTotal.toLocaleString()} ₴</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckoutPage;