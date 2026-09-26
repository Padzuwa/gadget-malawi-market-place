export function HomeHero() {
  return (
    <section className="gm-market-hero">
      <div className="gm-market-hero-content">
        <span className="gm-eyebrow">
          Buy &amp; Sell Genuine Gadgets in Malawi
        </span>

        <h1 className="gm-display">Your next gadget is here.</h1>

        <p>
          Phones, laptops, PC parts, storage and more — from trusted sellers
          across Malawi.
        </p>

        <div className="gm-hero-actions" style={{ marginTop: 24 }}>
          <a href="/browse" className="gm-btn gm-btn-primary">
            Browse gadgets
          </a>
          <a href="/sell" className="gm-btn gm-btn-secondary">
            Sell a gadget
          </a>
        </div>
      </div>
    </section>
  );
}