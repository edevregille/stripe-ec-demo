import { useState, useEffect } from "react";
import { createSubscription, retrieveStatusSession } from "../utils";

const Return  = () => {
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');
    const [payment_intent, setPaymentIntent] = useState(null);
    const [subscription, setSubscription] = useState(null);
  
    useEffect(() => {
        (async () => {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const sessionId = urlParams.get('session_id');
        
            const {status, customer_email, payment_intent} = await retrieveStatusSession(sessionId);

            if(status === 'complete') {
                cloneAndSubscribe(sessionId, customer_email)
            }
            setStatus(status);
            setCustomerEmail(customer_email);
            setPaymentIntent(payment_intent);
        })()}, [])       
        
        const cloneAndSubscribe = async (sessionId, customer_email) => {
            const {id} = await createSubscription(sessionId, customer_email);
            setSubscription(id);
        }
  

      return (
        <section id="success">
          <p>
            Payment Status: {status} ({payment_intent})<br/> <br />

            {subscription && <div>Subscription ID: {subscription}</div>}
          </p>
        </section>
      )
}


export default Return;