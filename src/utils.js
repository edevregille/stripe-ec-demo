import {config} from './config';

const  {
    STRIPE_SECRET_KEY,
    STRIPE_PUBLIC_KEY ,
    STRIPE_CUSTOMER_ID  ,
    PRICE_ITEM_1_ID  ,
    PRICE_ITEM_2_ID  ,
    PRICE_ITEM_SUBS  ,
    TAX_RATE  ,
    SUBSCRIPTION_STRIPE_ACCOUNT_ID ,
    PRICE_SUBSCRIPTION  ,
} = config;

const stripe = require('stripe')(STRIPE_SECRET_KEY);

const STRIPE_TAX = false;

export const fetchStripePublicKey = () => {return STRIPE_PUBLIC_KEY}

// function to create a stripe checkout session
export const createPaymentCheckoutSession = async (login) => {
    // create customer object
    let customer = STRIPE_CUSTOMER_ID 
    if(!login) {
        const cust = await stripe.customers.create({
            // name: 'Jenny Rosen',
            // email: 'jennyrosen@example.com',
        });
        customer = cust.id
    }
    
    const options = {
        customer,
        mode: 'payment',
        ui_mode: 'embedded',
        return_url: `http://localhost:3000/return?session_id={CHECKOUT_SESSION_ID}`,
        ...(STRIPE_TAX && { automatic_tax: { enabled: true,}, }),
        ...(STRIPE_TAX && { shipping_address_collection:{
            allowed_countries: ["US", "CA", "AU"],
        },
        customer_update: {
            shipping: "auto",
        },}),
        line_items: [
            {
                price: PRICE_ITEM_1_ID,
                quantity: 1,
                ...(STRIPE_TAX && { adjustable_quantity:{enabled: true,},}),
                ...(!STRIPE_TAX && { tax_rates:[TAX_RATE] } ),
            },{
                price: PRICE_ITEM_2_ID,
                quantity: 1,
                ...(STRIPE_TAX && {adjustable_quantity:{enabled: true,},}),
                ...(!STRIPE_TAX && { tax_rates:[TAX_RATE] } ),
            },{
                price: PRICE_ITEM_SUBS,
                quantity: 1,   
            },
        ],
        metadata:{
            "subscription": "true",
        },
        allow_promotion_codes: true,
        shipping_options: [
            { shipping_rate: "shr_1OkvLPQwgFHPPAFbWBDW0qo4" },
            { shipping_rate: "shr_1OkvM1QwgFHPPAFbotBN4vOM" },
        ],
        payment_intent_data: {
            setup_future_usage: "off_session",
            capture_method: "manual",
            description: "Payment Ring for devices"
        },
        phone_number_collection: {
            enabled: true,
        },
        consent_collection:{
            payment_method_reuse_agreement: {
                position: "hidden", 
            },
            terms_of_service:"required",
        },
        custom_text: {
            terms_of_service_acceptance:{message: "Ring terms to save payment method for reuse for subscriptions or future devices (custom)"},
        },
        submit_type:"pay",
    }; 

    const session = await stripe.checkout.sessions.create(options);
    return {clientSecret: session.client_secret, sessionId: session.id }
}

export const retrieveStatusSession = async (sessionId) => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
        status: session.status,
        customer_email: session.customer_details.email,
        payment_intent: session.payment_intent,
    };
}
    
export const createSubscription = async (sessionId, customer_email) => {
    // get session details
    const {customer, line_items, metadata, payment_intent} = await stripe.checkout.sessions.retrieve(sessionId);
    
    // get Payment Method Token
    const {payment_method} = await stripe.paymentIntents.retrieve(payment_intent);
    console.log(payment_method)
    
    // clone PM on Subscription
    const paymentMethod = await stripe.paymentMethods.create({
        customer,
        payment_method,
    }, {
        stripeAccount: SUBSCRIPTION_STRIPE_ACCOUNT_ID,
    });

    // attach the new payment method to a customer object on the subscription account
    const cust = await stripe.customers.create({
        payment_method: paymentMethod.id,
        email: customer_email,
        invoice_settings: {
            default_payment_method: paymentMethod.id,
        },
    }, {
        stripeAccount: SUBSCRIPTION_STRIPE_ACCOUNT_ID,
    });

    // create subscription
    const subscription = await stripe.subscriptions.create({
        customer: cust.id,
        items: [
          {
            price: PRICE_SUBSCRIPTION,
          },
        ],
      }, {
        stripeAccount: SUBSCRIPTION_STRIPE_ACCOUNT_ID,
    });
    console.log('subscription', subscription)

    return {
        id: subscription.id
    }

}