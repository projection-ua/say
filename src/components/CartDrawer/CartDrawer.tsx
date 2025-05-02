// ✅ src/components/CartDrawer/CartDrawer.tsx — адаптовано під дизайн
import { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { removeFromCart, updateQuantity, setCartOpen } from '../../store/slices/cartSlice';
import s from './CartDrawer.module.css';
import { CartItem } from '../../types/cartTypes';
import { Link } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import RecommendedProducts from "../RecommendedProducts/RecommendedProducts";



const CartDrawer = () => {

    const location = useLocation();


    useEffect(() => {
        if (isCartOpen) {
            dispatch(setCartOpen(false));
        }
    }, [location.pathname]); // 🔥 при зміні шляху закривати кошик

    const dispatch = useDispatch();
    const { items, isCartOpen } = useSelector((state: RootState) => state.cart);

    const subtotal = items.reduce(
        (sum, item) => sum + (item.regular_price || item.price) * item.quantity,
        0
    );

    const total = items.reduce(
        (sum, item) => sum + (item.sale_price ?? item.price) * item.quantity,
        0
    );



    const discount = subtotal - total;
    const deliveryThreshold = 2000;
    const remainingToFreeShipping = Math.max(0, deliveryThreshold - total);

    return (
        <div className={`${s.drawerOverlay} ${isCartOpen ? s.open : ''}`}>
            <div className={s.drawerContent}>

                <div className={s.body}>
                    <div className={s.header}>
                        <h2 className={s.title}>КОШИК <span className={s.countCart}>( {items.length} )</span></h2>
                        <button onClick={() => dispatch(setCartOpen(false))} className={s.closeBtn}>✕</button>
                    </div>
                    <div className={s.wrapPanelCart}>
                        <div className={s.left}>
                            <div className={s.items}>
                                {items.map((item: CartItem) => (
                                    <div key={item.id + '-' + (item.variationId ?? 'default')} className={s.item}>
                                    <img src={item.image} alt={item.name} className={s.image} />
                                        <div className={s.info}>
                                            <div className={s.topItem}>
                                                <div className={s.wrapHeadingAtribute}>
                                                    <p className={s.name}>{item.name}</p>
                                                    {item.attributes && (
                                                        <div className={s.attrs}>
                                                            {Object.entries(item.attributes).map(([key, value]) => (
                                                                <p key={key} className={s.attr}>{key}: {value}</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <button className={s.remove} onClick={() => dispatch(removeFromCart(item))}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M1.51863 15.6603L8.00044 9.17851L14.4823 15.6603L15.6608 14.4818L9.17895 8L15.6608 1.51819L14.4823 0.339676L8.00044 6.82149L1.51863 0.339677L0.340119 1.51819L6.82193 8L0.340119 14.4818L1.51863 15.6603Z" fill="#003C3A"/>
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className={s.wrapBottom}>
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
                        </div>


                        {items.length > 0 && (

                            <div className={s.rightPanel}>
                                <div className={s.bonusBar}>
                                    До безкоштовної доставки залишилось <b>{remainingToFreeShipping} грн</b>.
                                    <div className={s.bonusProgress}>
                                        <div className={s.progressLine} style={{ width: `${Math.min((total / deliveryThreshold) * 100, 100)}%` }}></div>
                                    </div>
                                </div>

                                <div className={s.summaryBlock}>
                                    <div className={s.line}><span className={s.firstSpan}>Сума замовлення</span><span className={s.spanBold}>{subtotal.toLocaleString()} ₴</span></div>
                                    {discount > 0 && <div className={s.line}><span className={s.firstSpan}>Сума знижки</span><span className={s.spanBoldGray}>{discount.toLocaleString()} ₴</span></div>}
                                    <div className={s.line}><span className={s.firstSpan}>Вартість доставки</span><span className={s.spanBold}>За тарифами "Нової Пошти"</span></div>

                                    <div className={s.totalLine}>
                                        <p>РАЗОМ</p>
                                        <p>{total.toLocaleString()} ₴</p>
                                    </div>

                                    <Link to="/checkout" onClick={() => dispatch(setCartOpen(false))} className={s.checkout}>ОФОРМИТИ ЗАМОВЛЕННЯ</Link>
                                    <button className={s.continue} onClick={() => dispatch(setCartOpen(false))}>ПРОДОВЖИТИ ПОКУПКИ</button>
                                </div>
                            </div>

                        )}

                    </div>
                </div>

                <div className={s.wrapRecomended}>
                    <h3 className={s.titleRec}>Рекомендовані товари</h3>
                    <RecommendedProducts />
                </div>

            </div>
        </div>
    );
};

export default CartDrawer;