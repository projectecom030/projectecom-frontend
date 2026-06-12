const AboutPage = () => {
  return (
    <div className="page-shell">
      <section className="container page-hero">
        <div className="max-w-4xl">
          <p className="page-kicker">About Us</p>
          <h1 className="page-title">We help people make confident property decisions.</h1>
          <p className="page-lead">
            BudgetProperty connects buyers, renters, and property owners with a transparent, easy-to-use platform.
            We focus on clarity, verified information, and human support so you can move faster without guesswork.
          </p>
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="page-grid">
          {[
            {
              title: "Verified Listings",
              body: "We prioritize accuracy and freshness so you can compare properties with confidence.",
            },
            {
              title: "Smart Discovery",
              body: "Powerful filters and curated categories help you find the right home faster.",
            },
            {
              title: "Transparent Pricing",
              body: "Clear plans and straightforward pricing, with no hidden steps in the journey.",
            },
            {
              title: "Customer-First Support",
              body: "From inquiry to closing, our support team stays close and responsive.",
            },
          ].map((item) => (
            <div key={item.title} className="page-card">
              <h3 className="page-card-title">{item.title}</h3>
              <p className="page-card-body">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AboutPage
