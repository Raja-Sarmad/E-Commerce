import type {
  BlogPost,
  Brand,
  Coupon,
  Order,
  Testimonial,
  User,
} from "@/lib/types";

function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/800/500`;
}

function avatar(seed: string) {
  return `https://picsum.photos/seed/${seed}/80/80`;
}

/* ─────────────────────────── Brands ─────────────────────────── */

export const brands: Brand[] = [
  { id: "b1", name: "Sonix", logo: "sonix" },
  { id: "b2", name: "TechOne", logo: "techone" },
  { id: "b3", name: "Vortex", logo: "vortex" },
  { id: "b4", name: "Aura & Oak", logo: "auraoak" },
  { id: "b5", name: "Lumen", logo: "lumen" },
  { id: "b6", name: "Northbound", logo: "northbound" },
  { id: "b7", name: "Botaniq", logo: "botaniq" },
  { id: "b8", name: "TrailPeak", logo: "trailpeak" },
];

/* ─────────────────────── Testimonials ─────────────────────── */

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Rachel Greene",
    role: "Verified Buyer",
    avatar: avatar("av-rg"),
    rating: 5,
    content:
      "NovaMart has completely changed how I shop online. The checkout was seamless, delivery arrived in two days, and the quality is outstanding. My new headphones are incredible!",
  },
  {
    id: "t2",
    name: "Miguel Santos",
    role: "Verified Buyer",
    avatar: avatar("av-ms"),
    rating: 5,
    content:
      "The product images and descriptions are spot on — what I ordered is exactly what arrived. Customer support even helped me track my package. Five stars, easily.",
  },
  {
    id: "t3",
    name: "Priya Sharma",
    role: "Verified Buyer",
    avatar: avatar("av-ps"),
    rating: 4,
    content:
      "Beautiful store and a great selection of premium home goods. I redecorated my entire living room from NovaMart and couldn't be happier with the results.",
  },
  {
    id: "t4",
    name: "James Whitfield",
    role: "Verified Buyer",
    avatar: avatar("av-jw"),
    rating: 5,
    content:
      "Fast shipping, careful packaging, and everything is high quality. The wishlist and order tracking features are the best I've used. Highly recommend.",
  },
  {
    id: "t5",
    name: "Amara Okafor",
    role: "Verified Buyer",
    avatar: avatar("av-ao"),
    rating: 5,
    content:
      "I love the honest reviews and the easy returns. When one item didn't work out, the refund hit my account within 48 hours. That's customer-first service.",
  },
  {
    id: "t6",
    name: "Daniel Reyes",
    role: "Verified Buyer",
    avatar: avatar("av-dr"),
    rating: 5,
    content:
      "From the flash sales to the newsletter deals, NovaMart keeps delivering value. The dark mode is a nice touch too — this store feels genuinely premium.",
  },
];

/* ─────────────────────────── Blog ─────────────────────────── */

export const blogPosts: BlogPost[] = [
  {
    id: "bl-001",
    slug: "how-to-choose-the-perfect-wireless-headphones",
    title: "How to Choose the Perfect Wireless Headphones in 2026",
    excerpt:
      "From noise cancellation to battery life, here's everything you need to know before buying your next pair of headphones.",
    content: [
      "Wireless headphones have come a long way. Whether you're commuting, working out, or in back-to-back meetings, the right pair can transform your daily experience. Here's a practical guide to finding yours.",
      "Start with your use case. Commuters should prioritize active noise cancellation, while gym-goers need a secure, sweat-resistant fit. Home office users benefit most from a quality microphone and multipoint pairing.",
      "Battery life matters more than most people think. A 30+ hour pair means charging once a week instead of every day. Look for fast-charge support — ten minutes of charging should buy you several hours of playback.",
      "Sound quality is subjective. Don't chase spec sheets alone. Visit a store, listen to your favorite tracks, and trust your ears. If you can't test in person, look for neutral reviews from multiple sources.",
      "Finally, consider ecosystem fit. Multipoint pairing, spatial audio, and app features are more useful when they work seamlessly with your phone, laptop, and tablet.",
    ],
    coverImage: img("blog-1"),
    category: "Buying Guides",
    author: "Elena Vasquez",
    authorAvatar: avatar("blog-author-1"),
    date: "2026-01-28T10:00:00Z",
    readTime: 6,
    tags: ["audio", "headphones", "buying-guide"],
    featured: true,
  },
  {
    id: "bl-002",
    slug: "skincare-routine-101-build-your-routine-in-5-steps",
    title: "Skincare Routine 101: Build Your Routine in 5 Steps",
    excerpt:
      "Cleanser, serum, moisturizer, SPF — demystify the modern skincare routine with this beginner-friendly guide.",
    content: [
      "A great skincare routine doesn't need ten products. It needs consistency and the right five essentials tailored to your skin type.",
      "Step one is cleansing. Use a gentle cleanser morning and night to remove dirt, oil, and makeup without stripping your skin's barrier.",
      "Step two is treatment. This is where active ingredients live — vitamin C for brightening, niacinamide for texture, or salicylic acid for congestion. Introduce one new active at a time.",
      "Step three is moisturizing. Even oily skin needs moisture. A lightweight gel moisturizer hydrates without heaviness; a richer cream works for dry skin.",
      "Step four is SPF — the single most important anti-aging step. Use a broad-spectrum sunscreen of at least SPF 30 every morning, rain or shine.",
      "Step five is patience. Skin renews on a roughly 28-day cycle. Give any new routine at least four weeks before judging results.",
    ],
    coverImage: img("blog-2"),
    category: "Beauty & Care",
    author: "Sofia Marchetti",
    authorAvatar: avatar("blog-author-2"),
    date: "2026-01-20T10:00:00Z",
    readTime: 5,
    tags: ["skincare", "beauty", "routine"],
    featured: true,
  },
  {
    id: "bl-003",
    slug: "smart-home-essentials-every-budget",
    title: "Smart Home Essentials for Every Budget",
    excerpt:
      "Turn your home into a smart haven without breaking the bank. Here are the upgrades worth your money in 2026.",
    content: [
      "Smart home technology has never been more accessible. You can start small with a single smart speaker or build a fully automated home over time.",
      "Begin with a smart speaker or hub. It becomes the control center for everything else — lights, thermostats, locks, and cameras.",
      "Smart bulbs are the cheapest way to upgrade a room. Dim them, color them, or schedule them to wake you gently with light.",
      "A smart thermostat pays for itself in energy savings. Most models learn your schedule and adjust automatically, cutting heating and cooling costs by up to 10%.",
      "For security, start with a video doorbell and a smart lock. Remote access and instant alerts give you peace of mind whether you're at work or on vacation.",
      "When choosing devices, stick to one major ecosystem to keep everything working together smoothly. Check compatibility before you buy.",
    ],
    coverImage: img("blog-3"),
    category: "Technology",
    author: "David Chen",
    authorAvatar: avatar("blog-author-3"),
    date: "2026-01-12T10:00:00Z",
    readTime: 7,
    tags: ["smart-home", "technology", "budget"],
  },
  {
    id: "bl-004",
    slug: "eco-friendly-products-that-actually-work",
    title: "10 Eco-Friendly Products That Actually Make a Difference",
    excerpt:
      "Sustainable shopping doesn't mean sacrificing quality. Our roundup of genuinely effective eco-friendly products.",
    content: [
      "Sustainability in retail is evolving fast. Today's eco-friendly products often outperform their conventional counterparts — and they look great doing it.",
      "Start with the kitchen. Reusable beeswax wraps, stainless bottles, and durable cookware reduce single-use waste while lasting for years.",
      "In the bedroom, look for organic cotton and bamboo bedding with certifications like OEKO-TEX. They're softer and safer for sensitive skin.",
      "For personal care, refillable containers and concentrated formulas cut packaging waste dramatically without increasing cost per use.",
      "When shopping, look past marketing. Check for credible certifications and read the materials list. A product made from recycled fibers is only genuinely sustainable if it's built to last.",
    ],
    coverImage: img("blog-4"),
    category: "Lifestyle",
    author: "Amara Okafor",
    authorAvatar: avatar("blog-author-4"),
    date: "2025-12-30T10:00:00Z",
    readTime: 5,
    tags: ["eco", "sustainability", "lifestyle"],
  },
  {
    id: "bl-005",
    slug: "work-from-home-desk-setup-guide",
    title: "The Ultimate Work-From-Home Desk Setup Guide",
    excerpt:
      "Ergonomics, lighting, and gear — build a home office that keeps you productive and pain-free.",
    content: [
      "Your desk setup shapes your productivity, posture, and energy. A few targeted upgrades make a dramatic difference.",
      "Start with the chair. Look for lumbar support, adjustable armrests, and breathable material. You'll spend thousands of hours in it.",
      "Monitor height matters. Your screen's top edge should sit at or just below eye level. Use a stand or monitor arm to dial it in.",
      "A mechanical keyboard and a quality mouse reduce wrist strain. Split and vertical options are worth trying if you type all day.",
      "Lighting is underrated. Position your desk perpendicular to a window, and add a warm task light to reduce eye strain during late hours.",
      "Finish with personality — plants, art, and good cable management make a space you actually want to work in.",
    ],
    coverImage: img("blog-5"),
    category: "Workspace",
    author: "Nathan Brooks",
    authorAvatar: avatar("blog-author-5"),
    date: "2025-12-18T10:00:00Z",
    readTime: 6,
    tags: ["workspace", "home-office", "ergonomics"],
  },
  {
    id: "bl-006",
    slug: "gift-guide-2026-what-to-buy-everyone-on-your-list",
    title: "The 2026 Gift Guide: What to Buy Everyone on Your List",
    excerpt:
      "From tech lovers to wellness enthusiasts, our curated gift guide covers everyone with picks that feel personal.",
    content: [
      "The best gifts feel thoughtful, not generic. This guide pairs every personality type with picks that hit the mark.",
      "For the tech lover: wireless headphones with noise cancellation, a smartwatch, or a mechanical keyboard. Function and fun in one.",
      "For the wellness enthusiast: an aromatherapy diffuser, premium yoga mat, or a skincare set built around their routine.",
      "For the homebody: plush bedding, a table lamp that sets the mood, or a great coffee machine for slow weekends.",
      "For the adventurer: an insulated bottle, a hiking backpack, or weather-proof gear that goes everywhere.",
      "For the little ones: STEM building kits and soft plush friends that survive years of love.",
    ],
    coverImage: img("blog-6"),
    category: "Gift Guides",
    author: "Elena Vasquez",
    authorAvatar: avatar("blog-author-1"),
    date: "2025-12-05T10:00:00Z",
    readTime: 8,
    tags: ["gifts", "guide", "holiday"],
  },
];

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3) {
  return blogPosts.filter((p) => p.slug !== slug).slice(0, limit);
}

/* ─────────────────────────── Coupons ─────────────────────────── */

export const coupons: Coupon[] = [
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minSpend: 50,
    maxDiscount: 50,
    expiresAt: "2026-12-31T00:00:00Z",
    active: true,
  },
  {
    code: "SAVE20",
    type: "percentage",
    value: 20,
    minSpend: 150,
    maxDiscount: 100,
    expiresAt: "2026-09-30T00:00:00Z",
    active: true,
  },
  {
    code: "FLAT25",
    type: "fixed",
    value: 25,
    minSpend: 100,
    expiresAt: "2026-08-31T00:00:00Z",
    active: true,
  },
  {
    code: "FREESHIP",
    type: "fixed",
    value: 12,
    minSpend: 75,
    expiresAt: "2026-12-31T00:00:00Z",
    active: true,
  },
  {
    code: "MEGA50",
    type: "percentage",
    value: 50,
    minSpend: 300,
    maxDiscount: 250,
    expiresAt: "2026-07-31T00:00:00Z",
    active: false,
  },
];

export function getCouponByCode(code: string) {
  return coupons.find(
    (c) => c.code.toLowerCase() === code.toLowerCase() && c.active
  );
}

/* ─────────────────────────── Users ─────────────────────────── */

export const sampleUsers: User[] = [
  {
    id: "us-admin-1",
    name: "Admin User",
    email: "admin@novamart.com",
    avatar: avatar("admin"),
    role: "admin",
    joinedAt: "2023-01-15T10:00:00Z",
    ordersCount: 12,
    totalSpent: 3890.5,
  },
  {
    id: "us-cust-1",
    name: "Rachel Greene",
    email: "rachel@novamart.com",
    avatar: avatar("av-rg"),
    phone: "+1 555 010 2233",
    address: {
      firstName: "Rachel",
      lastName: "Greene",
      address: "48 Rosewood Lane",
      city: "Austin",
      state: "TX",
      zip: "73301",
      country: "United States",
      phone: "+1 555 010 2233",
    },
    role: "customer",
    joinedAt: "2024-03-22T10:00:00Z",
    ordersCount: 7,
    totalSpent: 1284.2,
  },
];

/* ─────────────────────────── Orders ─────────────────────────── */

export const sampleOrders: Order[] = [
  {
    id: "od-001",
    number: "NM-100482",
    items: [
      {
        productId: "pr-001",
        name: "Aurora Wireless Headphones Pro",
        image:
          "https://picsum.photos/seed/aurora-wireless-headphones-pro-1/700/700",
        price: 199,
        quantity: 1,
      },
      {
        productId: "pr-002",
        name: "Pulse Smartwatch Series X",
        image:
          "https://picsum.photos/seed/pulse-smartwatch-series-x-1/700/700",
        price: 249,
        quantity: 1,
      },
    ],
    subtotal: 448,
    discount: 44.8,
    shipping: 0,
    tax: 32.26,
    total: 435.46,
    couponCode: "WELCOME10",
    shippingAddress: {
      firstName: "Rachel",
      lastName: "Greene",
      address: "48 Rosewood Lane",
      city: "Austin",
      state: "TX",
      zip: "73301",
      country: "United States",
      phone: "+1 555 010 2233",
    },
    billingAddress: {
      firstName: "Rachel",
      lastName: "Greene",
      address: "48 Rosewood Lane",
      city: "Austin",
      state: "TX",
      zip: "73301",
      country: "United States",
      phone: "+1 555 010 2233",
    },
    paymentMethod: "Visa ending 4242",
    deliveryMethod: "Express (2-3 days)",
    status: "delivered",
    createdAt: "2026-01-18T14:32:00Z",
    estimatedDelivery: "2026-01-21T00:00:00Z",
    tracking: {
      carrier: "NovaExpress",
      trackingNumber: "NX-8842-9101",
      events: [
        {
          date: "2026-01-18T15:00:00Z",
          label: "Order confirmed",
          location: "Online",
        },
        {
          date: "2026-01-19T09:15:00Z",
          label: "Order picked up",
          location: "Austin, TX",
        },
        {
          date: "2026-01-20T11:40:00Z",
          label: "Out for delivery",
          location: "Austin, TX",
        },
        {
          date: "2026-01-20T16:05:00Z",
          label: "Delivered",
          location: "Austin, TX",
        },
      ],
    },
  },
  {
    id: "od-002",
    number: "NM-100490",
    items: [
      {
        productId: "pr-021",
        name: "Glacier Insulated Water Bottle",
        image:
          "https://picsum.photos/seed/glacier-insulated-water-bottle-1/700/700",
        price: 34,
        quantity: 2,
      },
    ],
    subtotal: 68,
    discount: 0,
    shipping: 0,
    tax: 5.44,
    total: 73.44,
    shippingAddress: {
      firstName: "Rachel",
      lastName: "Greene",
      address: "48 Rosewood Lane",
      city: "Austin",
      state: "TX",
      zip: "73301",
      country: "United States",
      phone: "+1 555 010 2233",
    },
    billingAddress: {
      firstName: "Rachel",
      lastName: "Greene",
      address: "48 Rosewood Lane",
      city: "Austin",
      state: "TX",
      zip: "73301",
      country: "United States",
      phone: "+1 555 010 2233",
    },
    paymentMethod: "PayPal",
    deliveryMethod: "Standard (5-7 days)",
    status: "shipped",
    createdAt: "2026-02-02T10:00:00Z",
    estimatedDelivery: "2026-02-08T00:00:00Z",
    tracking: {
      carrier: "NovaExpress",
      trackingNumber: "NX-9021-4456",
      events: [
        {
          date: "2026-02-02T10:05:00Z",
          label: "Order confirmed",
          location: "Online",
        },
        {
          date: "2026-02-03T08:30:00Z",
          label: "Order shipped",
          location: "Dallas, TX",
        },
        {
          date: "2026-02-05T13:20:00Z",
          label: "In transit",
          location: "Houston, TX",
        },
      ],
    },
  },
  {
    id: "od-003",
    number: "NM-100501",
    items: [
      {
        productId: "pr-019",
        name: "Glow Renewal Serum",
        image: "https://picsum.photos/seed/glow-renewal-serum-1/700/700",
        price: 42,
        quantity: 1,
      },
      {
        productId: "pr-023",
        name: "Hydra Rich Body Lotion",
        image: "https://picsum.photos/seed/hydra-rich-body-lotion-1/700/700",
        price: 28,
        quantity: 1,
      },
    ],
    subtotal: 70,
    discount: 0,
    shipping: 12,
    tax: 6.56,
    total: 88.56,
    shippingAddress: {
      firstName: "Rachel",
      lastName: "Greene",
      address: "48 Rosewood Lane",
      city: "Austin",
      state: "TX",
      zip: "73301",
      country: "United States",
      phone: "+1 555 010 2233",
    },
    billingAddress: {
      firstName: "Rachel",
      lastName: "Greene",
      address: "48 Rosewood Lane",
      city: "Austin",
      state: "TX",
      zip: "73301",
      country: "United States",
      phone: "+1 555 010 2233",
    },
    paymentMethod: "Mastercard ending 8841",
    deliveryMethod: "Standard (5-7 days)",
    status: "processing",
    createdAt: "2026-02-10T09:15:00Z",
    estimatedDelivery: "2026-02-16T00:00:00Z",
    tracking: {
      carrier: "NovaExpress",
      trackingNumber: "NX-9117-2290",
      events: [
        {
          date: "2026-02-10T09:20:00Z",
          label: "Order confirmed",
          location: "Online",
        },
        {
          date: "2026-02-11T14:00:00Z",
          label: "Being prepared",
          location: "Austin, TX",
        },
      ],
    },
  },
];

export function getOrderByNumber(number: string) {
  return sampleOrders.find((o) => o.number === number);
}
