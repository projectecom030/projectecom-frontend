import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Subscribe from "../components/Subscribe";
import { CONTACT_INFO } from "../constants/contactInfo";
import api from "../services/api";
import "./Subscription.css";

function SubscriptionPage() {
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [dealerPlans, setDealerPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const query = new URLSearchParams(location.search);
  const requestedRedirect = query.get("redirectTo") || "";
  const redirectTo = requestedRedirect.startsWith("/properties/")
    ? requestedRedirect
    : "";

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/subscription/plans/all");
      if (Array.isArray(data)) {
        setPlans(data);
        setDealerPlans([]);
        return;
      }
      const customerList = Array.isArray(data?.customerPlans) ? data.customerPlans : data?.data || [];
      const dealerList = Array.isArray(data?.dealerPlans) ? data.dealerPlans : [];
      setPlans(customerList);
      setDealerPlans(dealerList);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err.response?.data?.message || "Failed to load subscription plans");
      setPlans([]);
      setDealerPlans([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pricing-container">
      <h2 className="pricing-title">Choose Your Perfect Plan</h2>
      <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "24px" }}>
        All payments on this platform are for listing, subscription, and promotional services only. We do not
        facilitate property transactions between buyers and sellers.
      </p>

      {loading && <p>Loading plans...</p>}
      {!loading && error && <p>{error}</p>}
      {!loading && !error && plans.length === 0 && <p>No plans available right now.</p>}

      <div className="pricing-grid">
        {plans.map((plan, index) => {
          const isPopular = index === 1;
          const isPremium = Number(plan.is_premium) === 1;

          return (
            <div
              key={plan.id}
              className={`pricing-card 
                ${isPopular ? "popular" : ""} 
                ${isPremium ? "premium" : ""}
              `}
            >
              {isPopular && <div className="badge">Most Popular</div>}

              <h3>{plan.name}</h3>

              <div className="price">
                INR {plan.price}
                <span>/ plan</span>
              </div>

              <ul>
                <li>{plan.contacts} Contacts</li>
                <li>{plan.validity_days} Days Validity</li>
                {isPremium ? <li>Direct Admin Contact</li> : <li>Premium Support</li>}
                <li>Instant Activation</li>
              </ul>

              {isPremium ? (
                <a
                  href={CONTACT_INFO.phoneHref}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
                >
                  Call Now
                </a>
              ) : (
                <Subscribe
                  plan={{
                    id: plan.id,
                    name: plan.name,
                    price: plan.price,
                  }}
                  redirectTo={redirectTo}
                  disabled={isPaying}
                  onProcessingChange={setIsPaying}
                />
              )}
            </div>
          );
        })}
      </div>

      {dealerPlans.length > 0 && (
        <>
          <h2 className="pricing-title" style={{ marginTop: "48px" }}>
            Dealer Plans
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "24px" }}>
            Dealers should not deal directly.
          </p>

          <div className="pricing-grid">
            {dealerPlans.map((plan) => {
              const isPopular = Number(plan.price) === 499;
              return (
                <div
                  key={plan.id}
                  className={`pricing-card ${isPopular ? "popular" : ""}`}
                >
                  {isPopular && <div className="badge">Most Popular</div>}

                  <h3>{plan.name}</h3>

                  <div className="price">
                    INR {plan.price}
                    <span>/ plan</span>
                  </div>

                  <ul>
                    <li>{plan.contacts} Contacts</li>
                    <li>{plan.validity_days} Days Validity</li>
                    <li>Premium Support</li>
                    <li>Instant Activation</li>
                  </ul>

                  <Subscribe
                    plan={{
                      id: plan.id,
                      name: plan.name,
                      price: plan.price,
                    }}
                    redirectTo={redirectTo}
                    disabled={isPaying}
                    onProcessingChange={setIsPaying}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default SubscriptionPage;
