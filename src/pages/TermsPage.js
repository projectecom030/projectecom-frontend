import { CONTACT_INFO } from "../constants/contactInfo"

const TermsPage = () => {
  return (
    <div className="page-shell">
      <section className="container page-hero">
        <div className="max-w-4xl">
          <p className="page-kicker">Terms &amp; Conditions</p>
          <h1 className="page-title">Terms &amp; Conditions</h1>
          <p className="page-lead">
            By using Budget Property, you agree to the following terms. Last updated: March 17, 2026.
          </p>
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="max-w-4xl space-y-6 text-slate-600">
          <div className="page-card">
            <h2 className="page-card-title">1. Service Description</h2>
            <p className="page-card-body">
              Budget Property is a platform for property listing and promotional services. We do not act as real estate
              intermediaries and do not facilitate transactions between buyers and sellers.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">2. User Responsibilities</h2>
            <p className="page-card-body">
              Users must provide accurate property information and are responsible for their listings.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">3. Payments</h2>
            <p className="page-card-body">
              Payments are only for listing, subscription, and promotional services. We do not handle property
              transactions.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">4. Prohibited Activities</h2>
            <p className="page-card-body">
              Users must not post false or misleading listings or engage in illegal activities.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">5. Limitation of Liability</h2>
            <p className="page-card-body">
              We are not responsible for property deals between users, losses, or disputes.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">6. Termination</h2>
            <p className="page-card-body">
              We reserve the right to suspend accounts violating terms.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">7. Changes to Terms</h2>
            <p className="page-card-body">We may update terms at any time.</p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">8. Contact</h2>
            <p className="page-card-body">Email: {CONTACT_INFO.email}</p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">9. Disclaimer</h2>
            <p className="page-card-body">
              Budget Property is an independent property listing platform. We do not act as real estate intermediaries
              and do not participate in any transaction between buyers and sellers.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TermsPage
