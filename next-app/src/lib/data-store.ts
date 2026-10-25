import connectToDatabase from "./mongodb";
import type { IUser } from "@/models/User";
import type { ITool } from "@/models/Tool";
import type { IBooking } from "@/models/Booking";

export * from "./constants";
import { ToolItem, BookingItem, INITIAL_TOOLS, INITIAL_USERS, INITIAL_BOOKINGS } from "./constants";

// Lazy-load models to eliminate 4.4s cold-require delay when DB is offline or on initial hit
let modelsPromise: Promise<{
  User: typeof import("@/models/User").default;
  Tool: typeof import("@/models/Tool").default;
  Booking: typeof import("@/models/Booking").default;
}> | null = null;

async function getModels() {
  if (!modelsPromise) {
    modelsPromise = Promise.all([
      import("@/models/User"),
      import("@/models/Tool"),
      import("@/models/Booking"),
    ]).then(([u, t, b]) => ({
      User: u.default,
      Tool: t.default,
      Booking: b.default,
    }));
  }
  return modelsPromise;
}

// In-Memory store for offline fallback
class MemoryStore {
  tools: ToolItem[] = [...INITIAL_TOOLS];
  bookings: BookingItem[] = [...INITIAL_BOOKINGS];
  users: Array<typeof INITIAL_USERS[0]> = [...INITIAL_USERS];
  wishlists: Record<string, string[]> = {
    "bob_borrower@example.com": ["tool-1", "tool-2"],
  };
}

const memoryStore = new MemoryStore();
let isMongoSeeded = false;

// Auto-seed MongoDB on initial connection
async function seedMongoIfEmpty() {
  if (isMongoSeeded) return;
  try {
    const { User, Tool, Booking } = await getModels();
    const count = await Tool.countDocuments();
    if (count === 0) {
      console.log("Seeding MongoDB with initial tools and users...");
      for (const u of INITIAL_USERS) {
        await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
      }
      for (const t of INITIAL_TOOLS) {
        await Tool.create({
          title: t.title,
          description: t.description,
          category: t.category,
          condition: t.condition,
          ratePerDay: t.ratePerDay,
          deposit: t.deposit,
          images: t.images,
          city: t.city,
          address: t.address,
          specs: t.specs,
          ownerName: t.ownerName,
          isAvailable: t.isAvailable,
          rating: t.rating,
          reviewsCount: t.reviewsCount,
          featured: t.featured,
          model3DType: t.model3DType,
        });
      }
      for (const b of INITIAL_BOOKINGS) {
        await Booking.create(b);
      }
      console.log("MongoDB seeded successfully!");
    }
    isMongoSeeded = true;
  } catch (err: any) {
    console.warn("Could not auto-seed MongoDB:", err.message);
  }
}

// ------------------- Unified Data Access Layer -------------------

export async function getTools(filters?: {
  category?: string;
  search?: string;
  city?: string;
  maxPrice?: number;
}): Promise<ToolItem[]> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      await seedMongoIfEmpty();
      const { Tool } = await getModels();
      const query: any = {};
      if (filters?.category && filters.category !== "ALL") {
        query.category = filters.category;
      }
      if (filters?.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
        ];
      }
      if (filters?.city && filters.city !== "ALL") {
        query.city = filters.city;
      }
      if (filters?.maxPrice) {
        query.ratePerDay = { $lte: filters.maxPrice };
      }

      const docs = await Tool.find(query).sort({ featured: -1, createdAt: -1 });
      return docs.map((d: any) => ({
        id: d._id.toString(),
        _id: d._id.toString(),
        title: d.title,
        description: d.description,
        category: d.category,
        condition: d.condition,
        ratePerDay: d.ratePerDay,
        deposit: d.deposit,
        images: d.images,
        city: d.city,
        address: d.address,
        specs: d.specs instanceof Map ? Object.fromEntries(d.specs) : (d.specs || {}),
        ownerName: d.ownerName,
        isAvailable: d.isAvailable,
        rating: d.rating,
        reviewsCount: d.reviewsCount,
        featured: d.featured,
        model3DType: d.model3DType,
        createdAt: d.createdAt?.toISOString(),
      }));
    } catch (e) {
      console.warn("MongoDB query failed, using memory store:", e);
    }
  }

  // Memory fallback
  let list = [...memoryStore.tools];
  if (filters?.category && filters.category !== "ALL") {
    list = list.filter((t) => t.category === filters.category);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter((t) => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
  }
  if (filters?.city && filters.city !== "ALL") {
    list = list.filter((t) => t.city.toLowerCase() === filters.city?.toLowerCase());
  }
  if (filters?.maxPrice) {
    list = list.filter((t) => t.ratePerDay <= filters.maxPrice!);
  }
  return list;
}

export async function getToolById(id: string): Promise<ToolItem | null> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      await seedMongoIfEmpty();
      const { Tool } = await getModels();
      let doc: any = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        doc = await Tool.findById(id);
      }
      if (!doc) {
        doc = await Tool.findOne({ title: { $regex: id.replace(/-/g, " "), $options: "i" } });
      }
      if (doc) {
        return {
          id: doc._id.toString(),
          _id: doc._id.toString(),
          title: doc.title,
          description: doc.description,
          category: doc.category,
          condition: doc.condition,
          ratePerDay: doc.ratePerDay,
          deposit: doc.deposit,
          images: doc.images,
          city: doc.city,
          address: doc.address,
          specs: doc.specs instanceof Map ? Object.fromEntries(doc.specs) : (doc.specs || {}),
          ownerName: doc.ownerName,
          isAvailable: doc.isAvailable,
          rating: doc.rating,
          reviewsCount: doc.reviewsCount,
          featured: doc.featured,
          model3DType: doc.model3DType,
          createdAt: doc.createdAt?.toISOString(),
        };
      }
    } catch (e) {
      console.warn("MongoDB getToolById failed:", e);
    }
  }

  const found = memoryStore.tools.find((t) => t.id === id || t._id === id);
  return found || null;
}

export async function createTool(data: Partial<ToolItem>): Promise<ToolItem> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const { Tool } = await getModels();
      const doc = await Tool.create({
        title: data.title,
        description: data.description,
        category: data.category,
        condition: data.condition || "LIKE_NEW",
        ratePerDay: Number(data.ratePerDay),
        deposit: Number(data.deposit || 0),
        images: data.images && data.images.length > 0 ? data.images : ["/assets/drill machine.png"],
        city: data.city || "Mumbai",
        address: data.address || "Andheri, Mumbai",
        specs: data.specs || {},
        ownerName: data.ownerName || "Tool Owner",
        isAvailable: true,
        rating: 5.0,
        reviewsCount: 1,
        featured: Boolean(data.featured),
        model3DType: data.model3DType || "drill",
      });

      return {
        id: doc._id.toString(),
        _id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        category: doc.category as any,
        condition: doc.condition as any,
        ratePerDay: doc.ratePerDay,
        deposit: doc.deposit,
        images: doc.images,
        city: doc.city,
        address: doc.address,
        specs: doc.specs instanceof Map ? Object.fromEntries(doc.specs) : (doc.specs || {}),
        ownerName: doc.ownerName,
        isAvailable: doc.isAvailable,
        rating: doc.rating,
        reviewsCount: doc.reviewsCount,
        featured: doc.featured,
        model3DType: doc.model3DType,
        createdAt: doc.createdAt?.toISOString(),
      };
    } catch (e) {
      console.warn("MongoDB createTool failed, falling back to memory:", e);
    }
  }

  const newItem: ToolItem = {
    id: `tool-${Date.now()}`,
    title: data.title || "Untitled Tool",
    description: data.description || "",
    category: data.category || "POWER_TOOLS",
    condition: data.condition || "LIKE_NEW",
    ratePerDay: Number(data.ratePerDay) || 300,
    deposit: Number(data.deposit) || 500,
    images: data.images && data.images.length > 0 ? data.images : ["/assets/drill machine.png"],
    city: data.city || "Mumbai",
    address: data.address || "Mumbai Central",
    specs: data.specs || {},
    ownerName: data.ownerName || "Current User",
    isAvailable: true,
    rating: 5.0,
    reviewsCount: 1,
    featured: false,
    model3DType: data.model3DType || "drill",
    createdAt: new Date().toISOString(),
  };
  memoryStore.tools.unshift(newItem);
  return newItem;
}

export async function getBookings(userEmail?: string): Promise<BookingItem[]> {
  const { isConnected } = await connectToDatabase();

  const isBorrowerMatch = userEmail ? (userEmail.toLowerCase().includes("borrower") || userEmail === "bob_borrower@example.com") : false;
  const isOwnerMatch = userEmail ? (userEmail.toLowerCase().includes("owner") || userEmail === "john_owner@example.com" || userEmail === "alice_owner@example.com") : false;

  if (isConnected) {
    try {
      const { Booking } = await getModels();
      const query: any = {};
      if (userEmail) {
        const emails = [userEmail];
        if (isBorrowerMatch) emails.push("bob_borrower@example.com", "borrower@toolshare.in");
        if (isOwnerMatch) emails.push("john_owner@example.com", "alice_owner@example.com", "owner@toolshare.in");
        query.$or = [{ renterEmail: { $in: emails } }, { ownerEmail: { $in: emails } }];
      }
      const docs = await Booking.find(query).sort({ createdAt: -1 });
      return docs.map((d: any) => ({
        id: d._id.toString(),
        _id: d._id.toString(),
        toolId: d.tool?.toString() || d.toolTitle,
        toolTitle: d.toolTitle,
        toolPhoto: d.toolPhoto,
        renterName: d.renterName,
        renterEmail: d.renterEmail,
        ownerName: d.ownerName,
        startDate: d.startDate,
        endDate: d.endDate,
        totalDays: d.totalDays,
        ratePerDay: d.ratePerDay,
        deposit: d.deposit,
        totalPrice: d.totalPrice,
        status: d.status,
        initialMsg: d.initialMsg,
        isSigned: d.isSigned,
        actualStartTime: d.actualStartTime?.toISOString(),
        messages: d.messages || [],
        createdAt: d.createdAt?.toISOString(),
      }));
    } catch (e) {
      console.warn("MongoDB getBookings failed:", e);
    }
  }

  if (userEmail) {
    return memoryStore.bookings.filter((b) => {
      if (b.renterEmail === userEmail) return true;
      if (isBorrowerMatch && (b.renterEmail === "bob_borrower@example.com" || b.renterEmail === "borrower@toolshare.in")) return true;
      if (isOwnerMatch) return true;
      return false;
    });
  }
  return memoryStore.bookings;
}

export async function createBooking(data: Partial<BookingItem>): Promise<BookingItem> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const { Booking } = await getModels();
      const doc = await Booking.create({
        tool: data.toolId && data.toolId.match(/^[0-9a-fA-F]{24}$/) ? data.toolId : undefined,
        toolTitle: data.toolTitle,
        toolPhoto: data.toolPhoto || "/assets/drill machine.png",
        renterName: data.renterName || "Borrower",
        renterEmail: data.renterEmail || "user@example.com",
        ownerName: data.ownerName || "Owner",
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays: data.totalDays || 1,
        ratePerDay: data.ratePerDay || 0,
        deposit: data.deposit || 0,
        totalPrice: data.totalPrice || 0,
        status: "CONFIRMED",
        initialMsg: data.initialMsg || "",
        isSigned: true,
        messages: [],
      });

      return {
        id: doc._id.toString(),
        _id: doc._id.toString(),
        toolId: data.toolId || doc._id.toString(),
        toolTitle: doc.toolTitle,
        toolPhoto: doc.toolPhoto,
        renterName: doc.renterName,
        renterEmail: doc.renterEmail,
        ownerName: doc.ownerName,
        startDate: doc.startDate,
        endDate: doc.endDate,
        totalDays: doc.totalDays,
        ratePerDay: doc.ratePerDay,
        deposit: doc.deposit,
        totalPrice: doc.totalPrice,
        status: doc.status,
        initialMsg: doc.initialMsg,
        isSigned: doc.isSigned,
        messages: [],
        createdAt: doc.createdAt?.toISOString(),
      };
    } catch (e) {
      console.warn("MongoDB createBooking failed:", e);
    }
  }

  const newBooking: BookingItem = {
    id: `b-${Date.now()}`,
    toolId: data.toolId || "tool-1",
    toolTitle: data.toolTitle || "Tool Rental",
    toolPhoto: data.toolPhoto || "/assets/drill machine.png",
    renterName: data.renterName || "Borrower",
    renterEmail: data.renterEmail || "bob_borrower@example.com",
    ownerName: data.ownerName || "John Owner",
    startDate: data.startDate || new Date().toISOString().split("T")[0],
    endDate: data.endDate || new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    totalDays: data.totalDays || 2,
    ratePerDay: data.ratePerDay || 450,
    deposit: data.deposit || 1500,
    totalPrice: data.totalPrice || 900,
    status: "CONFIRMED",
    initialMsg: data.initialMsg || "",
    isSigned: true,
    messages: [],
    createdAt: new Date().toISOString(),
  };

  memoryStore.bookings.unshift(newBooking);
  return newBooking;
}

export async function updateBookingStatus(id: string, status: BookingItem["status"]): Promise<boolean> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        const { Booking } = await getModels();
        await Booking.findByIdAndUpdate(id, { status });
        return true;
      }
    } catch (e) {
      console.warn("MongoDB updateBookingStatus failed:", e);
    }
  }

  const b = memoryStore.bookings.find((item) => item.id === id || item._id === id);
  if (b) {
    b.status = status;
    return true;
  }
  return false;
}

export async function toggleWishlist(userEmail: string, toolId: string): Promise<boolean> {
  if (!memoryStore.wishlists[userEmail]) {
    memoryStore.wishlists[userEmail] = [];
  }
  const arr = memoryStore.wishlists[userEmail];
  const idx = arr.indexOf(toolId);
  if (idx > -1) {
    arr.splice(idx, 1);
    return false; // Removed
  } else {
    arr.push(toolId);
    return true; // Added
  }
}

export async function getWishlist(userEmail: string): Promise<ToolItem[]> {
  const ids = memoryStore.wishlists[userEmail] || [];
  const tools = await getTools();
  return tools.filter((t) => ids.includes(t.id) || (t._id && ids.includes(t._id)));
}

export async function addBookingMessage(
  bookingId: string,
  msg: { senderName: string; senderEmail: string; text: string }
): Promise<{ success: boolean; message?: any; messages?: any[] }> {
  const newMsg = {
    senderName: msg.senderName,
    senderEmail: msg.senderEmail,
    text: msg.text,
    timestamp: new Date().toISOString(),
  };

  const { isConnected } = await connectToDatabase();
  if (isConnected) {
    try {
      if (bookingId.match(/^[0-9a-fA-F]{24}$/)) {
        const { Booking } = await getModels();
        const doc = await Booking.findByIdAndUpdate(
          bookingId,
          { $push: { messages: newMsg } },
          { new: true }
        );
        if (doc) {
          return { success: true, message: newMsg, messages: doc.messages };
        }
      }
    } catch (e) {
      console.warn("MongoDB addBookingMessage failed:", e);
    }
  }

  const booking = memoryStore.bookings.find(
    (b) => b.id === bookingId || b._id === bookingId
  );
  if (booking) {
    if (!booking.messages) booking.messages = [];
    booking.messages.push(newMsg);
    return { success: true, message: newMsg, messages: booking.messages };
  }

  return { success: false };
}

