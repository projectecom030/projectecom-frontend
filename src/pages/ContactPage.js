import { Mail, MapPin, Phone } from "lucide-react"
import { CONTACT_INFO } from "../constants/contactInfo"

const ContactPage = () => {
  return (
    <div className="page-shell">
      <section className="container page-hero">
        <div className="max-w-3xl">
          <p className="page-kicker">Contact Us</p>
          <h1 className="page-title">Contact Us</h1>
          <p className="page-lead">
            We are a property listing platform and do not act as intermediaries.
          </p>
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="page-grid">
          <div className="page-card">
            <h2 className="page-card-title">Business Name</h2>
            <p className="page-card-body">{CONTACT_INFO.businessName}</p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">Owner Name</h2>
            <p className="page-card-body">{CONTACT_INFO.ownerName}</p>
          </div>

          <div className="page-card">
            <div className="flex items-center gap-3 text-slate-900">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="page-card-title">Email</span>
            </div>
            <p className="page-card-body break-all">{CONTACT_INFO.email}</p>
          </div>

          <div className="page-card">
            <div className="flex items-center gap-3 text-slate-900">
              <Phone className="h-5 w-5 text-blue-600" />
              <span className="page-card-title">Phone</span>
            </div>
            <p className="page-card-body">{CONTACT_INFO.phone}</p>
          </div>

          <div className="page-card">
            <div className="flex items-center gap-3 text-slate-900">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="page-card-title">Address</span>
            </div>
            <p className="page-card-body">{CONTACT_INFO.address}</p>
          </div>

          <div className="page-card">
            <h2 className="page-card-title">Working Hours</h2>
            <p className="page-card-body">{CONTACT_INFO.workingHours}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage
