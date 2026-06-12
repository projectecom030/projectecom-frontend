import { CONTACT_INFO } from "../constants/contactInfo"

const RefundPolicyPage = () => {
  return (
    <div className="page-shell">
      <section className="container page-hero">
        <div className="max-w-4xl">
          <p className="page-kicker">Refund Policy</p>
          <h1 className="page-title">Refund &amp; Cancellation Policy</h1>
          <p className="page-lead">
            This policy explains refunds and cancellations for Budget Property services. Last updated: March 17, 2026.
          </p>
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="max-w-4xl space-y-6 text-slate-600">
          <div className="page-card">
            <h2 className="page-card-title">1. Services</h2>
            <p className="page-card-body">
              All payments made on Budget Property are for listing services, subscription plans, and promotional
              features.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">2. Refund Policy</h2>
            <p className="page-card-body">
              Payments are non-refundable once the service is activated. No refunds for partially used services.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">3. Cancellation</h2>
            <p className="page-card-body">
              Users can cancel subscription anytime. Services remain active until expiry.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">4. Exceptions</h2>
            <p className="page-card-body">
              Refunds may be considered only in duplicate payment or technical errors.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">5. Contact</h2>
            <p className="page-card-body">
              For refund requests, contact: {CONTACT_INFO.email}
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">6. Important Note</h2>
            <p className="page-card-body">
              We do not handle property transactions or payments between buyers and sellers.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default RefundPolicyPage
