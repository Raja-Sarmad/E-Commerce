import type { Product, Review } from "@/lib/types";
import { calculateDiscount, slugify } from "@/lib/utils";

function img(seed: string, size = 700) {
  return `https://picsum.photos/seed/${seed}/${size}/${size}`;
}

const reviewBodies = [
  "Absolutely love this product! The quality exceeded my expectations and it arrived ahead of schedule.",
  "Great value for money. Been using it for two weeks now and it works flawlessly.",
  "Solid build quality and exactly as described. Shipping was fast and packaging was secure.",
  "Very impressed. The design is sleek and it performs better than my previous one.",
  "Good product overall, though I wish the manual was a bit more detailed. Would recommend.",
  "Five stars! Customer support was super helpful when I had a question before ordering.",
  "Premium feel and modern look. It's become my daily go-to. Money well spent.",
  "Works exactly as advertised. Battery life is great and setup took under a minute.",
];

const reviewTitles = [
  "Exceeded my expectations",
  "Fantastic quality",
  "Exactly as described",
  "Worth every penny",
  "Highly recommended",
  "Great purchase",
  "Better than expected",
  "Perfect choice",
];

const reviewNames = [
  "Sarah Mitchell",
  "James Carter",
  "Emily Rodriguez",
  "Daniel Kim",
  "Olivia Bennett",
  "Marcus Johnson",
  "Ava Thompson",
  "Liam Patel",
];

type ProductSpec = {
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  sku: string;
  tags: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  onSale?: boolean;
  colors: string[];
  sizes?: string[];
  createdAt: string;
};

const spec: ProductSpec[] = [
  {
    name: "Aurora Wireless Headphones Pro",
    brand: "Sonix",
    category: "Electronics",
    categorySlug: "electronics",
    description:
      "Immerse yourself in studio-quality sound with active noise cancellation, adaptive EQ, and a luxurious 40-hour battery life. The Aurora Pro pairs instantly, charges fast, and feels feather-light on long listening sessions.",
    features: [
      "Active Noise Cancellation (ANC) with transparency mode",
      "40-hour battery life with quick-charge support",
      "Adaptive EQ tuned by Grammy-winning engineers",
      "Bluetooth 5.4 with multipoint pairing",
      "Spatial audio with dynamic head tracking",
      "Cushioned memory-foam ear pads",
    ],
    specifications: {
      Driver: "40mm dynamic",
      "Battery Life": "40 hours (ANC on)",
      "Charging": "USB-C, 10 min = 5 hours",
      Connectivity: "Bluetooth 5.4 / 3.5mm",
      Weight: "254g",
      "Noise Cancellation": "Up to 45dB",
      Warranty: "2 years",
    },
    price: 199,
    compareAtPrice: 249,
    rating: 4.8,
    reviewsCount: 1284,
    stock: 46,
    sku: "SNX-HDP-001",
    tags: ["wireless", "audio", "noise-cancelling"],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    onSale: true,
    colors: ["#1e293b", "#f8fafc", "#8b5cf6"],
    createdAt: "2025-11-20T10:00:00Z",
  },
  {
    name: "Pulse Smartwatch Series X",
    brand: "TechOne",
    category: "Electronics",
    categorySlug: "electronics",
    description:
      "Track every heartbeat, step, and sleep cycle with the Pulse Series X. Featuring a vivid AMOLED display, GPS, 100+ workout modes, and week-long battery life in a premium titanium frame.",
    features: [
      "1.4-inch AMOLED always-on display",
      "Built-in GPS, heart-rate and SpO2 sensors",
      "100+ workout modes with auto-detection",
      "7-day battery life",
      "5ATM + IP68 water resistance",
      "Blood-oxygen, stress, and sleep tracking",
    ],
    specifications: {
      Display: "1.4\" AMOLED, 466x466",
      Battery: "Up to 7 days",
      Sensors: "HR, SpO2, GPS, compass",
      "Water Resistance": "5ATM / IP68",
      Compatibility: "iOS 15+ / Android 10+",
      Weight: "38g",
      Warranty: "2 years",
    },
    price: 249,
    compareAtPrice: 299,
    rating: 4.7,
    reviewsCount: 865,
    stock: 32,
    sku: "TEO-SW-002",
    tags: ["wearable", "fitness", "smartwatch"],
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    isTrending: true,
    onSale: true,
    colors: ["#111827", "#f59e0b", "#dc2626"],
    createdAt: "2026-01-05T10:00:00Z",
  },
  {
    name: "Vuebook Air 14 Ultrabook",
    brand: "Vortex",
    category: "Electronics",
    categorySlug: "electronics",
    description:
      "A 2.7 lb featherweight powerhouse with a stunning 2.8K OLED display, 28-hour battery, and next-gen silicon. The Vuebook Air is built for creators who refuse to compromise.",
    features: [
      "14-inch 2.8K OLED display, 100% DCI-P3",
      "Next-gen 10-core processor, 16GB RAM",
      "1TB NVMe SSD with blazing read speeds",
      "28-hour battery, 65W USB-C fast charge",
      "Backlit keyboard with fingerprint sensor",
      "Aluminum unibody, 2.7 lbs",
    ],
    specifications: {
      Display: "14\" OLED 2880x1800 90Hz",
      Processor: "10-core, 3.7GHz boost",
      Memory: "16GB LPDDR5X",
      Storage: "1TB NVMe SSD",
      Battery: "28 hours (video playback)",
      Weight: "2.7 lbs / 1.24 kg",
      Ports: "2x Thunderbolt 4, 1x USB-A, HDMI",
      Warranty: "3 years",
    },
    price: 1299,
    compareAtPrice: 1499,
    rating: 4.9,
    reviewsCount: 432,
    stock: 18,
    sku: "VTX-LP-003",
    tags: ["laptop", "ultrabook", "creator"],
    isFeatured: true,
    isNew: true,
    isTrending: true,
    onSale: true,
    colors: ["#334155", "#f8fafc"],
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    name: "Crystal 4K Action Camera",
    brand: "Lumina",
    category: "Electronics",
    categorySlug: "electronics",
    description:
      "Capture life in stunning 4K60 with hyper-smooth stabilization. Waterproof to 10m and rugged enough for any adventure, the Crystal is your pocket-sized cinematographer.",
    features: [
      "4K60 / 2.7K120 / 1080P240 video",
      "HyperSmooth electronic stabilization",
      "Waterproof to 10m without housing",
      "Dual screens with touch rear display",
      "170-degree ultra-wide lens",
      "Voice control + app remote",
    ],
    specifications: {
      Video: "4K60, 2.7K120, 1080P240",
      "Still Photos": "20MP",
      Stabilization: "HyperSmooth 5.0",
      "Water Resistance": "10m / IPX8",
      Battery: "2 hours 4K recording",
      Display: "2.27\" rear + 1.4\" front",
      Warranty: "1 year",
    },
    price: 349,
    compareAtPrice: 399,
    rating: 4.6,
    reviewsCount: 658,
    stock: 27,
    sku: "LMN-CAM-004",
    tags: ["camera", "action", "4k"],
    isBestSeller: true,
    onSale: true,
    colors: ["#0f172a", "#ffffff"],
    createdAt: "2025-10-12T10:00:00Z",
  },
  {
    name: "Echo Smart Speaker Mini",
    brand: "Sonix",
    category: "Electronics",
    categorySlug: "electronics",
    description:
      "Your voice-controlled assistant with room-filling sound, privacy built in, and multi-room audio support. The Echo Mini turns any room into a smart home hub.",
    features: [
      "360-degree immersive audio",
      "Voice assistant with far-field mics",
      "Controls 100,000+ smart devices",
      "Built-in Zigbee smart home hub",
      "Multi-room audio pairing",
      "Privacy shutter + mic-off button",
    ],
    specifications: {
      Audio: "2.5\" full-range driver",
      Connectivity: "Wi-Fi 6, Bluetooth 5.3, Zigbee",
      Microphones: "4x far-field",
      Power: "15W USB-C adapter",
      Dimensions: "3.9 x 3.5 in",
      Warranty: "1 year",
    },
    price: 89,
    rating: 4.5,
    reviewsCount: 2310,
    stock: 120,
    sku: "SNX-SPK-005",
    tags: ["smart-home", "audio", "assistant"],
    isBestSeller: true,
    colors: ["#94a3b8", "#111827", "#f8fafc"],
    createdAt: "2025-09-08T10:00:00Z",
  },
  {
    name: "Precision Mechanical Keyboard 75%",
    brand: "KeyForge",
    category: "Electronics",
    categorySlug: "electronics",
    description:
      "A machined aluminum 75% keyboard with hot-swappable silent switches, per-key RGB, and tri-mode connectivity. Typing has never felt this satisfying.",
    features: [
      "Machined aluminum top plate",
      "Hot-swappable mechanical switches",
      "Tri-mode: wired, 2.4GHz, Bluetooth",
      "Per-key RGB with 16.8M colors",
      "Gasket mount for soft, quiet typing",
      "4000mAh battery, 3-month life",
    ],
    specifications: {
      Layout: "75% (84 keys)",
      Switches: "Hot-swappable, linear/tactile",
      Connectivity: "USB-C / 2.4GHz / BT 5.1",
      Battery: "4000mAh",
      Keycaps: "Double-shot PBT",
      Weight: "1.1 kg",
      Warranty: "2 years",
    },
    price: 129,
    compareAtPrice: 159,
    rating: 4.7,
    reviewsCount: 342,
    stock: 55,
    sku: "KFG-KB-006",
    tags: ["keyboard", "gaming", "desk"],
    isNew: true,
    onSale: true,
    colors: ["#1e293b", "#f59e0b", "#8b5cf6"],
    createdAt: "2026-01-18T10:00:00Z",
  },
  {
    name: "Zenith Linen Shirt",
    brand: "Aura & Oak",
    category: "Fashion",
    categorySlug: "fashion",
    description:
      "Breathe easy in our signature relaxed linen shirt. Cut from European flax with a soft garment wash, it drapes beautifully and gets better with every wear.",
    features: [
      "100% European flax linen",
      "Relaxed fit with adjustable cuffs",
      "Mother-of-pearl buttons",
      "Garment-washed for softness",
      "Breathable for warm weather",
      "Sustainably sourced fabric",
    ],
    specifications: {
      Material: "100% European flax linen",
      Fit: "Relaxed",
      Collar: "Classic spread",
      Sleeves: "Long, adjustable cuff",
      Care: "Machine wash cold, line dry",
      Origin: "Portugal",
    },
    price: 68,
    compareAtPrice: 85,
    rating: 4.6,
    reviewsCount: 512,
    stock: 74,
    sku: "AOK-LNS-101",
    tags: ["linen", "shirt", "summer"],
    isFeatured: true,
    isBestSeller: true,
    onSale: true,
    colors: ["#d6cbb0", "#f8fafc", "#334155"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    createdAt: "2025-08-14T10:00:00Z",
  },
  {
    name: "Cascade Denim Jacket",
    brand: "Northbound",
    category: "Fashion",
    categorySlug: "fashion",
    description:
      "A timeless denim jacket with a modern fit, washed for that perfect lived-in feel. Layer it over everything — it only looks better with age.",
    features: [
      "13oz organic cotton denim",
      "Modern slim-tapered fit",
      "Brass-tone hardware",
      "Vintage stonewash finish",
      "Two chest and two side pockets",
      "Pre-shrunk, ready to wear",
    ],
    specifications: {
      Material: "13oz organic cotton denim",
      Fit: "Slim",
      Closure: "Zinc-alloy buttons",
      Pockets: "4",
      Care: "Wash cold, tumble dry low",
      Origin: "Turkey",
    },
    price: 95,
    compareAtPrice: 120,
    rating: 4.5,
    reviewsCount: 389,
    stock: 41,
    sku: "NTB-DNJ-102",
    tags: ["denim", "jacket", "casual"],
    isFeatured: true,
    isTrending: true,
    onSale: true,
    colors: ["#3f5a7d", "#2c3e50", "#d9d6cd"],
    sizes: ["S", "M", "L", "XL"],
    createdAt: "2025-10-02T10:00:00Z",
  },
  {
    name: "Velvet Cloud Sneakers",
    brand: "AirStep",
    category: "Fashion",
    categorySlug: "fashion",
    description:
      "Everyday sneakers with cloud-soft cushioning, breathable knit uppers, and a sleek silhouette that goes from office to weekend effortlessly.",
    features: [
      "CloudFoam midsole for all-day comfort",
      "Engineered knit upper",
      "Responsive energy-return sole",
      "Padded collar and tongue",
      "Laser-cut ventilation zones",
      "Machine washable",
    ],
    specifications: {
      Upper: "Engineered breathable knit",
      Midsole: "CloudFoam",
      Outsole: "High-traction rubber",
      Weight: "245g (per shoe)",
      Fit: "True to size",
      Care: "Machine wash cold, air dry",
    },
    price: 110,
    rating: 4.4,
    reviewsCount: 976,
    stock: 0,
    sku: "AST-SNK-103",
    tags: ["sneakers", "running", "comfort"],
    isBestSeller: true,
    colors: ["#f8fafc", "#64748b", "#0f172a"],
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
    createdAt: "2025-07-22T10:00:00Z",
  },
  {
    name: "Heritage Leather Tote",
    brand: "Lederhaus",
    category: "Fashion",
    categorySlug: "fashion",
    description:
      "Handcrafted full-grain leather tote that patinas beautifully over time. Roomy enough for a 15-inch laptop, structured enough to stand on its own.",
    features: [
      "Full-grain vegetable-tanned leather",
      "Hand-stitched construction",
      "Fits up to 15-inch laptop",
      "Interior zip + slip pockets",
      "Magnetic top closure",
      "Solid brass hardware",
    ],
    specifications: {
      Material: "Full-grain vegetable-tanned leather",
      Dimensions: "15.5 x 11 x 5.5 in",
      Strap: "Adjustable, detachable",
      Interior: "1 zip, 2 slip pockets",
      Hardware: "Solid brass",
      Warranty: "Lifetime repair",
    },
    price: 189,
    compareAtPrice: 230,
    rating: 4.8,
    reviewsCount: 214,
    stock: 23,
    sku: "LDH-BAG-104",
    tags: ["leather", "tote", "handbag"],
    isFeatured: true,
    isNew: true,
    isTrending: true,
    onSale: true,
    colors: ["#8b5a2b", "#2b2b2b"],
    createdAt: "2026-01-28T10:00:00Z",
  },
  {
    name: "Merino Wool Crewneck",
    brand: "Alpine",
    category: "Fashion",
    categorySlug: "fashion",
    description:
      "Ultra-soft 100% merino wool crewneck that regulates temperature, resists odor, and looks sharp from the trail to the table.",
    features: [
      "100% extra-fine merino wool",
      "Thermoregulating and odor-resistant",
      "Naturally breathable and stretchy",
      "Reinforced seams for durability",
      "Pilling-resistant finish",
      "Sustainably sourced, animal welfare certified",
    ],
    specifications: {
      Material: "100% extra-fine merino",
      Weight: "220 gsm",
      Fit: "Regular",
      Neckline: "Crew",
      Care: "Hand wash cold, dry flat",
      Origin: "New Zealand wool",
    },
    price: 75,
    rating: 4.7,
    reviewsCount: 456,
    stock: 88,
    sku: "ALP-MWO-105",
    tags: ["wool", "sweater", "layer"],
    isBestSeller: true,
    isTrending: true,
    colors: ["#cbd5e1", "#e2e8f0", "#334155"],
    sizes: ["S", "M", "L", "XL"],
    createdAt: "2025-11-05T10:00:00Z",
  },
  {
    name: "Aviator Sunglasses - Classic",
    brand: "Lumen",
    category: "Fashion",
    categorySlug: "fashion",
    description:
      "Iconic aviator frames with polarized, UV400 lenses. Lightweight titanium construction for all-day, glare-free comfort.",
    features: [
      "Polarized UV400 lenses",
      "Featherweight titanium frame",
      "Anti-scratch oleophobic coating",
      "Adjustable silicone nose pads",
      "Spring hinges",
      "Includes hard case + cleaning cloth",
    ],
    specifications: {
      Lens: "Polarized UV400",
      Frame: "Titanium alloy",
      "Lens Width": "58mm",
      Bridge: "14mm",
      Temples: "140mm",
      Weight: "22g",
      Warranty: "1 year",
    },
    price: 85,
    compareAtPrice: 110,
    rating: 4.5,
    reviewsCount: 289,
    stock: 96,
    sku: "LMN-GLS-106",
    tags: ["sunglasses", "polarized", "classic"],
    onSale: true,
    colors: ["#b45309", "#1f2937", "#0ea5e9"],
    createdAt: "2025-06-30T10:00:00Z",
  },
  {
    name: "Scandinavian Oak Dining Table",
    brand: "Nordica",
    category: "Home & Living",
    categorySlug: "home-living",
    description:
      "A minimalist solid oak dining table with tapered legs and a soft-satin finish. Seats six comfortably and anchors any dining space.",
    features: [
      "Solid white oak construction",
      "Seats up to 6 people",
      "Satin matte, scratch-resistant finish",
      "Tapered, hand-sanded legs",
      "Assembles in under 20 minutes",
      "FSC-certified timber",
    ],
    specifications: {
      Material: "Solid white oak",
      Dimensions: "70 x 35.5 x 29 in",
      Seating: "6",
      Finish: "Satin matte",
      Assembly: "Under 20 minutes",
      Warranty: "5 years",
    },
    price: 649,
    compareAtPrice: 799,
    rating: 4.8,
    reviewsCount: 156,
    stock: 9,
    sku: "NDC-TBL-201",
    tags: ["furniture", "dining", "oak"],
    isFeatured: true,
    onSale: true,
    colors: ["#c2a27a", "#d9c3a5"],
    createdAt: "2025-09-19T10:00:00Z",
  },
  {
    name: "Aurora Table Lamp",
    brand: "Lumen",
    category: "Home & Living",
    categorySlug: "home-living",
    description:
      "Sculptural table lamp with a frosted glass orb and warm, dimmable light. A statement piece that makes any corner glow.",
    features: [
      "Hand-blown frosted glass orb",
      "Dimmable warm LED included",
      "Touch-sensitive dimming",
      "Brass or matte black base",
      "450 lumens, 2700K warm light",
      "12W energy efficient",
    ],
    specifications: {
      Bulb: "12W LED included (2700K)",
      Brightness: "450 lumens, dimmable",
      Material: "Glass + brass/steel",
      Dimensions: "9 x 9 x 14 in",
      Power: "Touch dim, USB-C 5W",
      Warranty: "2 years",
    },
    price: 89,
    rating: 4.6,
    reviewsCount: 478,
    stock: 63,
    sku: "LMN-LMP-202",
    tags: ["lighting", "lamp", "decor"],
    isBestSeller: true,
    colors: ["#b45309", "#111827"],
    createdAt: "2025-08-01T10:00:00Z",
  },
  {
    name: "Cloud Nine Cotton Bedding Set",
    brand: "Luna Living",
    category: "Home & Living",
    categorySlug: "home-living",
    description:
      "900-thread-count Egyptian cotton bedding that feels like sleeping on a cloud. Includes duvet cover, flat sheet, and two pillowcases.",
    features: [
      "900-thread-count Egyptian cotton",
      "Sateen weave with a soft sheen",
      "OEKO-TEX certified, hypoallergenic",
      "Deep pockets fit 18-inch mattresses",
      "Hidden button duvet closure",
      "Includes 4-piece set",
    ],
    specifications: {
      Material: "100% Egyptian cotton sateen",
      "Thread Count": "900",
      "Set Includes": "Duvet cover, flat sheet, 2 pillowcases",
      Pockets: "Up to 18 in",
      Care: "Machine wash cold",
      Certification: "OEKO-TEX Standard 100",
    },
    price: 139,
    compareAtPrice: 179,
    rating: 4.7,
    reviewsCount: 821,
    stock: 38,
    sku: "LLV-BED-203",
    tags: ["bedding", "cotton", "luxury"],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    onSale: true,
    colors: ["#f8fafc", "#e2e8f0", "#bae6fd"],
    sizes: ["Queen", "King", "California King"],
    createdAt: "2025-12-01T10:00:00Z",
  },
  {
    name: "ProChef Stainless Cookware Set",
    brand: "KitchenCraft",
    category: "Home & Living",
    categorySlug: "home-living",
    description:
      "Ten pieces of professional-grade tri-ply stainless cookware with oven-safe lids and stay-cool handles. Built to last generations.",
    features: [
      "Tri-ply construction: aluminum core",
      "Even heat distribution, no hotspots",
      "Induction-ready and oven-safe to 500°F",
      "Stay-cool stainless handles",
      "Tight-fitting glass lids",
      "Dishwasher safe",
    ],
    specifications: {
      Pieces: "10",
      Material: "18/10 stainless steel, tri-ply",
      "Oven Safe": "Up to 500°F",
      Cooktop: "All incl. induction",
      Includes: "Saucepans, fry pans, stock pot, lids",
      Warranty: "Lifetime limited",
    },
    price: 219,
    compareAtPrice: 279,
    rating: 4.6,
    reviewsCount: 604,
    stock: 29,
    sku: "KTC-CW-204",
    tags: ["cookware", "kitchen", "steel"],
    isBestSeller: true,
    onSale: true,
    colors: ["#94a3b8"],
    createdAt: "2025-10-25T10:00:00Z",
  },
  {
    name: "Botanica Indoor Herb Garden",
    brand: "Greenhouse",
    category: "Home & Living",
    categorySlug: "home-living",
    description:
      "Grow fresh basil, mint, and cilantro year-round with automated LED lighting and self-watering smart pots. No green thumb required.",
    features: [
      "Full-spectrum grow LEDs",
      "Self-watering reservoir (30-day)",
      "Grows 3 herbs simultaneously",
      "Built-in growth reminders",
      "Seed pods included",
      "Compact countertop footprint",
    ],
    specifications: {
      Pods: "3 (basil, mint, cilantro included)",
      Lighting: "Full-spectrum LED",
      Reservoir: "30-day self-watering",
      Dimensions: "12 x 8 x 14 in",
      Power: "USB-C",
      Warranty: "1 year",
    },
    price: 129,
    rating: 4.5,
    reviewsCount: 267,
    stock: 52,
    sku: "GHS-GRD-205",
    tags: ["garden", "herbs", "smart-home"],
    isNew: true,
    colors: ["#16a34a", "#22c55e"],
    createdAt: "2026-01-22T10:00:00Z",
  },
  {
    name: "Glass Espresso Machine",
    brand: "BaristaPro",
    category: "Home & Living",
    categorySlug: "home-living",
    description:
      "Café-quality espresso at home with a 15-bar pump, precise temperature control, and a built-in steam wand for silky microfoam.",
    features: [
      "15-bar professional pressure pump",
      "PID temperature control (±1°C)",
      "Commercial steam wand",
      "58mm portafilter",
      "Pre-infusion for balanced extraction",
      "Fast 25-second heat-up",
    ],
    specifications: {
      Pump: "15-bar",
      Boiler: "Aluminum thermoblock",
      "Water Tank": "1.2L removable",
      "Portafilter": "58mm stainless",
      "Steam Wand": "Commercial-style",
      Power: "1350W",
      Warranty: "2 years",
    },
    price: 329,
    compareAtPrice: 399,
    rating: 4.7,
    reviewsCount: 391,
    stock: 14,
    sku: "BRP-ESP-206",
    tags: ["coffee", "espresso", "kitchen"],
    isFeatured: true,
    onSale: true,
    colors: ["#334155", "#b45309"],
    createdAt: "2025-11-11T10:00:00Z",
  },
  {
    name: "Glow Renewal Serum",
    brand: "Botaniq",
    category: "Beauty & Care",
    categorySlug: "beauty-care",
    description:
      "A weightless vitamin C serum that brightens, evens tone, and plumps skin with hyaluronic acid. Dermatologist tested, cruelty free.",
    features: [
      "15% stabilized vitamin C",
      "Hyaluronic acid for deep hydration",
      "Niacinamide to refine texture",
      "Vegan and cruelty-free",
      "Fragrance-free, gentle on skin",
      "Clinically shown results in 28 days",
    ],
    specifications: {
      Active: "15% vitamin C, 5% niacinamide",
      Size: "30ml / 1.0 fl oz",
      "Skin Type": "All, sensitive-friendly",
      Texture: "Weightless serum",
      Cruelty: "Vegan, cruelty-free",
      "Shelf Life": "12 months after opening",
    },
    price: 42,
    compareAtPrice: 54,
    rating: 4.6,
    reviewsCount: 1205,
    stock: 140,
    sku: "BTQ-SRM-301",
    tags: ["skincare", "serum", "vitamin-c"],
    isBestSeller: true,
    isTrending: true,
    onSale: true,
    colors: ["#fbbf24", "#fef3c7"],
    createdAt: "2025-09-02T10:00:00Z",
  },
  {
    name: "Velvet Matte Lipstick - Rosewood",
    brand: "Petal",
    category: "Beauty & Care",
    categorySlug: "beauty-care",
    description:
      "A creamy, velvet-matte lipstick with intense pigment and an eight-hour wear. Enriched with shea butter so lips stay soft all day.",
    features: [
      "8-hour velvet-matte wear",
      "One-swipe intense color",
      "Shea butter + vitamin E",
      "Transfer-resistant formula",
      "Cruelty-free",
      "Smooth, non-drying finish",
    ],
    specifications: {
      Shade: "Rosewood",
      Finish: "Velvet matte",
      Size: "3.8g",
      Wear: "8 hours",
      "Key Ingredients": "Shea butter, vitamin E",
      Cruelty: "Cruelty-free",
    },
    price: 24,
    rating: 4.5,
    reviewsCount: 689,
    stock: 210,
    sku: "PTL-LIP-302",
    tags: ["lipstick", "makeup", "beauty"],
    isBestSeller: true,
    colors: ["#9f1239", "#e11d48"],
    createdAt: "2025-07-15T10:00:00Z",
  },
  {
    name: "Aroma Therapy Diffuser",
    brand: "Serenity",
    category: "Beauty & Care",
    categorySlug: "beauty-care",
    description:
      "Transform your space with a whisper-quiet ultrasonic diffuser with mood lighting and up to 10 hours of continuous mist.",
    features: [
      "Ultrasonic cool-mist technology",
      "10-hour run time",
      "7-color ambient mood light",
      "Auto shut-off when empty",
      "300ml capacity",
      "Whisper-quiet under 28dB",
    ],
    specifications: {
      Capacity: "300ml",
      Runtime: "Up to 10 hours",
      Coverage: "Up to 300 sq ft",
      Noise: "Under 28dB",
      Light: "7-color + off",
      Power: "USB-C / AC adapter",
      Warranty: "1 year",
    },
    price: 39,
    compareAtPrice: 49,
    rating: 4.4,
    reviewsCount: 532,
    stock: 95,
    sku: "SRN-DFF-303",
    tags: ["aromatherapy", "diffuser", "relax"],
    onSale: true,
    colors: ["#94a3b8", "#64748b"],
    createdAt: "2025-08-20T10:00:00Z",
  },
  {
    name: "Hydra Rich Body Lotion",
    brand: "Botaniq",
    category: "Beauty & Care",
    categorySlug: "beauty-care",
    description:
      "72-hour hydration with ceramides and oat extract. Silky, fast-absorbing, and gentle enough for sensitive skin.",
    features: [
      "72-hour deep hydration",
      "Ceramide complex + oat extract",
      "Fast-absorbing, non-greasy",
      "Dermatologist tested",
      "Unscented option",
      "Suitable for sensitive skin",
    ],
    specifications: {
      Size: "500ml / 16.9 fl oz",
      "Key Ingredients": "Ceramides, oat extract, shea",
      Absorption: "Fast, non-greasy",
      "Skin Type": "Dry, sensitive",
      Fragrance: "Fragrance-free",
      Cruelty: "Cruelty-free",
    },
    price: 28,
    rating: 4.7,
    reviewsCount: 945,
    stock: 180,
    sku: "BTQ-LTN-304",
    tags: ["lotion", "moisturizer", "body"],
    isBestSeller: true,
    colors: ["#fef3c7", "#e2e8f0"],
    createdAt: "2025-10-10T10:00:00Z",
  },
  {
    name: "Luminous Facial Cleanser",
    brand: "PureGlow",
    category: "Beauty & Care",
    categorySlug: "beauty-care",
    description:
      "A gel-to-foam cleanser with salicylic acid and green tea that melts away makeup, unclogs pores, and balances skin's moisture barrier.",
    features: [
      "Gentle gel-to-foam formula",
      "2% salicylic acid for clarity",
      "Green tea antioxidants",
      "pH-balanced 5.5",
      "Makeup-removing power",
      "Non-comedogenic",
    ],
    specifications: {
      Size: "150ml / 5.0 fl oz",
      Active: "2% salicylic acid",
      "Skin Type": "Normal, oily, combination",
      pH: "5.5 balanced",
      Cruelty: "Cruelty-free",
      "Shelf Life": "12 months after opening",
    },
    price: 22,
    rating: 4.4,
    reviewsCount: 758,
    stock: 260,
    sku: "PGL-CLN-305",
    tags: ["cleanser", "skincare", "face"],
    isNew: true,
    isTrending: true,
    colors: ["#86efac", "#f8fafc"],
    createdAt: "2026-01-30T10:00:00Z",
  },
  {
    name: "Summit 60L Hiking Backpack",
    brand: "TrailPeak",
    category: "Sports & Outdoors",
    categorySlug: "sports-outdoors",
    description:
      "A precision-fit 60L backpack with a ventilated suspension system, built for multi-day treks. Water-resistant, expandable, and featherlight.",
    features: [
      "60L capacity, expandable to 68L",
      "Ventilated trampoline back panel",
      "Adjustable torso + hip belt",
      "Water-resistant ripstop nylon",
      "Hydration reservoir compatible",
      "Fits airline carry-on (45L config)",
    ],
    specifications: {
      Capacity: "60L (expandable to 68L)",
      Weight: "1.8 kg",
      Material: "Ripstop nylon, TPU coated",
      Frame: "7075 aluminum",
      Raincover: "Included",
      Warranty: "Lifetime",
    },
    price: 179,
    compareAtPrice: 219,
    rating: 4.8,
    reviewsCount: 342,
    stock: 21,
    sku: "TRP-BPK-401",
    tags: ["backpack", "hiking", "outdoors"],
    isFeatured: true,
    isTrending: true,
    onSale: true,
    colors: ["#1f2937", "#0f766e", "#b45309"],
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    name: "Velocity Running Shoes",
    brand: "AirStep",
    category: "Sports & Outdoors",
    categorySlug: "sports-outdoors",
    description:
      "Lightweight racing-day shoes with a carbon plate and high-rebound foam. PRs are made in the Velocity.",
    features: [
      "Full-length carbon plate",
      "High-rebound PEBA foam",
      "Ultralight engineered mesh",
      "Grippy carbon rubber outsole",
      "8mm heel-to-toe drop",
      "Racer's heel-lock lacing",
    ],
    specifications: {
      Weight: "198g (US 9)",
      Drop: "8mm",
      Foam: "High-rebound PEBA",
      Plate: "Full-length carbon",
      Use: "Race / tempo",
      Fit: "Slim, true to size",
    },
    price: 149,
    rating: 4.7,
    reviewsCount: 812,
    stock: 47,
    sku: "AST-RUN-402",
    tags: ["running", "shoes", "race"],
    isBestSeller: true,
    isNew: true,
    colors: ["#dc2626", "#f8fafc", "#0f172a"],
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
    createdAt: "2026-01-12T10:00:00Z",
  },
  {
    name: "Foldable Yoga Mat Premium",
    brand: "ZenFlow",
    category: "Sports & Outdoors",
    categorySlug: "sports-outdoors",
    description:
      "A 5mm cork-topped yoga mat with superior grip, natural antimicrobial properties, and a carry-friendly foldable design.",
    features: [
      "Natural cork top layer",
      "5mm cushioning with TPE base",
      "Superior wet-and-dry grip",
      "Antimicrobial & eco-friendly",
      "Foldable + carry strap included",
      "Alignment lines for precision",
    ],
    specifications: {
      Material: "Cork + TPE",
      Thickness: "5mm",
      Size: "72 x 26 in",
      Weight: "2.1 kg",
      Care: "Wipe clean, air dry",
      Warranty: "1 year",
    },
    price: 59,
    compareAtPrice: 75,
    rating: 4.5,
    reviewsCount: 623,
    stock: 108,
    sku: "ZFL-YGA-403",
    tags: ["yoga", "fitness", "mat"],
    onSale: true,
    colors: ["#d6cbb0", "#0f766e"],
    createdAt: "2025-08-28T10:00:00Z",
  },
  {
    name: "Carbon Pro Tennis Racket",
    brand: "Strike",
    category: "Sports & Outdoors",
    categorySlug: "sports-outdoors",
    description:
      "Tour-grade carbon fiber racket with a sweet-spot expanding frame. Power and control, perfectly balanced.",
    features: [
      "High-modulus carbon fiber",
      "Sweet-spot expanding frame",
      "String pattern: 16x19",
      "Vibration dampening tech",
      "Comes pre-strung",
      "2-year frame warranty",
    ],
    specifications: {
      Frame: "High-modulus carbon",
      "Head Size": "100 sq in",
      Weight: "300g (unstrung)",
      Balance: "4 pts head light",
      "String Pattern": "16x19",
      Grip: "4 1/4 - 4 5/8",
      Warranty: "2 years",
    },
    price: 189,
    rating: 4.6,
    reviewsCount: 178,
    stock: 33,
    sku: "STR-RKT-404",
    tags: ["tennis", "racket", "sport"],
    isFeatured: true,
    colors: ["#0ea5e9", "#0f172a", "#dc2626"],
    createdAt: "2025-10-05T10:00:00Z",
  },
  {
    name: "Glacier Insulated Water Bottle",
    brand: "TrailPeak",
    category: "Sports & Outdoors",
    categorySlug: "sports-outdoors",
    description:
      "Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12. Built from food-grade steel that never sweats or leaks.",
    features: [
      "24h cold / 12h hot insulation",
      "18/8 food-grade stainless steel",
      "Leak-proof, sweat-proof",
      "Powder-coated exterior",
      "Wide-mouth with carry loop",
      "BPA-free",
    ],
    specifications: {
      Capacity: "32 oz / 946ml",
      Material: "18/8 stainless steel",
      Insulation: "Double-wall vacuum",
      Cold: "24 hours",
      Hot: "12 hours",
      Weight: "430g",
      Warranty: "Lifetime",
    },
    price: 34,
    compareAtPrice: 42,
    rating: 4.8,
    reviewsCount: 1380,
    stock: 150,
    sku: "TRP-BTL-405",
    tags: ["bottle", "hydration", "outdoors"],
    isBestSeller: true,
    onSale: true,
    colors: ["#0ea5e9", "#16a34a", "#f8fafc"],
    createdAt: "2025-06-18T10:00:00Z",
  },
  {
    name: "Explorer Kids Tent - Space",
    brand: "PlayNest",
    category: "Toys & Kids",
    categorySlug: "toys-kids",
    description:
      "A glow-in-the-dark space adventure tent that turns any bedroom into a launchpad. Folds flat in seconds, made from safe non-toxic materials.",
    features: [
      "Glow-in-the-dark starfield print",
      "Sets up in seconds, folds flat",
      "Non-toxic, BPA-free materials",
      "Mesh window for airflow",
      "Squishy play mat included",
      "Ages 3+",
    ],
    specifications: {
      Size: "39 x 39 x 52 in",
      Material: "Polyester + PE foam",
      Ages: "3+",
      Setup: "Seconds, tool-free",
      Includes: "Tent + play mat + carry bag",
      Safety: "Non-toxic, BPA-free",
    },
    price: 49,
    compareAtPrice: 65,
    rating: 4.7,
    reviewsCount: 412,
    stock: 0,
    sku: "PLN-TNT-501",
    tags: ["kids", "tent", "toy"],
    onSale: true,
    colors: ["#6366f1", "#0ea5e9"],
    createdAt: "2025-11-25T10:00:00Z",
  },
  {
    name: "RoboBot STEM Building Kit",
    brand: "BrainBuild",
    category: "Toys & Kids",
    categorySlug: "toys-kids",
    description:
      "Build and code your own robot with 300+ snap-together parts and a block-based coding app. STEM learning that's actually fun.",
    features: [
      "300+ snap-together parts",
      "Block-based coding app",
      "3 build modes: bot, bug, rover",
      "Remote control + app control",
      "Rechargeable battery included",
      "Ages 8+",
    ],
    specifications: {
      Pieces: "320",
      Modes: "3 build modes",
      Control: "App + remote",
      Battery: "Rechargeable, included",
      App: "iOS / Android, block coding",
      Ages: "8+",
      Safety: "EN71 certified",
    },
    price: 79,
    rating: 4.6,
    reviewsCount: 298,
    stock: 57,
    sku: "BRB-ROB-502",
    tags: ["robot", "stem", "coding"],
    isFeatured: true,
    isNew: true,
    colors: ["#e11d48", "#0f172a"],
    createdAt: "2026-01-25T10:00:00Z",
  },
  {
    name: "Comfy Plush Collection - Set of 3",
    brand: "CuddleCo",
    category: "Toys & Kids",
    categorySlug: "toys-kids",
    description:
      "Ultra-soft, huggable plush friends made from recycled fibers. Each has embroidered features — no plastic parts, perfect for little hands.",
    features: [
      "Set of 3 ultra-soft plush",
      "Made from recycled fibers",
      "Embroidered features (no plastic)",
      "Machine washable",
      "Perfect gift-ready packaging",
      "Suitable from birth",
    ],
    specifications: {
      Includes: "Fox, bear, bunny",
      Material: "Recycled plush polyester",
      Size: "12 in each",
      Ages: "0+",
      Care: "Machine wash cold",
      Safety: "EN71 + CPSIA certified",
    },
    price: 36,
    compareAtPrice: 45,
    rating: 4.9,
    reviewsCount: 864,
    stock: 92,
    sku: "CDC-PLS-503",
    tags: ["plush", "stuffed", "toy"],
    isBestSeller: true,
    onSale: true,
    colors: ["#f59e0b", "#a16207", "#e7e5e4"],
    createdAt: "2025-07-08T10:00:00Z",
  },
];

function buildReviews(productName: string, seed: number): Review[] {
  const count = 3 + (seed % 4);
  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (seed + i) % reviewBodies.length;
    const nameIdx = (seed + i * 2) % reviewNames.length;
    const day = 3 + ((seed * 7 + i * 13) % 24);
    const month = 1 + ((seed + i) % 11);
    reviews.push({
      id: `rv-${productName}-${i}`,
      userId: `us-${seed}-${i}`,
      name: reviewNames[nameIdx],
      rating: 4 + ((seed + i) % 2),
      title: reviewTitles[idx],
      body: reviewBodies[idx],
      date: `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T10:00:00Z`,
      verified: (seed + i) % 3 !== 0,
      helpful: 5 + ((seed * 3 + i * 7) % 40),
    });
  }
  return reviews;
}

export const products: Product[] = spec.map((p, i) => {
  const discount = calculateDiscount(p.price, p.compareAtPrice);
  const seed = slugify(p.name);
  const reviewCount = p.reviewsCount || 50 + (i * 137) % 900;
  const galleryCount = 4;
  return {
    id: `pr-${String(i + 1).padStart(3, "0")}`,
    slug: seed,
    name: p.name,
    brand: p.brand,
    category: p.category,
    categorySlug: p.categorySlug,
    description: p.description,
    features: p.features,
    specifications: p.specifications,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: Array.from(
      { length: galleryCount },
      (_, g) => img(`${seed}-${g + 1}`)
    ),
    rating: p.rating,
    reviewsCount: reviewCount,
    stock: p.stock,
    sku: p.sku,
    tags: p.tags,
    isFeatured: p.isFeatured ?? false,
    isBestSeller: p.isBestSeller ?? false,
    isNew: p.isNew ?? false,
    isTrending: p.isTrending ?? false,
    onSale: p.onSale ?? false,
    discountPercent: discount,
    colors: p.colors,
    sizes: p.sizes,
    createdAt: p.createdAt,
    reviews: buildReviews(seed, i + 1),
  };
});

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts() {
  return products.filter((p) => p.isFeatured);
}

export function getBestSellers() {
  return products.filter((p) => p.isBestSeller);
}

export function getNewArrivals() {
  return [...products]
    .filter((p) => p.isNew)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTrendingProducts() {
  return products.filter((p) => p.isTrending);
}

export function getFlashSaleProducts() {
  return products.filter((p) => p.onSale).slice(0, 8);
}

export function getRecommendedProducts() {
  return [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);
}

export function getRelatedProducts(product: Product, limit = 4) {
  const sameCategory = products.filter(
    (p) =>
      p.categorySlug === product.categorySlug && p.id !== product.id
  );
  const others = products.filter(
    (p) => p.categorySlug !== product.categorySlug && p.id !== product.id
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export function getProductsByCategory(slug: string) {
  return products.filter((p) => p.categorySlug === slug);
}

export function searchProducts(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function getProductImage(product: Product) {
  return product.images[0];
}
