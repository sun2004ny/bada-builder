export const SUBSCRIPTION_PLANS = {
    ind_1m: {
        id: 'ind_1m',
        name: 'Individual 1 Month',
        duration: 1, // months
        price: 100,
        properties_allowed: 1,
        user_type: 'individual'
    },
    ind_6m: {
        id: 'ind_6m',
        name: 'Individual 6 Months',
        duration: 6,
        price: 400,
        properties_allowed: 1,
        user_type: 'individual'
    },
    ind_12m: {
        id: 'ind_12m',
        name: 'Individual 12 Months',
        duration: 12,
        price: 700,
        properties_allowed: 1,
        user_type: 'individual'
    },
    dev_12m: {
        id: 'dev_12m',
        name: 'Developer 12 Months',
        duration: 12,
        price: 20000,
        properties_allowed: 20,
        user_type: 'developer'
    }
};

export const getPlanById = (planId) => SUBSCRIPTION_PLANS[planId];
