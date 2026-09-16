export const siteConfig = {
  name: "NovaMart",
  tagline: "Premium shopping, delivered to your door.",
  description:
    "NovaMart is a premium e-commerce destination for electronics, fashion, home, and lifestyle products — with fast shipping, easy returns, and everyday low prices.",
  url: "https://novamart.example.com",
  email: "support@novamart.com",
  phone: "+1 (555) 123-4567",
  address: "1200 Market Street, Suite 400, San Francisco, CA 94102",
  socials: {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    linkedin: "https://linkedin.com",
  },
  currencies: ["USD", "PKR", "CAD", "SAR", "AUD"],
  freeShippingThreshold: 100,
  shippingRate: 12,
  taxRate: 0,
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Catalog", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Catalog", href: "/#catalog" },
    { label: "Categories", href: "/categories" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
  ],
  policies: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Shipping Policy", href: "/faq" },
    { label: "Returns & Refunds", href: "/faq" },
    { label: "Cancellation Policy", href: "/terms" },
  ],
  shop: [
    { label: "Shop All", href: "/#catalog" },
    { label: "Full Catalog", href: "/shop" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "My Orders", href: "/orders" },
  ],
};
