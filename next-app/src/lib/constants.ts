export interface ToolItem {
  id: string;
  _id?: string;
  title: string;
  description: string;
  category: "POWER_TOOLS" | "HAND_TOOLS" | "GARDEN" | "HEAVY_EQUIPMENT" | "WOODWORKING" | "CLEANING";
  condition: "BRAND_NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
  ratePerDay: number;
  deposit: number;
  images: string[];
  city: string;
  address: string;
  pickupArea?: string;
  specs: Record<string, string>;
  ownerName: string;
  ownerId?: string;
  ownerEmail?: string;
  isAvailable: boolean;
  isPublished?: boolean;
  publicId?: string;
  rating: number;
  reviewsCount: number;
  featured?: boolean;
  model3DType?: string;
  createdAt?: string;
}

export interface BookingItem {
  id: string;
  _id?: string;
  toolId: string;
  toolTitle: string;
  toolPhoto: string;
  renterName: string;
  renterEmail: string;
  ownerName: string;
  ownerEmail?: string;
  ownerId?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  ratePerDay: number;
  deposit: number;
  totalPrice: number;
  status: "PENDING" | "APPROVED" | "CONFIRMED" | "RENTED" | "RETURNED" | "COMPLETED" | "CANCELLED";
  initialMsg?: string;
  isSigned: boolean;
  actualStartTime?: string;
  messages: Array<{
    senderName: string;
    senderEmail: string;
    senderRole?: "owner" | "borrower";
    text: string;
    timestamp: string;
  }>;
  createdAt: string;
}

export const INITIAL_TOOLS: ToolItem[] = [
  {
    id: "tool-1",
    title: "Bosch High Torque Impact Drill (18V)",
    description: "Industrial grade brushless impact drill with 2-speed planetary gearbox. Includes 2x 4.0Ah batteries, rapid charger, and 30-piece titanium bit set.",
    category: "POWER_TOOLS",
    condition: "LIKE_NEW",
    ratePerDay: 450,
    deposit: 1500,
    images: ["/assets/drill machine.png", "/assets/Rotary hammer drill.png"],
    city: "Mumbai",
    address: "Bandra West, Mumbai",
    pickupArea: "Bandra West",
    specs: {
      "Power Source": "18V Lithium-Ion",
      "Chuck Size": "13mm Keyless",
      "Max Torque": "63 Nm",
      "Weight": "1.8 kg"
    },
    ownerName: "John Owner",
    ownerEmail: "john_owner@example.com",
    ownerId: "user-1",
    isAvailable: true,
    isPublished: true,
    publicId: "qr-tool-1",
    rating: 4.9,
    reviewsCount: 24,
    featured: true,
    model3DType: "drill",
    createdAt: "2026-10-20T10:00:00Z"
  },
  {
    id: "tool-2",
    title: "DeWalt Heavy Duty Circular Saw",
    description: "7-1/4 inch circular saw with electric brake and high grade carbide blade. Exceptional cut depth for timber, framing, and plywood work.",
    category: "POWER_TOOLS",
    condition: "BRAND_NEW",
    ratePerDay: 600,
    deposit: 2000,
    images: ["/assets/Circular Saw.png"],
    city: "Mumbai",
    address: "Andheri East, Mumbai",
    pickupArea: "Andheri East",
    specs: {
      "Blade Diameter": "184 mm",
      "No-load speed": "5500 RPM",
      "Bevel Capacity": "57 degrees",
      "Power Output": "1800W"
    },
    ownerName: "Alice Owner",
    ownerEmail: "alice_owner@example.com",
    ownerId: "usr-alice_owner",
    isAvailable: true,
    isPublished: true,
    publicId: "qr-tool-2",
    rating: 5.0,
    reviewsCount: 19,
    featured: true,
    model3DType: "saw",
    createdAt: "2026-10-20T11:00:00Z"
  },
  {
    id: "tool-3",
    title: "Makita Professional Angle Grinder",
    description: "Compact 840W motor angle grinder with labyrinth construction that seals the motor and bearings from dust and debris.",
    category: "POWER_TOOLS",
    condition: "LIKE_NEW",
    ratePerDay: 350,
    deposit: 1000,
    images: ["/assets/Angle Grinder.png"],
    city: "Pune",
    address: "Kothrud, Pune",
    pickupArea: "Kothrud",
    specs: {
      "Wheel Diameter": "100 mm",
      "Power": "840 Watts",
      "Cord Length": "2.5 m"
    },
    ownerName: "John Owner",
    ownerEmail: "john_owner@example.com",
    ownerId: "user-1",
    isAvailable: true,
    isPublished: true,
    publicId: "qr-tool-3",
    rating: 4.8,
    reviewsCount: 15,
    featured: true,
    model3DType: "grinder",
    createdAt: "2026-10-20T12:00:00Z"
  },
  {
    id: "tool-4",
    title: "Kärcher High Pressure Washer",
    description: "145 bar pressure washer with Dirt Blaster nozzle. Perfect for deep cleaning patios, car detailing, masonry, and driveways.",
    category: "CLEANING",
    condition: "GOOD",
    ratePerDay: 750,
    deposit: 2500,
    images: ["/assets/Pressure washer.png"],
    city: "Mumbai",
    address: "Juhu, Mumbai",
    pickupArea: "Juhu",
    specs: {
      "Pressure": "145 Bar",
      "Flow Rate": "500 L/h",
      "Hose Length": "8 meters"
    },
    ownerName: "Alice Owner",
    ownerEmail: "alice_owner@example.com",
    ownerId: "usr-alice_owner",
    isAvailable: true,
    isPublished: true,
    publicId: "qr-tool-4",
    rating: 4.7,
    reviewsCount: 31,
    featured: true,
    model3DType: "washer",
    createdAt: "2026-10-20T13:00:00Z"
  },
  {
    id: "tool-5",
    title: "Stihl Gasoline Chainsaw (16-Inch)",
    description: "Robust, fuel-efficient chainsaw with anti-vibration system and QuickStop chain brake for pruning trees and cutting firewood.",
    category: "GARDEN",
    condition: "GOOD",
    ratePerDay: 850,
    deposit: 3000,
    images: ["/assets/chainsaw.png"],
    city: "Bangalore",
    address: "Indiranagar, Bangalore",
    pickupArea: "Indiranagar",
    specs: {
      "Bar Length": "40 cm / 16 inch",
      "Displacement": "38.2 cc",
      "Weight": "4.6 kg"
    },
    ownerName: "John Owner",
    ownerEmail: "john_owner@example.com",
    ownerId: "user-1",
    isAvailable: true,
    isPublished: true,
    publicId: "qr-tool-5",
    rating: 4.9,
    reviewsCount: 12,
    featured: false,
    model3DType: "chainsaw",
    createdAt: "2026-10-20T14:00:00Z"
  },
  {
    id: "tool-6",
    title: "Stanley Multi-Tool Heavy Mechanic Tool Box",
    description: "140-piece master socket and mechanics hand tool set in a rugged cantilever metal storage case. Chromium-vanadium steel.",
    category: "HAND_TOOLS",
    condition: "BRAND_NEW",
    ratePerDay: 250,
    deposit: 800,
    images: ["/assets/Tool box.png", "/assets/hammer.png"],
    city: "Mumbai",
    address: "Powai, Mumbai",
    pickupArea: "Powai",
    specs: {
      "Piece Count": "140 pcs",
      "Material": "Chrome Vanadium",
      "Case": "Reinforced Steel"
    },
    ownerName: "Alice Owner",
    ownerEmail: "alice_owner@example.com",
    ownerId: "usr-alice_owner",
    isAvailable: true,
    isPublished: true,
    publicId: "qr-tool-6",
    rating: 4.9,
    reviewsCount: 42,
    featured: true,
    model3DType: "box",
    createdAt: "2026-10-20T15:00:00Z"
  },
  {
    id: "tool-7",
    title: "Bosch Variable Speed Orbital Sander",
    description: "Smooth finish random orbit sander with microfilter dust canister and hook-and-loop sanding disc pad.",
    category: "WOODWORKING",
    condition: "LIKE_NEW",
    ratePerDay: 300,
    deposit: 900,
    images: ["/assets/Orbital Sander.png", "/assets/wood sander.png"],
    city: "Delhi",
    address: "Hauz Khas, Delhi",
    pickupArea: "Hauz Khas",
    specs: {
      "Pad Size": "125 mm",
      "Orbit Diameter": "2.5 mm",
      "Power": "250W"
    },
    ownerName: "John Owner",
    ownerEmail: "john_owner@example.com",
    ownerId: "user-1",
    isAvailable: true,
    isPublished: true,
    publicId: "qr-tool-7",
    rating: 4.8,
    reviewsCount: 16,
    featured: false,
    model3DType: "sander",
    createdAt: "2026-10-20T16:00:00Z"
  },
  {
    id: "tool-8",
    title: "Aluminium Folding Telescopic Step Ladder",
    description: "Multi-purpose 12.5ft telescopic ladder with non-slip rungs and heavy duty stabilizers. Supports up to 150 kg.",
    category: "HEAVY_EQUIPMENT",
    condition: "BRAND_NEW",
    ratePerDay: 200,
    deposit: 600,
    images: ["/assets/step ladder.png"],
    city: "Mumbai",
    address: "Thane West, Mumbai",
    pickupArea: "Thane West",
    specs: {
      "Max Height": "3.8 meters",
      "Folded Height": "85 cm",
      "Load Capacity": "150 kg"
    },
    ownerName: "Alice Owner",
    ownerEmail: "alice_owner@example.com",
    ownerId: "usr-alice_owner",
    isAvailable: true,
    isPublished: true,
    publicId: "qr-tool-8",
    rating: 5.0,
    reviewsCount: 28,
    featured: false,
    model3DType: "ladder",
    createdAt: "2026-10-20T17:00:00Z"
  },
  {
    id: "tool-9",
    title: "Precision Electric Wood Planer",
    description: "High speed electric planer with calibrated depth adjustment and dual exhaust ejection ports.",
    category: "WOODWORKING",
    condition: "LIKE_NEW",
    ratePerDay: 400,
    deposit: 1200,
    images: ["/assets/Electric Planner.png"],
    city: "Mumbai",
    address: "Colaba, Mumbai",
    pickupArea: "Colaba",
    specs: {
      "Planing Width": "82 mm",
      "Planing Depth": "2 mm",
      "Power": "710 Watts"
    },
    ownerName: "John Owner",
    ownerEmail: "john_owner@example.com",
    ownerId: "user-1",
    isAvailable: true,
    isPublished: true,
    publicId: "qr-tool-9",
    rating: 4.7,
    reviewsCount: 9,
    featured: false,
    model3DType: "planer",
    createdAt: "2026-10-20T18:00:00Z"
  },
  {
    id: "tool-10",
    title: "Professional Laser Guided Tile Cutter",
    description: "Heavy duty 800mm manual ceramic and porcelain tile cutter with infrared red beam alignment for hairline precision.",
    category: "HEAVY_EQUIPMENT",
    condition: "LIKE_NEW",
    ratePerDay: 500,
    deposit: 1500,
    images: ["/assets/Tile Cutter.png"],
    city: "Pune",
    address: "Viman Nagar, Pune",
    pickupArea: "Viman Nagar",
    specs: {
      "Max Cut Length": "800 mm",
      "Cutting Thickness": "6 - 15 mm",
      "Laser Guide": "Dual Class II"
    },
    ownerName: "Alice Owner",
    ownerEmail: "alice_owner@example.com",
    ownerId: "user-2",
    isAvailable: true,
    isPublished: true,
    publicId: "qr-tool-10",
    rating: 4.9,
    reviewsCount: 14,
    featured: false,
    model3DType: "cutter",
    createdAt: "2026-10-20T19:00:00Z"
  }
];

export const INITIAL_USERS = [
  {
    id: "user-1",
    name: "John Owner",
    email: "john_owner@example.com",
    isOwner: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    city: "Mumbai",
    phone: "+91 98200 12345",
    bio: "Woodworker & DIY enthusiast with over 20 professional power tools available for neighborhood rent."
  },
  {
    id: "user-2",
    name: "Alice Owner",
    email: "alice_owner@example.com",
    isOwner: true,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    city: "Mumbai",
    phone: "+91 98200 54321",
    bio: "Home renovator offering clean, tested tools to help neighbors save money on repairs."
  },
  {
    id: "user-3",
    name: "Bob Borrower",
    email: "bob_borrower@example.com",
    isOwner: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    city: "Mumbai",
    phone: "+91 98200 99887",
    bio: "Weekend handyman working on apartment upgrades and furniture builds."
  },
  {
    id: "user-4",
    name: "Admin User",
    email: "admin@example.com",
    isOwner: true,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    city: "Mumbai",
    phone: "+91 98200 00000",
    bio: "Platform Administrator & Quality Assurance."
  }
];

export const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: "b-1",
    toolId: "tool-1",
    toolTitle: "Bosch High Torque Impact Drill (18V)",
    toolPhoto: "/assets/drill machine.png",
    renterName: "Bob Borrower",
    renterEmail: "bob_borrower@example.com",
    ownerName: "John Owner",
    ownerEmail: "john_owner@example.com",
    ownerId: "user-1",
    startDate: "2026-10-24",
    endDate: "2026-10-27",
    totalDays: 3,
    ratePerDay: 450,
    deposit: 1500,
    totalPrice: 1350,
    status: "RENTED",
    initialMsg: "Installing floating shelves and cabinet mounts in my kitchen.",
    isSigned: true,
    actualStartTime: "2026-10-24T10:00:00Z",
    messages: [
      {
        senderName: "Bob Borrower",
        senderEmail: "bob_borrower@example.com",
        senderRole: "borrower",
        text: "Hi John, picking up the drill now!",
        timestamp: "2026-10-24T09:45:00Z"
      },
      {
        senderName: "John Owner",
        senderEmail: "john_owner@example.com",
        senderRole: "owner",
        text: "Great! Both batteries are fully charged and in the case.",
        timestamp: "2026-10-24T09:50:00Z"
      }
    ],
    createdAt: "2026-10-23T14:20:00Z"
  },
  {
    id: "b-2",
    toolId: "tool-4",
    toolTitle: "Kärcher High Pressure Washer",
    toolPhoto: "/assets/Pressure washer.png",
    renterName: "Bob Borrower",
    renterEmail: "bob_borrower@example.com",
    ownerName: "Alice Owner",
    ownerEmail: "alice_owner@example.com",
    ownerId: "user-2",
    startDate: "2026-10-28",
    endDate: "2026-10-29",
    totalDays: 1,
    ratePerDay: 750,
    deposit: 2500,
    totalPrice: 750,
    status: "CONFIRMED",
    initialMsg: "Cleaning our terrace and balconies before Diwali.",
    isSigned: true,
    messages: [],
    createdAt: "2026-10-25T11:00:00Z"
  },
  {
    id: "b-3",
    toolId: "tool-2",
    toolTitle: "Makita Cordless Circular Saw (165mm)",
    toolPhoto: "/assets/circular-saw.png",
    renterName: "Bob Borrower",
    renterEmail: "bob_borrower@example.com",
    ownerName: "John Owner",
    ownerEmail: "john_owner@example.com",
    ownerId: "user-1",
    startDate: "2026-10-30",
    endDate: "2026-11-01",
    totalDays: 2,
    ratePerDay: 500,
    deposit: 2000,
    totalPrice: 1050,
    status: "PENDING",
    initialMsg: "Cutting plywood sheets for my study table build. Does it include extra wood cutting blades?",
    isSigned: true,
    messages: [
      {
        senderName: "Bob Borrower",
        senderEmail: "bob_borrower@example.com",
        senderRole: "borrower",
        text: "Hi John, I sent an instant rent request for your circular saw. Is the rip fence included?",
        timestamp: "2026-10-29T10:00:00Z"
      }
    ],
    createdAt: "2026-10-29T09:30:00Z"
  }
];
