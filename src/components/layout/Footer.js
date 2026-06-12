import { Link } from "react-router-dom"
import { Building2, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { CONTACT_INFO } from "../../constants/contactInfo"

const Footer = () => {
  const scrollToTopInstant = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }

  const legalLinks = [
    { to: "/privacy-policy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms & Conditions" },
    { to: "/refund-policy", label: "Refund Policy" },
    { to: "/contact", label: "Contact Us" },
  ]

  const companyLinks = [
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact Us" },
    { to: "/subscription", label: "Subscriptions" },
    { to: "/wishlist", label: "Wishlist" },
  ]

  const socialLinks = [
    { href: "https://www.facebook.com", label: "Facebook", Icon: Facebook },
    { href: "https://www.twitter.com", label: "Twitter", Icon: Twitter },
    { href: "https://www.instagram.com", label: "Instagram", Icon: Instagram },
    { href: "https://www.linkedin.com", label: "LinkedIn", Icon: Linkedin },
  ]

  return (
    <>
      <div className="h-20 md:h-24 bg-transparent" aria-hidden="true" />
      <footer className="relative overflow-hidden bg-slate-950 text-slate-300 rounded-t-[28px] border-t border-slate-800/80 shadow-[0_-18px_40px_rgba(2,6,23,0.35)]">
        <div className="footer-orb footer-orb-one" aria-hidden="true" />
        <div className="footer-orb footer-orb-two" aria-hidden="true" />

        <div className="container py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          {/* Brand */}
          <div className="footer-card">
            <div className="flex items-center flex-wrap gap-2 mb-4 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white break-words">BudgetProperty</span>
            </div>
            <p className="text-slate-400 mb-4 leading-7">
              We offer property listing and promotional services. Users can subscribe to plans to showcase their
              properties to a wider audience.
            </p>
            <p className="text-slate-500 text-sm leading-6">
              Disclaimer: Budget Property is an independent property listing platform. We do not act as real estate
              intermediaries and do not participate in any transaction between buyers and sellers.
            </p>
          </div>

          {/* Company */}
          <div className="footer-card">
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="footer-link" onClick={scrollToTopInstant}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex gap-4 mt-4">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="footer-card">
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="footer-link" onClick={scrollToTopInstant}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-card text-left">
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="grid grid-cols-[20px_minmax(0,1fr)] items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-400 -ml-0.5 mt-0.5" />
                <span className="text-slate-400 leading-6">
                  {CONTACT_INFO.address}
                </span>
              </li>
              <li className="grid grid-cols-[20px_minmax(0,1fr)] items-start gap-3">
                <Phone className="w-5 h-5 text-cyan-400 -ml-0.5 mt-0.5" />
                <a href={CONTACT_INFO.phoneHref} className="footer-link block leading-6">
                  {CONTACT_INFO.phoneDisplay}
                </a>
              </li>
              <li className="grid grid-cols-[20px_minmax(0,1fr)] items-start gap-3">
                <Mail className="w-5 h-5 text-cyan-400 -ml-0.5 mt-0.5" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="footer-link block leading-6 break-all">
                  {CONTACT_INFO.email}
                </a>
              </li>
            </ul>
          </div>
          </div>

          <div className="border-t border-slate-800/80 mt-8 pt-8 text-center text-slate-500">
            <p>&copy; {new Date().getFullYear()} BudgetProperty. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer 
