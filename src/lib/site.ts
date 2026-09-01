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
  shop: [
    { label: "Electronics", href: "/shop?category=electronics" },
    { label: "Fashion", href: "/shop?category=fashion" },
    { label: "Home & Living", href: "/shop?category=home-living" },
    { label: "Beauty & Care", href: "/shop?category=beauty-care" },
    { label: "Sports & Outdoors", href: "/shop?category=sports-outdoors" },
    { label: "Toys & Kids", href: "/shop?category=toys-kids" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/about" },
    { label: "Press", href: "/about" },
  ],
  support: [
    { label: "Help Center", href: "/faq" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Shipping & Delivery", href: "/faq" },
    { label: "Returns & Refunds", href: "/faq" },
  ],
};
