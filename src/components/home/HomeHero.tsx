import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const categories = [
  'All',
  'Phones',
  'Laptops',
  'PC Parts',
  'Storage',
  'Accessories',
];

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

        <form
          action="/browse"
          className="gm-search gm-search-lg"
          style={{ marginTop: 24 }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            type="search"
            name="q"
            placeholder="Search for phones, laptops, GPUs, SSDs..."
            aria-label="Search gadgets"
          />
        </form>

        <div className="gm-chips" style={{ marginTop: 14 }}>
          {categories.map((category) => {
            const isAll = category === 'All';
            const href = isAll
              ? '/browse'
              : `/browse?category=${encodeURIComponent(category)}`;

            return (
              <Link
                key={category}
                href={href}
                className={`gm-chip${isAll ? ' is-active' : ''}`}
              >
                {category}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}