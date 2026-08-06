import type { Address, BlogPost, Coupon, Order, Product, Review, User } from "../types";

/* ─────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────── */

export type NotificationType =
  | "order"
  | "review"
  | "customer"
  | "stock"
  | "system";

export type AdminNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
};

export type Activity = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: "create" | "update" | "delete" | "status" | "login";
};

export type Vendor = {
  id: string;
  name: string;
  logo: string;
  email: string;
  phone: string;
  productsCount: number;
  totalEarnings: number;
  pendingPayout: number;
  rating: number;
  verified: boolean;
  joinedAt: string;
  status: "active" | "pending" | "suspended";
  banner?: string;
  description: string;
};

export type ShippingZone = {
  id: string;
  name: string;
  regions: string;
  baseRate: number;
  freeAbove: number;
  methods: string[];
  active: boolean;
};

export type Transaction = {
  id: string;
  reference: string;
  orderNumber: string;
  customer: string;
  amount: number;
  fee: number;
  method: string;
  status: "succeeded" | "pending" | "failed" | "refunded";
  date: string;
};

export type BlogPostStatus = "published" | "draft" | "scheduled";

export type AdminBlogPost = BlogPost & {
  status: BlogPostStatus;
  views: number;
  scheduledAt?: string;
};

export type Banner = {
  id: string;
  title: string;
  position: "hero" | "promo" | "homepage" | "offer";
  image: string;
  link?: string;
  startsAt?: string;
  endsAt?: string;
  active: boolean;
  views: number;
  clicks: number;
};

export type Subscriber = {
  id: string;
  email: string;
  name: string;
  subscribedAt: string;
  status: "active" | "unsubscribed";
  source: string;
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  description: string;
  category: string;
  updatedAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: "unread" | "read" | "archived";
  starred: boolean;
};

export type AdminFaq = {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  members: number;
  color: string;
  permissions: Record<string, string[]>;
};

export type MediaFile = {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "document";
  size: string;
  folder: string;
  uploadedAt: string;
};

export type LogEntry = {
  id: string;
  type: "login" | "activity" | "error" | "audit";
  user: string;
  action: string;
  details: string;
  ip: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
};

export type InventoryEntry = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  previous: number;
  adjustment: number;
  current: number;
  reason: string;
  user: string;
  date: string;
};

export type PaymentMethodConfig = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
  settings: Record<string, string>;
};

export type VendorProduct = {
  id: string;
  vendorId: string;
  productId: string;
  name: string;
  price: number;
  commissionRate: number;
  sold: number;
  status: "active" | "pending" | "rejected";
};

/* ─────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────── */

export function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)
    .toString(36)
    .padStart(4, "0")}`;
}

function timeAgoLabel(days = 0, hours = 0): string {
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "just now";
}

/* ─────────────────────────────────────────────────────────────
   Notifications & Activity
────────────────────────────────────────────────────────────── */

export const notifications: AdminNotification[] = [
  {
    id: "nt-001",
    type: "order",
    title: "New order received",
    message: "Order NM-100482 was placed by Rachel Greene.",
    time: timeAgoLabel(0, 12),
    read: false,
    link: "/admin/orders",
  },
  {
    id: "nt-002",
    type: "stock",
    title: "Low stock alert",
    message: "Only 3 units left of Aurora Wireless Headphones Pro.",
    time: timeAgoLabel(0, 5),
    read: false,
    link: "/admin/inventory",
  },
  {
    id: "nt-003",
    type: "review",
    title: "New 5-star review",
    message: "Elena V. reviewed 'Pulse Fit Smartwatch'.",
    time: timeAgoLabel(1),
    read: false,
    link: "/admin/reviews",
  },
  {
    id: "nt-004",
    type: "customer",
    title: "New customer registered",
    message: "Marcus Chen created an account.",
    time: timeAgoLabel(1),
    read: true,
    link: "/admin/customers",
  },
  {
    id: "nt-005",
    type: "system",
    title: "Backup completed",
    message: "Nightly database backup finished successfully.",
    time: timeAgoLabel(2),
    read: true,
  },
  {
    id: "nt-006",
    type: "order",
    title: "Refund requested",
    message: "Customer requested a refund for order NM-100501.",
    time: timeAgoLabel(2),
    read: true,
    link: "/admin/orders",
  },
];

export const activities: Activity[] = [
  { id: "ac-001", actor: "Admin", action: "updated", target: "Product #PRD-1024", time: timeAgoLabel(0, 4), type: "update" },
  { id: "ac-002", actor: "System", action: "created", target: "Coupon WELCOME10", time: timeAgoLabel(0, 6), type: "create" },
  { id: "ac-003", actor: "Staff", action: "changed status", target: "Order NM-100482 → shipped", time: timeAgoLabel(1), type: "status" },
  { id: "ac-004", actor: "Admin", action: "approved", target: "Vendor 'Acme Audio'", time: timeAgoLabel(1), type: "status" },
  { id: "ac-005", actor: "System", action: "removed", target: "Media file 'old-banner.png'", time: timeAgoLabel(1, 5), type: "delete" },
  { id: "ac-006", actor: "Editor", action: "published", target: "Blog post 'Skincare Routine 101'", time: timeAgoLabel(2), type: "create" },
  { id: "ac-007", actor: "Staff", action: "signed in", target: "from 192.168.1.10", time: timeAgoLabel(2), type: "login" },
];

/* ─────────────────────────────────────────────────────────────
   Vendors
────────────────────────────────────────────────────────────── */

export const vendors: Vendor[] = [
  { id: "vd-001", name: "Acme Audio", logo: "https://picsum.photos/seed/vd-acme/80/80", email: "hello@acmeaudio.com", phone: "+1 555 010 2001", productsCount: 24, totalEarnings: 48210, pendingPayout: 3200, rating: 4.8, verified: true, joinedAt: "2023-06-14", status: "active", description: "Premium audio equipment and accessories." },
  { id: "vd-002", name: "Lumen Home", logo: "https://picsum.photos/seed/vd-lumen/80/80", email: "sales@lumenhome.co", phone: "+1 555 010 2002", productsCount: 38, totalEarnings: 61340, pendingPayout: 5400, rating: 4.6, verified: true, joinedAt: "2023-09-02", status: "active", description: "Modern home & living essentials." },
  { id: "vd-003", name: "PureSkin Co.", logo: "https://picsum.photos/seed/vd-pureskin/80/80", email: "care@pureskin.co", phone: "+1 555 010 2003", productsCount: 15, totalEarnings: 28750, pendingPayout: 980, rating: 4.9, verified: true, joinedAt: "2024-01-18", status: "active", description: "Clean beauty and skincare products." },
  { id: "vd-004", name: "Vertex Sports", logo: "https://picsum.photos/seed/vd-vertex/80/80", email: "team@vertexsports.io", phone: "+1 555 010 2004", productsCount: 11, totalEarnings: 15320, pendingPayout: 0, rating: 4.2, verified: false, joinedAt: "2025-05-27", status: "pending", description: "Performance sports and outdoors gear." },
  { id: "vd-005", name: "PlayNest", logo: "https://picsum.photos/seed/vd-playnest/80/80", email: "info@playnest.kids", phone: "+1 555 010 2005", productsCount: 9, totalEarnings: 8410, pendingPayout: 1250, rating: 4.4, verified: true, joinedAt: "2024-11-09", status: "active", description: "Toys and games for curious kids." },
  { id: "vd-006", name: "ChronoWatch", logo: "https://picsum.photos/seed/vd-chrono/80/80", email: "support@chronowatch.com", phone: "+1 555 010 2006", productsCount: 7, totalEarnings: 0, pendingPayout: 0, rating: 0, verified: false, joinedAt: "2026-02-21", status: "suspended", description: "Handcrafted timepieces." },
];

export const vendorProducts: VendorProduct[] = [
  { id: "vp-001", vendorId: "vd-001", productId: "PRD-1024", name: "Aurora Wireless Headphones Pro", price: 249.0, commissionRate: 12, sold: 342, status: "active" },
  { id: "vp-002", vendorId: "vd-001", productId: "PRD-1025", name: "Pulse Fit Smartwatch", price: 199.0, commissionRate: 12, sold: 518, status: "active" },
  { id: "vp-003", vendorId: "vd-002", productId: "PRD-1030", name: "Cloud Drift Mattress Topper", price: 129.0, commissionRate: 10, sold: 96, status: "active" },
  { id: "vp-004", vendorId: "vd-003", productId: "PRD-1040", name: "Glow Ritual Serum Set", price: 89.0, commissionRate: 15, sold: 421, status: "active" },
  { id: "vp-005", vendorId: "vd-004", productId: "PRD-1050", name: "Trail Blaze Running Shoes", price: 119.0, commissionRate: 12, sold: 0, status: "pending" },
];

/* ─────────────────────────────────────────────────────────────
   Shipping
────────────────────────────────────────────────────────────── */

export const shippingZones: ShippingZone[] = [
  { id: "sz-001", name: "United States", regions: "Continental US", baseRate: 12, freeAbove: 100, methods: ["Standard", "Express", "Next Day"], active: true },
  { id: "sz-002", name: "Canada", regions: "All provinces", baseRate: 18, freeAbove: 150, methods: ["Standard", "Express"], active: true },
  { id: "sz-003", name: "Europe", regions: "EU member states", baseRate: 24, freeAbove: 200, methods: ["Standard"], active: true },
  { id: "sz-004", name: "United Kingdom", regions: "England, Scotland, Wales", baseRate: 16, freeAbove: 120, methods: ["Standard", "Express"], active: true },
  { id: "sz-005", name: "Australia", regions: "All states", baseRate: 28, freeAbove: 250, methods: ["Standard", "Express"], active: false },
];

export const shippingMethods = [
  { id: "sm-001", name: "Standard", zone: "US", price: 12, eta: "5–7 business days", active: true },
  { id: "sm-002", name: "Express", zone: "US", price: 24, eta: "2–3 business days", active: true },
  { id: "sm-003", name: "Next Day", zone: "US", price: 39, eta: "1 business day", active: true },
  { id: "sm-004", name: "Free (over $100)", zone: "US", price: 0, eta: "5–7 business days", active: true },
];

/* ─────────────────────────────────────────────────────────────
   Payments
────────────────────────────────────────────────────────────── */

export const paymentMethods: PaymentMethodConfig[] = [
  { id: "pm-001", name: "Stripe", description: "Credit & debit card processing", enabled: true, icon: "stripe", settings: { publishableKey: "pk_test_…", secretKey: "sk_test_…", webhookSecret: "whsec_…" } },
  { id: "pm-002", name: "PayPal", description: "PayPal balance & linked cards", enabled: true, icon: "paypal", settings: { clientId: "AaB…", clientSecret: "…" } },
  { id: "pm-003", name: "Cash on Delivery", description: "Collect payment at delivery", enabled: true, icon: "cod", settings: { enabledRegions: "US, CA" } },
  { id: "pm-004", name: "Apple Pay", description: "One-tap checkout on Apple devices", enabled: false, icon: "applepay", settings: {} },
  { id: "pm-005", name: "Google Pay", description: "One-tap checkout on Android", enabled: false, icon: "googlepay", settings: {} },
];

const transactionSeeds: [string, string, string, number, "succeeded" | "pending" | "failed" | "refunded"][] = [
  ["tx-001", "TXN-88213", "NM-100482", 432.9, "succeeded"],
  ["tx-002", "TXN-88197", "NM-100490", 89.5, "succeeded"],
  ["tx-003", "TXN-88188", "NM-100501", 245.0, "refunded"],
  ["tx-004", "TXN-88171", "NM-100515", 1290.4, "succeeded"],
  ["tx-005", "TXN-88166", "NM-100522", 64.99, "pending"],
  ["tx-006", "TXN-88159", "NM-100534", 318.75, "failed"],
  ["tx-007", "TXN-88144", "NM-100540", 512.2, "succeeded"],
  ["tx-008", "TXN-88132", "NM-100549", 148.0, "succeeded"],
];

export const transactions: Transaction[] = transactionSeeds.map(
  ([id, reference, orderNumber, amount, status], i) => ({
    id,
    reference,
    orderNumber,
    customer: ["Rachel Greene", "James Carter", "Sofia Marchetti", "Aisha Khan", "Noah Williams", "Emma Brown", "Liam Garcia", "Olivia Davis"][i],
    amount,
    fee: Math.round(amount * 0.029 * 100) / 100 + 0.3,
    method: i % 2 === 0 ? "Card" : "PayPal",
    status,
    date: `2026-07-${String(28 - i).padStart(2, "0")}T14:${String(10 + i).padStart(2, "0")}:00Z`,
  })
);

/* ─────────────────────────────────────────────────────────────
   Blog
────────────────────────────────────────────────────────────── */

const statuses: BlogPostStatus[] = ["published", "published", "draft", "published", "scheduled", "published"];

export const adminBlogPosts: AdminBlogPost[] = [
  { id: "bl-001", slug: "how-to-choose-the-perfect-wireless-headphones", title: "How to Choose the Perfect Wireless Headphones in 2026", excerpt: "From noise cancellation to battery life, here's everything you need to know before buying your next pair of headphones.", content: ["Wireless headphones have come a long way.", "Battery life matters more than most people think.", "Sound quality is subjective."], coverImage: "https://picsum.photos/seed/blog-1/900/520", category: "Buying Guides", author: "Elena Vasquez", authorAvatar: "https://picsum.photos/seed/blog-author-1/40/40", date: "2026-01-28T10:00:00Z", readTime: 6, tags: ["audio", "headphones"], featured: true, status: "published", views: 12480 },
  { id: "bl-002", slug: "skincare-routine-101-build-your-routine-in-5-steps", title: "Skincare Routine 101: Build Your Routine in 5 Steps", excerpt: "Cleanser, serum, moisturizer, SPF — demystify the modern skincare routine with this beginner-friendly guide.", content: ["A great skincare routine doesn't need ten products.", "Step one is cleansing.", "Step four is SPF."], coverImage: "https://picsum.photos/seed/blog-2/900/520", category: "Beauty & Care", author: "Sofia Marchetti", authorAvatar: "https://picsum.photos/seed/blog-author-2/40/40", date: "2026-01-20T10:00:00Z", readTime: 5, tags: ["skincare", "beauty"], featured: true, status: "published", views: 9804 },
  { id: "bl-003", slug: "smart-home-essentials-every-budget", title: "Smart Home Essentials for Every Budget", excerpt: "Build a smart home without breaking the bank. Our editors pick the best-value devices.", content: ["Smart home tech is more affordable than ever.", "Start with a smart speaker.", "Automate your lighting."], coverImage: "https://picsum.photos/seed/blog-3/900/520", category: "Home & Living", author: "David Kim", authorAvatar: "https://picsum.photos/seed/blog-author-3/40/40", date: "2026-01-12T10:00:00Z", readTime: 7, tags: ["smart-home", "tech"], featured: false, status: "draft", views: 0 },
  { id: "bl-004", slug: "10-wardrobe-staples-every-closet-needs", title: "10 Wardrobe Staples Every Closet Needs", excerpt: "Timeless pieces that make getting dressed effortless — and keep you stylish all year round.", content: ["Build around basics.", "Invest in quality denim.", "Layer with neutrals."], coverImage: "https://picsum.photos/seed/blog-4/900/520", category: "Fashion", author: "Nina Rossi", authorAvatar: "https://picsum.photos/seed/blog-author-4/40/40", date: "2026-01-05T10:00:00Z", readTime: 4, tags: ["fashion", "wardrobe"], featured: false, status: "published", views: 6521 },
  { id: "bl-005", slug: "fitness-trackers-compared-2026", title: "Fitness Trackers Compared: 2026 Edition", excerpt: "We tested 12 fitness trackers side by side. Here are the ones actually worth your money.", content: ["Accuracy matters most.", "Battery life differs wildly.", "Our overall winner."], coverImage: "https://picsum.photos/seed/blog-5/900/520", category: "Sports & Outdoors", author: "Chris Park", authorAvatar: "https://picsum.photos/seed/blog-author-5/40/40", date: "2026-06-15T10:00:00Z", readTime: 8, tags: ["fitness", "wearables"], featured: false, status: "scheduled", views: 0, scheduledAt: "2026-08-20T09:00:00Z" },
  { id: "bl-006", slug: "gift-guide-summer-2026", title: "The Ultimate Summer Gift Guide", excerpt: "From sun-smart tech to cozy essentials — 20 gifts they'll actually use this summer.", content: ["Gifts for the outdoorsy type.", "Gifts for the homebody.", "Gifts for the techie."], coverImage: "https://picsum.photos/seed/blog-6/900/520", category: "Lifestyle", author: "Elena Vasquez", authorAvatar: "https://picsum.photos/seed/blog-author-1/40/40", date: "2026-07-01T10:00:00Z", readTime: 6, tags: ["gift-guide", "summer"], featured: false, status: "published", views: 4310 },
];

export const blogCategories = ["Buying Guides", "Beauty & Care", "Home & Living", "Fashion", "Sports & Outdoors", "Lifestyle"];

/* ─────────────────────────────────────────────────────────────
   Banners
────────────────────────────────────────────────────────────── */

export const banners: Banner[] = [
  { id: "bn-001", title: "Summer Tech Sale", position: "hero", image: "https://picsum.photos/seed/bn-hero/1200/500", link: "/shop?category=electronics", active: true, views: 28400, clicks: 3410 },
  { id: "bn-002", title: "Free Shipping Over $100", position: "promo", image: "https://picsum.photos/seed/bn-promo/800/400", link: "/shop", active: true, views: 19200, clicks: 1022 },
  { id: "bn-003", title: "Home Refresh Collection", position: "homepage", image: "https://picsum.photos/seed/bn-home/900/400", link: "/shop?category=home-living", active: true, views: 15400, clicks: 876 },
  { id: "bn-004", title: "50% Off Sitewide — This Week Only", position: "offer", image: "https://picsum.photos/seed/bn-offer/900/400", link: "/shop", active: false, views: 0, clicks: 0 },
  { id: "bn-005", title: "New Season, New Gear", position: "homepage", image: "https://picsum.photos/seed/bn-season/900/400", link: "/shop?category=sports-outdoors", active: false, views: 8700, clicks: 412 },
];

/* ─────────────────────────────────────────────────────────────
   Newsletter
────────────────────────────────────────────────────────────── */

const subscriberNames = ["Rachel Greene", "James Carter", "Sofia Marchetti", "Aisha Khan", "Noah Williams", "Emma Brown", "Liam Garcia", "Olivia Davis", "Mason Lee", "Ava Thompson"];
const domains = ["gmail.com", "outlook.com", "yahoo.com", "icloud.com", "protonmail.com"];

export const subscribers: Subscriber[] = subscriberNames.map((name, i) => ({
  id: `sub-${String(i + 1).padStart(3, "0")}`,
  email: `${name.toLowerCase().split(" ")[0]}.${name.toLowerCase().split(" ")[1]}@${domains[i % domains.length]}`,
  name,
  subscribedAt: `2026-0${(i % 7) + 1}-${String(12 + i).padStart(2, "0")}T09:00:00Z`,
  status: i === 3 ? "unsubscribed" : "active",
  source: ["Checkout", "Landing page", "Blog", "Footer form", "Popup"][i % 5],
}));

export const emailTemplates: EmailTemplate[] = [
  { id: "et-001", name: "Welcome Email", subject: "Welcome to NovaMart 🎉", description: "Sent immediately after a new account is created.", category: "Transactional", updatedAt: "2026-05-02" },
  { id: "et-002", name: "Order Confirmation", subject: "Your order is confirmed", description: "Confirms order details right after purchase.", category: "Transactional", updatedAt: "2026-04-18" },
  { id: "et-003", name: "Shipping Update", subject: "Your order has shipped", description: "Includes tracking link and delivery estimate.", category: "Transactional", updatedAt: "2026-04-10" },
  { id: "et-004", name: "Abandoned Cart", subject: "You left something behind", description: "Win-back email for abandoned carts.", category: "Marketing", updatedAt: "2026-03-22" },
  { id: "et-005", name: "Weekly Newsletter", subject: "This week at NovaMart", description: "Curated products and stories, sent weekly.", category: "Marketing", updatedAt: "2026-07-01" },
];

/* ─────────────────────────────────────────────────────────────
   Contact messages & FAQ
────────────────────────────────────────────────────────────── */

export const contactMessages: ContactMessage[] = [
  { id: "cm-001", name: "Rachel Greene", email: "rachel@novamart.com", subject: "Where is my order?", message: "I placed order NM-100482 five days ago and haven't received a tracking update yet. Can you check the status?", date: "2026-07-30T10:24:00Z", status: "unread", starred: true },
  { id: "cm-002", name: "Marcus Chen", email: "marcus@example.com", subject: "Return request", message: "The smartwatch I bought arrived with a scratch on the screen. I'd like to initiate a return.", date: "2026-07-30T09:10:00Z", status: "unread", starred: false },
  { id: "cm-003", name: "Sofia Marchetti", email: "sofia@example.com", subject: "Coupon not working", message: "I tried using code FLAT25 but it says invalid. Could you help?", date: "2026-07-29T16:45:00Z", status: "read", starred: true },
  { id: "cm-004", name: "Noah Williams", email: "noah@example.com", subject: "Partnership inquiry", message: "We run a fitness brand and would love to discuss becoming a vendor on NovaMart.", date: "2026-07-29T11:30:00Z", status: "read", starred: false },
  { id: "cm-005", name: "Emma Brown", email: "emma@example.com", subject: "Shipping costs", message: "Why is shipping to Hawaii so expensive? Is there a better option?", date: "2026-07-28T14:20:00Z", status: "archived", starred: false },
];

export const adminFaqs: AdminFaq[] = [
  { id: "fq-001", category: "Orders & Shipping", question: "How long does shipping take?", answer: "Standard shipping takes 2–4 business days for most orders.", order: 1, active: true },
  { id: "fq-002", category: "Orders & Shipping", question: "How much does shipping cost?", answer: "Shipping is free on orders over $100. Otherwise a flat rate of $12 applies.", order: 2, active: true },
  { id: "fq-003", category: "Returns & Refunds", question: "What is your return policy?", answer: "We offer a 30-day return window on most items in original condition.", order: 1, active: true },
  { id: "fq-004", category: "Returns & Refunds", question: "When will I get my refund?", answer: "Refunds are processed within 2–3 business days of receiving the return.", order: 2, active: true },
  { id: "fq-005", category: "Payments", question: "What payment methods do you accept?", answer: "All major cards, PayPal, Apple Pay, Google Pay, and Shop Pay.", order: 1, active: true },
  { id: "fq-006", category: "Payments", question: "Is it safe to shop on NovaMart?", answer: "Yes. Checkout is PCI-DSS compliant with 256-bit encryption.", order: 2, active: false },
];

export const faqCategories = ["Orders & Shipping", "Returns & Refunds", "Payments", "Account", "Products"];

/* ─────────────────────────────────────────────────────────────
   Roles & Permissions
────────────────────────────────────────────────────────────── */

const modules = ["Dashboard", "Products", "Orders", "Customers", "Reviews", "Coupons", "Inventory", "Blog", "Reports", "Settings"];
const perms = ["view", "create", "update", "delete"];

export const roles: Role[] = [
  { id: "rl-001", name: "Super Admin", description: "Unrestricted access to all modules and settings.", members: 1, color: "primary", permissions: Object.fromEntries(modules.map((m) => [m, perms])) },
  { id: "rl-002", name: "Admin", description: "Full access except security & billing settings.", members: 2, color: "accent", permissions: Object.fromEntries(modules.map((m) => [m, m === "Settings" ? ["view", "update"] : perms])) },
  { id: "rl-003", name: "Manager", description: "Manage catalog, orders, and customer support.", members: 4, color: "info", permissions: Object.fromEntries(modules.map((m) => [m, ["view", m === "Orders" || m === "Products" ? "update" : ""].filter(Boolean)])) },
  { id: "rl-004", name: "Staff", description: "Process orders and answer support tickets.", members: 6, color: "warning", permissions: Object.fromEntries(modules.map((m) => [m, m === "Orders" ? ["view", "update"] : ["view"]])) },
  { id: "rl-005", name: "Editor", description: "Manage blog, banners, and content.", members: 3, color: "success", permissions: Object.fromEntries(modules.map((m) => [m, m === "Blog" ? perms : ["view"]])) },
  { id: "rl-006", name: "Customer Support", description: "Access to orders, customers, and messages only.", members: 5, color: "secondary", permissions: Object.fromEntries(modules.map((m) => [m, m === "Orders" || m === "Customers" ? ["view", "update"] : ["view"]])) },
];

/* ─────────────────────────────────────────────────────────────
   Media library
────────────────────────────────────────────────────────────── */

const mediaFolders = ["Products", "Banners", "Blog", "Brands", "Categories", "Newsletter", "Other"];

export const mediaFoldersList = mediaFolders.map((folder, i) => ({
  id: `mf-${i + 1}`,
  name: folder,
  files: 18 + i * 7,
  size: `${(4 + i * 3).toFixed(1)} GB`,
}));

export const mediaFiles: MediaFile[] = Array.from({ length: 24 }, (_, i) => {
  const type: MediaFile["type"] = i % 9 === 0 ? "video" : i % 7 === 0 ? "document" : "image";
  const ext = type === "video" ? "mp4" : type === "document" ? "pdf" : i % 2 ? "png" : "jpg";
  return {
    id: `mf-${String(i + 1).padStart(3, "0")}`,
    name: type === "document" ? `spec-sheet-${i + 1}.${ext}` : `${["product", "banner", "blog", "brand"][i % 4]}-${String(i + 1).padStart(2, "0")}.${ext}`,
    url: `https://picsum.photos/seed/media-${i}/600/600`,
    type,
    size: type === "video" ? `${(30 + i * 4).toFixed(0)} MB` : type === "document" ? `${(i % 9) + 1}00 KB` : `${(120 + i * 33).toFixed(0)} KB`,
    folder: mediaFolders[i % mediaFolders.length],
    uploadedAt: `2026-07-${String(30 - (i % 28)).padStart(2, "0")}T1${i % 9}:00:00Z`,
  };
});

/* ─────────────────────────────────────────────────────────────
   Logs
────────────────────────────────────────────────────────────── */

const logUsers = ["admin@novamart.com", "staff@novamart.com", "editor@novamart.com", "manager@novamart.com"];
const logActions = {
  login: ["Signed in", "Signed in", "Failed sign-in attempt"],
  activity: ["Updated product", "Changed order status", "Created coupon", "Deleted media file", "Published blog post"],
  error: ["Stripe webhook error", "Image optimization timeout", "Database query timeout", "Email delivery failed"],
  audit: ["Updated role permissions", "Modified tax rate", "Exported customer list", "Changed payout schedule"],
};

export const logs: LogEntry[] = Array.from({ length: 28 }, (_, i) => {
  const typePool: LogEntry["type"][] = ["login", "login", "activity", "activity", "error", "audit"];
  const type = typePool[i % 6];
  const user = logUsers[i % logUsers.length];
  const actionPool = logActions[type];
  const action = actionPool[i % actionPool.length];
  return {
    id: `lg-${String(i + 1).padStart(3, "0")}`,
    type,
    user,
    action,
    details: action.includes("error") ? "Exception details logged for review." : "No additional details.",
    ip: `192.168.1.${10 + (i % 200)}`,
    timestamp: `2026-07-${String(30 - (i % 28)).padStart(2, "0")}T${String(8 + (i % 12)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00Z`,
    level: type === "error" ? "error" : type === "login" && action.includes("Failed") ? "warning" : i % 4 === 0 ? "info" : "success",
  };
});

/* ─────────────────────────────────────────────────────────────
   Inventory history
────────────────────────────────────────────────────────────── */

export const inventoryHistory: InventoryEntry[] = [
  { id: "ih-001", productId: "PRD-1024", productName: "Aurora Wireless Headphones Pro", sku: "AUR-HDP-PRO-BLK", previous: 24, adjustment: -6, current: 18, reason: "Order #NM-100534", user: "System", date: "2026-07-30T15:12:00Z" },
  { id: "ih-002", productId: "PRD-1025", productName: "Pulse Fit Smartwatch", sku: "PLS-FIT-42-SLV", previous: 8, adjustment: 30, current: 38, reason: "Restock (purchase order #PO-2204)", user: "admin@novamart.com", date: "2026-07-29T10:00:00Z" },
  { id: "ih-003", productId: "PRD-1030", productName: "Cloud Drift Mattress Topper", sku: "CLD-DRIFT-QN", previous: 15, adjustment: -3, current: 12, reason: "Order #NM-100522", user: "System", date: "2026-07-28T09:44:00Z" },
  { id: "ih-004", productId: "PRD-1040", productName: "Glow Ritual Serum Set", sku: "GLW-RIT-30ML", previous: 0, adjustment: 50, current: 50, reason: "Initial stock", user: "manager@novamart.com", date: "2026-07-26T13:30:00Z" },
  { id: "ih-005", productId: "PRD-1050", productName: "Trail Blaze Running Shoes", sku: "TRL-BLZ-10", previous: 20, adjustment: -2, current: 18, reason: "Damaged inventory write-off", user: "staff@novamart.com", date: "2026-07-24T11:05:00Z" },
];

/* ─────────────────────────────────────────────────────────────
   Customer extras
────────────────────────────────────────────────────────────── */

export type CustomerExtras = {
  loyaltyPoints: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  notes: string;
  status: "active" | "blocked";
  cartHistory: { id: string; date: string; items: number; total: number; converted: boolean }[];
};

export const customerExtras: Record<string, CustomerExtras> = {
  "us-cust-1": {
    loyaltyPoints: 1240,
    tier: "Gold",
    notes: "VIP customer since 2024. Prefers next-day delivery.",
    status: "active",
    cartHistory: [
      { id: "ch-01", date: "2026-07-28", items: 3, total: 432.9, converted: true },
      { id: "ch-02", date: "2026-07-15", items: 1, total: 89.5, converted: true },
      { id: "ch-03", date: "2026-06-30", items: 5, total: 618.2, converted: false },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────
   Coupons extra
────────────────────────────────────────────────────────────── */

export const couponUsage: Record<string, { used: number; limit: number; revenue: number }> = {
  WELCOME10: { used: 342, limit: 1000, revenue: 18900 },
  SAVE20: { used: 128, limit: 500, revenue: 15400 },
  FLAT25: { used: 87, limit: 300, revenue: 9800 },
  FREESHIP: { used: 512, limit: 2000, revenue: 0 },
  MEGA50: { used: 0, limit: 50, revenue: 0 },
};

/* ─────────────────────────────────────────────────────────────
   Derived helpers
────────────────────────────────────────────────────────────── */

export function getVendorById(id: string) {
  return vendors.find((v) => v.id === id);
}

export function getVendorProducts(vendorId: string) {
  return vendorProducts.filter((vp) => vp.vendorId === vendorId);
}

export function getProductReviews(product: Product): Review[] {
  return product.reviews;
}

export function buildRevenueSeries(orders: Order[]) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const byMonth = new Map<string, number>();
  orders.forEach((o) => {
    const month = new Date(o.createdAt).getMonth();
    byMonth.set(months[month], (byMonth.get(months[month]) ?? 0) + o.total);
  });
  return months.map((month) => ({ label: month, value: byMonth.get(month) ?? 0 }));
}

export const statusToBadge: Record<string, "success" | "warning" | "info" | "destructive" | "outline"> = {
  active: "success",
  delivered: "success",
  published: "success",
  completed: "success",
  succeeded: "success",
  verified: "success",
  pending: "warning",
  processing: "info",
  shipped: "info",
  scheduled: "info",
  refunded: "info",
  draft: "outline",
  read: "info",
  unread: "warning",
  cancelled: "destructive",
  failed: "destructive",
  suspended: "destructive",
  blocked: "destructive",
  out: "destructive",
  low: "warning",
};
