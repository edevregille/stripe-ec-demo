import { useEffect, useState } from "react";
import './App.css';
import header from './header.png';

import { createPaymentCheckoutSession, fetchStripePublicKey } from "../utils";
import {loadStripe} from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(fetchStripePublicKey());

const Checkout = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [clientSecret , setClientSecret ] = useState(null);

    useEffect(() => {
        ( async () => {
            setClientSecret(null);
            const { clientSecret } = await createPaymentCheckoutSession(isLogin); 
            setClientSecret(clientSecret);
        })()
    }, [isLogin]);


    const options = {clientSecret};
    
    return(
        <div className="container">
            {/* header */}
            <div className="headerContainer">
                <img src={header} alt="" className="img"/>
            </div>    
            {/* user login */}
            <div className="linklogin">
                { isLogin ? `Hello Bob Cool` : `Have an account?`} <span className="link" onClick={()=> setIsLogin(!isLogin)}>{`${isLogin ? 'Log Out' : 'Log In'}`}</span>
            </div>

            <div className="containerCheckout">
                {clientSecret && (
                    <EmbeddedCheckoutProvider
                        stripe={stripePromise}
                        options={options}
                        >
                        <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                )}
            </div>
        </div>
    )
}

export default Checkout;