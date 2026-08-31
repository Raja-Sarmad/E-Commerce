export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  icon?: string;
  count: number;
  featured?: boolean;
};

export type Review = {
  id: string;
  userId: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  totalSold?: number;
  stock: number;
  sku: string;
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isTrending: boolean;
  onSale: boolean;
  discountPercent: number;
  colors: string[];
  sizes?: string[];
  position: number;
  createdAt: string;
  reviews: Review[];
};

export type Coupon = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minSpend: number;
  maxDiscount?: number;
  expiresAt: string;
  active: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
  color?: string;
  size?: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type Address = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  number: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  deliveryMethod: string;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  tracking?: {
    carrier: string;
    trackingNumber: string;
    events: { date: string; label: string; location: string }[];
  };
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: Address;
  role: "customer" | "admin";
  joinedAt: string;
  ordersCount: number;
  totalSpent: number;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  coverImage: string;
  category: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: number;
  tags: string[];
  featured?: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  content: string;
};

export type Brand = {
  id: string;
  name: string;
  logo: string;
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};
