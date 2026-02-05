import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import RacketCatalog from '../components/sections/RacketCatalog';
import CheckoutDemo from '../components/sections/CheckoutDemo';
import axios from 'axios';
import { Loader } from "../components/Loader";

const Rackets = () => {
    const [checkoutProduct, setCheckoutProduct] = useState(null);

    return (
        <div style={{ backgroundColor: '#F7F7F5', minHeight: '100vh' }}>
            <Layout>
                {/* Catalog handles its own padding/layout styling now */}
                <RacketCatalog onCheckout={setCheckoutProduct} />
            </Layout>

            <Loader />

            <CheckoutDemo
                product={checkoutProduct}
                onClose={() => setCheckoutProduct(null)}
                onConfirm={async () => {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

                    if (!userInfo || !userInfo.token) {
                        alert("Please log in to place an order.");
                        window.location.href = '/auth';
                        return;
                    }

                    try {
                        const config = {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${userInfo.token}`,
                            },
                        };

                        const orderData = {
                            orderItems: [{
                                name: checkoutProduct.name,
                                qty: 1,
                                image: checkoutProduct.imageUrl,
                                price: checkoutProduct.price,
                                product: checkoutProduct._id
                            }],
                            totalPrice: checkoutProduct.price
                        };

                        await axios.post('http://localhost:5001/api/orders', orderData, config);

                        alert(`Order placed successfully for ${checkoutProduct.name}!`);
                        setCheckoutProduct(null);
                    } catch (error) {
                        console.error("Order failed:", error);
                        alert("Failed to place order. Please try again.");
                    }
                }}
            />
        </div>
    );
};

export default Rackets;
