import api from "./api";

export const getActiveSubscription = () => api.get("/subscription/active");
export const getSubscriptionPlans = () => api.get("/subscription/plans");
