import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Subscribe({ plan, redirectTo = "", disabled = false, onProcessingChange }) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!plan?.id) {
      alert("Plan not found");
      return;
    }

    try {
      if (isProcessing || disabled) return;
      setIsProcessing(true);
      if (onProcessingChange) onProcessingChange(true);

      if (!process.env.REACT_APP_RAZORPAY_KEY) {
        alert("Payment configuration is missing. Please contact support.");
        return;
      }

      const { data: order } = await api.post("/payment/create-order", {
        plan_id: plan.id,
      });

      if (!window.Razorpay) {
        alert("Payment gateway is not available right now.");
        return;
      }

      const enforceLiveMode =
        String(process.env.REACT_APP_RAZORPAY_ENFORCE_LIVE_MODE || "false").toLowerCase() === "true";

      if (enforceLiveMode && !String(process.env.REACT_APP_RAZORPAY_KEY || "").startsWith("rzp_live_")) {
        alert("Live payment is enabled. Configure REACT_APP_RAZORPAY_KEY with rzp_live_ key.");
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "Property Platform",
        description: plan.name,
        order_id: order.id,
        handler: async function (response) {
          try {
            await api.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: plan.id,
            });

            alert("Subscription activated successfully");
            if (redirectTo) {
              navigate(redirectTo);
            } else {
              window.location.reload();
            }
          } catch (verifyError) {
            console.error("Verify payment error:", verifyError);
            if (verifyError.response?.status === 401) {
              alert("Please login again to activate your subscription.");
              return;
            }
            const message =
              verifyError.response?.data?.message ||
              "Payment captured, but activation failed. Please contact support.";
            alert(message);
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        const message =
          response?.error?.description ||
          response?.error?.reason ||
          "Payment failed. Please try again.";
        alert(message);
      });
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      if (error.response?.status === 401) {
        alert("Please login to continue.");
        return;
      }
      alert(error.response?.data?.message || "Payment failed");
    } finally {
      setIsProcessing(false);
      if (onProcessingChange) onProcessingChange(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      style={{
        ...buttonStyle,
        opacity: isProcessing || disabled ? 0.7 : 1,
        cursor: isProcessing || disabled ? "not-allowed" : "pointer",
      }}
      disabled={isProcessing || disabled}
    >
      {isProcessing ? "Processing..." : `Buy ${plan?.name}`}
    </button>
  );
}

const buttonStyle = {
  padding: "10px 20px",
  background: "#3399cc",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default Subscribe;
