import { CONTACT_INFO } from "../constants/contactInfo"

const PrivacyPolicyPage = () => {
  return (
    <div className="page-shell">
      <section className="container page-hero">
        <div className="max-w-4xl">
          <p className="page-kicker">Privacy Policy</p>
          <h1 className="page-title">Welcome to Budget Property.</h1>
          <p className="page-lead">
            We respect your privacy and are committed to protecting your personal information. Last updated: March 17,
            2026.
          </p>
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="max-w-4xl space-y-6 text-slate-600">
          <div className="page-card">
            <h2 className="page-card-title">1. Information We Collect</h2>
            <p className="page-card-body">
              We may collect: name, phone number, email address, property details you submit, and login or usage data.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">2. How We Use Information</h2>
            <p className="page-card-body">
              We use your information to provide listing and subscription services, improve our platform, and
              communicate with users.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">3. Data Sharing</h2>
            <p className="page-card-body">
              We do not sell your personal data. We may share information only to comply with legal requirements or to
              provide our services.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">4. Cookies</h2>
            <p className="page-card-body">
              We may use cookies to improve user experience.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">5. Security</h2>
            <p className="page-card-body">
              We take reasonable steps to protect your data.
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">6. Contact Us</h2>
            <p className="page-card-body">
              If you have any questions, contact us at: {CONTACT_INFO.email}
            </p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">7. Disclaimer</h2>
            <p className="page-card-body">
              We are a property listing platform and do not participate in transactions between buyers and sellers.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPolicyPage
