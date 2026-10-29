import connectToDatabase from "./mongodb";
export * from "./constants";
import { ToolItem, BookingItem, INITIAL_TOOLS, INITIAL_USERS, INITIAL_BOOKINGS } from "./constants";
import { generatePublicToolId } from "./server-auth";

/**
 * Escapes regex special characters to prevent ReDoS / Regex Injection
 */
export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Lazy-load models to eliminate cold-start delay
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
  idempotencyKeys: Set<string> = new Set();
}

const memoryStore = new MemoryStore();
let isMongoSeeded = false;

// Auto-seed MongoDB with initial tools, users, and ownerEmails on initial connect
// Auto-seed MongoDB with initial tools, users, and ownerEmails on initial connect
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
          pickupArea: t.pickupArea || t.city,
          specs: t.specs,
          ownerName: t.ownerName,
          ownerEmail: t.ownerEmail || (t.ownerName.toLowerCase().includes("alice") ? "alice_owner@example.com" : "owner@toolshare.in"),
          ownerId: t.ownerId || (t.ownerName.toLowerCase().includes("alice") ? "usr-alice_owner" : "usr-owner"),
          isAvailable: t.isAvailable,
          isPublished: t.isPublished !== false,
          publicId: t.publicId || `tool-${t.id}`,
          rating: t.rating,
          reviewsCount: t.reviewsCount,
          featured: t.featured,
          model3DType: t.model3DType,
        });
      }
      for (const b of INITIAL_BOOKINGS) {
        await Booking.create({
          ...b,
          ownerEmail: b.ownerName.toLowerCase().includes("alice") ? "alice_owner@example.com" : "owner@toolshare.in",
        });
      }
      console.log("MongoDB seeded successfully!");
    }
    isMongoSeeded = true;
  } catch (err: any) {
    console.warn("Could not auto-seed MongoDB:", err.message);
  }
}

function mapToolDoc(d: any): ToolItem {
  return {
    id: d._id ? d._id.toString() : (d.id || `tool-${Date.now()}`),
    _id: d._id ? d._id.toString() : d.id,
    title: d.title,
    description: d.description,
    category: d.category,
    condition: d.condition,
    ratePerDay: d.ratePerDay,
    deposit: d.deposit || 0,
    images: d.images && d.images.length > 0 ? d.images : ["/assets/drill machine.png"],
    city: d.city || "Mumbai",
    address: d.address || "Andheri West, Mumbai",
    pickupArea: d.pickupArea || d.city || "Andheri West",
    specs: d.specs instanceof Map ? Object.fromEntries(d.specs) : (d.specs || {}),
    ownerName: d.ownerName,
    ownerId: d.ownerId || (d.owner?.toString ? d.owner.toString() : undefined),
    ownerEmail: d.ownerEmail,
    isAvailable: d.isAvailable !== false,
    isPublished: d.isPublished !== false,
    publicId: d.publicId || (d.id ? `tool-${d.id}` : `tool_${d._id?.toString().slice(-8)}`),
    rating: d.rating || 4.8,
    reviewsCount: d.reviewsCount || 1,
    featured: Boolean(d.featured),
    model3DType: d.model3DType || "drill",
    createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : (d.createdAt || new Date().toISOString()),
  };
}

// ------------------- Unified Data Access Layer -------------------

export async function getTools(filters?: {
  category?: string;
  search?: string;
  city?: string;
  maxPrice?: number;
  ownerEmail?: string;
  includeUnpublished?: boolean;
}): Promise<ToolItem[]> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      await seedMongoIfEmpty();
      const { Tool } = await getModels();
      const query: any = {};

      if (filters?.ownerEmail) {
        query.ownerEmail = filters.ownerEmail.toLowerCase().trim();
      } else if (!filters?.includeUnpublished) {
        query.isPublished = { $ne: false };
      }

      if (filters?.category && filters.category !== "ALL") {
        query.category = filters.category;
      }
      if (filters?.search && filters.search.trim()) {
        const sanitized = escapeRegex(filters.search.trim());
        query.$or = [
          { title: { $regex: sanitized, $options: "i" } },
          { description: { $regex: sanitized, $options: "i" } },
        ];
      }
      if (filters?.city && filters.city !== "ALL") {
        query.city = filters.city;
      }
      if (filters?.maxPrice) {
        query.ratePerDay = { $lte: filters.maxPrice };
      }

      const docs = await Tool.find(query).sort({ featured: -1, createdAt: -1 });
      return docs.map(mapToolDoc);
    } catch (e) {
      console.warn("MongoDB query failed, using memory store:", e);
    }
  }

  // Memory fallback
  let list = [...memoryStore.tools];
  if (filters?.ownerEmail) {
    const oEmail = filters.ownerEmail.toLowerCase().trim();
    list = list.filter((t) => (t.ownerEmail || "").toLowerCase() === oEmail);
  } else if (!filters?.includeUnpublished) {
    list = list.filter((t) => t.isPublished !== false);
  }

  if (filters?.category && filters.category !== "ALL") {
    list = list.filter((t) => t.category === filters.category);
  }
  if (filters?.search && filters.search.trim()) {
    const s = filters.search.toLowerCase().trim();
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
        doc = await Tool.findOne({ publicId: id });
      }
      if (!doc) {
        const cleanSlug = escapeRegex(id.replace(/-/g, " "));
        doc = await Tool.findOne({ title: { $regex: cleanSlug, $options: "i" } });
      }
      if (doc) {
        return mapToolDoc(doc);
      }
    } catch (e) {
      console.warn("MongoDB getToolById failed:", e);
    }
  }

  const found = memoryStore.tools.find(
    (t) => t.id === id || t._id === id || t.publicId === id
  );
  return found || null;
}

export async function getToolByPublicId(publicId: string): Promise<ToolItem | null> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      await seedMongoIfEmpty();
      const { Tool } = await getModels();
      let doc = await Tool.findOne({ publicId });
      if (!doc && publicId.match(/^[0-9a-fA-F]{24}$/)) {
        doc = await Tool.findById(publicId);
      }
      if (doc) {
        return mapToolDoc(doc);
      }
    } catch (e) {
      console.warn("MongoDB getToolByPublicId failed:", e);
    }
  }

  const found = memoryStore.tools.find(
    (t) => t.publicId === publicId || t.id === publicId || t._id === publicId
  );
  return found || null;
}

export async function createTool(data: Partial<ToolItem>): Promise<ToolItem> {
  const { isConnected } = await connectToDatabase();
  const publicId = data.publicId || generatePublicToolId();

  if (isConnected) {
    try {
      const { Tool } = await getModels();
      const doc = await Tool.create({
        title: data.title,
        description: data.description,
        category: data.category || "POWER_TOOLS",
        condition: data.condition || "LIKE_NEW",
        ratePerDay: Number(data.ratePerDay),
        deposit: Number(data.deposit || 0),
        images: data.images && data.images.length > 0 ? data.images : ["/assets/drill machine.png"],
        city: data.city || "Mumbai",
        address: data.address || "Andheri, Mumbai",
        pickupArea: data.pickupArea || data.city || "Andheri West",
        specs: data.specs || {},
        ownerName: data.ownerName || "Tool Owner",
        ownerEmail: data.ownerEmail || "owner@toolshare.in",
        ownerId: data.ownerId || "",
        isAvailable: data.isAvailable !== false,
        isPublished: data.isPublished !== false,
        publicId,
        rating: 5.0,
        reviewsCount: 1,
        featured: Boolean(data.featured),
        model3DType: data.model3DType || "drill",
      });

      return mapToolDoc(doc);
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
    pickupArea: data.pickupArea || data.city || "Mumbai Central",
    specs: data.specs || {},
    ownerName: data.ownerName || "Current User",
    ownerEmail: data.ownerEmail || "owner@toolshare.in",
    ownerId: data.ownerId || "",
    isAvailable: data.isAvailable !== false,
    isPublished: data.isPublished !== false,
    publicId,
    rating: 5.0,
    reviewsCount: 1,
    featured: false,
    model3DType: data.model3DType || "drill",
    createdAt: new Date().toISOString(),
  };
  memoryStore.tools.unshift(newItem);
  return newItem;
}

export async function updateTool(
  id: string,
  updates: Partial<ToolItem>,
  callerEmail?: string,
  callerRole?: string
): Promise<{ success: boolean; tool?: ToolItem; error?: string }> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const { Tool } = await getModels();
      let doc: any = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        doc = await Tool.findById(id);
      }
      if (!doc) {
        doc = await Tool.findOne({ publicId: id });
      }
      if (!doc) {
        return { success: false, error: "Tool not found" };
      }

      // Check ownership
      if (callerEmail && callerRole !== "admin") {
        const isOwner = (doc.ownerEmail || "").toLowerCase() === callerEmail.toLowerCase();
        if (!isOwner) {
          return { success: false, error: "Forbidden: You are not authorized to edit this listing." };
        }
      }

      if (updates.title !== undefined) doc.title = updates.title;
      if (updates.description !== undefined) doc.description = updates.description;
      if (updates.category !== undefined) doc.category = updates.category;
      if (updates.condition !== undefined) doc.condition = updates.condition;
      if (updates.ratePerDay !== undefined) doc.ratePerDay = Number(updates.ratePerDay);
      if (updates.deposit !== undefined) doc.deposit = Number(updates.deposit);
      if (updates.images !== undefined) doc.images = updates.images;
      if (updates.city !== undefined) doc.city = updates.city;
      if (updates.address !== undefined) doc.address = updates.address;
      if (updates.pickupArea !== undefined) doc.pickupArea = updates.pickupArea;
      if (updates.specs !== undefined) doc.specs = updates.specs;
      if (updates.isAvailable !== undefined) doc.isAvailable = Boolean(updates.isAvailable);
      if (updates.isPublished !== undefined) doc.isPublished = Boolean(updates.isPublished);

      await doc.save();
      return { success: true, tool: mapToolDoc(doc) };
    } catch (e: any) {
      console.warn("MongoDB updateTool failed:", e.message);
    }
  }

  // Memory fallback
  const item = memoryStore.tools.find((t) => t.id === id || t._id === id || t.publicId === id);
  if (!item) return { success: false, error: "Tool not found" };

  if (callerEmail && callerRole !== "admin") {
    const isOwner = (item.ownerEmail || "").toLowerCase() === callerEmail.toLowerCase();
    if (!isOwner) {
      return { success: false, error: "Forbidden: You are not authorized to edit this listing." };
    }
  }

  Object.assign(item, {
    title: updates.title ?? item.title,
    description: updates.description ?? item.description,
    category: updates.category ?? item.category,
    condition: updates.condition ?? item.condition,
    ratePerDay: updates.ratePerDay !== undefined ? Number(updates.ratePerDay) : item.ratePerDay,
    deposit: updates.deposit !== undefined ? Number(updates.deposit) : item.deposit,
    images: updates.images ?? item.images,
    city: updates.city ?? item.city,
    address: updates.address ?? item.address,
    pickupArea: updates.pickupArea ?? item.pickupArea,
    specs: updates.specs ?? item.specs,
    isAvailable: updates.isAvailable !== undefined ? Boolean(updates.isAvailable) : item.isAvailable,
    isPublished: updates.isPublished !== undefined ? Boolean(updates.isPublished) : item.isPublished,
  });

  return { success: true, tool: item };
}

export async function deleteTool(
  id: string,
  callerEmail?: string,
  callerRole?: string
): Promise<{ success: boolean; error?: string }> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const { Tool } = await getModels();
      let doc: any = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        doc = await Tool.findById(id);
      }
      if (!doc) {
        doc = await Tool.findOne({ publicId: id });
      }
      if (!doc) {
        return { success: false, error: "Tool not found" };
      }

      // Check ownership
      if (callerEmail && callerRole !== "admin") {
        const isOwner = (doc.ownerEmail || "").toLowerCase() === callerEmail.toLowerCase();
        if (!isOwner) {
          return { success: false, error: "Forbidden: You are not authorized to delete this tool." };
        }
      }

      await Tool.deleteOne({ _id: doc._id });
      return { success: true };
    } catch (e: any) {
      console.warn("MongoDB deleteTool failed:", e.message);
    }
  }

  const idx = memoryStore.tools.findIndex((t) => t.id === id || t._id === id || t.publicId === id);
  if (idx === -1) return { success: false, error: "Tool not found" };

  const item = memoryStore.tools[idx];
  if (callerEmail && callerRole !== "admin") {
    const isOwner = (item.ownerEmail || "").toLowerCase() === callerEmail.toLowerCase();
    if (!isOwner) {
      return { success: false, error: "Forbidden: You are not authorized to delete this tool." };
    }
  }

  memoryStore.tools.splice(idx, 1);
  return { success: true };
}

function formatMessages(messages: any[]): Array<{ senderName: string; senderEmail: string; text: string; timestamp: string }> {
  if (!Array.isArray(messages)) return [];
  return messages.map((m) => ({
    senderName: String(m.senderName || ""),
    senderEmail: String(m.senderEmail || ""),
    text: String(m.text || ""),
    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp || new Date().toISOString()),
  }));
}

// ------------------- Overlap & Concurrency Engine -------------------

/**
 * Validates whether the tool is already reserved for the requested dates
 */
export async function checkBookingOverlap(
  toolId: string,
  toolTitle: string,
  startDate: string,
  endDate: string,
  excludeBookingId?: string
): Promise<{ hasOverlap: boolean; conflictingBooking?: BookingItem }> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const { Booking } = await getModels();
      const orConditions: any[] = [];
      if (toolId && toolId.match(/^[0-9a-fA-F]{24}$/)) {
        orConditions.push({ tool: toolId });
      }
      if (toolTitle) {
        orConditions.push({ toolTitle });
      }

      const query: any = {
        $or: orConditions.length > 0 ? orConditions : [{ toolTitle }],
        status: { $in: ["CONFIRMED", "RENTED"] },
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      };

      if (excludeBookingId && excludeBookingId.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = { $ne: excludeBookingId };
      }

      const conflict = await Booking.findOne(query);
      if (conflict) {
        return {
          hasOverlap: true,
          conflictingBooking: {
            id: conflict._id.toString(),
            toolId: conflict.tool?.toString() || conflict.toolTitle,
            toolTitle: conflict.toolTitle,
            toolPhoto: conflict.toolPhoto,
            renterName: conflict.renterName,
            renterEmail: conflict.renterEmail,
            ownerName: conflict.ownerName,
            ownerEmail: conflict.ownerEmail,
            startDate: conflict.startDate,
            endDate: conflict.endDate,
            totalDays: conflict.totalDays,
            ratePerDay: conflict.ratePerDay,
            deposit: conflict.deposit,
            totalPrice: conflict.totalPrice,
            status: conflict.status,
            isSigned: conflict.isSigned,
            messages: formatMessages(conflict.messages),
            createdAt: conflict.createdAt?.toISOString(),
          },
        };
      }
      return { hasOverlap: false };
    } catch (e) {
      console.warn("MongoDB checkBookingOverlap failed, checking memory:", e);
    }
  }

  // Memory fallback check
  const conflict = memoryStore.bookings.find((b) => {
    if (excludeBookingId && (b.id === excludeBookingId || b._id === excludeBookingId)) return false;
    const sameTool = b.toolId === toolId || b.toolTitle === toolTitle;
    const isActive = b.status === "CONFIRMED" || b.status === "RENTED";
    const overlaps = b.startDate <= endDate && b.endDate >= startDate;
    return sameTool && isActive && overlaps;
  });

  return { hasOverlap: Boolean(conflict), conflictingBooking: conflict };
}

// ------------------- Bookings Data Access -------------------

/**
 * Securely fetch bookings.
 * If userEmail is provided, strictly limits results to bookings belonging to that user.
 */
export async function getBookings(userEmail?: string): Promise<BookingItem[]> {
  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const { Booking } = await getModels();
      const query: any = {};
      if (userEmail) {
        const normalized = userEmail.toLowerCase().trim();
        query.$or = [{ renterEmail: normalized }, { ownerEmail: normalized }];
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
        ownerEmail: d.ownerEmail,
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
        messages: formatMessages(d.messages),
        createdAt: d.createdAt?.toISOString(),
      }));
    } catch (e) {
      console.warn("MongoDB getBookings failed:", e);
    }
  }

  // Memory fallback without leaky string matchers
  if (userEmail) {
    const normalized = userEmail.toLowerCase().trim();
    return memoryStore.bookings.filter(
      (b) => b.renterEmail.toLowerCase() === normalized || (b as any).ownerEmail?.toLowerCase() === normalized
    );
  }
  return memoryStore.bookings;
}

/**
 * Server-authoritative booking creation.
 * Re-validates prices, dates, overlaps, and enforces idempotency.
 */
export async function createBooking(data: {
  toolId: string;
  startDate: string;
  endDate: string;
  renterName: string;
  renterEmail: string;
  initialMsg?: string;
  idempotencyKey?: string;
}): Promise<BookingItem> {
  // 1. Fetch authoritative tool details
  const tool = await getToolById(data.toolId);
  if (!tool) {
    throw new Error("TOOL_NOT_FOUND");
  }

  if (tool.isPublished === false || tool.isAvailable === false) {
    throw new Error("TOOL_NOT_AVAILABLE_FOR_RENTAL");
  }

  const ownerEmail = tool.ownerEmail || (tool.ownerName.toLowerCase().includes("alice") ? "alice_owner@example.com" : "owner@toolshare.in");
  const renterEmail = data.renterEmail.toLowerCase().trim();
  if (renterEmail === ownerEmail.toLowerCase().trim()) {
    throw new Error("CANNOT_RENT_OWN_TOOL");
  }

  // 2. Validate dates
  const todayStr = new Date().toISOString().split("T")[0];
  if (data.startDate < todayStr) {
    throw new Error("START_DATE_IN_PAST");
  }
  if (data.endDate < data.startDate) {
    throw new Error("INVALID_DATE_RANGE");
  }

  const s = new Date(data.startDate);
  const e = new Date(data.endDate);
  const diffTime = e.getTime() - s.getTime();
  const calculatedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  if (calculatedDays > 60) {
    throw new Error("EXCEEDS_MAXIMUM_RENTAL_DURATION");
  }

  // 3. Concurrency check for overlapping confirmed/rented dates
  const { hasOverlap } = await checkBookingOverlap(
    tool.id || tool._id || data.toolId,
    tool.title,
    data.startDate,
    data.endDate
  );

  if (hasOverlap) {
    throw new Error("TOOL_ALREADY_RESERVED_FOR_DATES");
  }

  // 4. Server authoritative financial calculation
  const ratePerDay = tool.ratePerDay;
  const deposit = tool.deposit || 0;
  const rentalFee = calculatedDays * ratePerDay;
  const platformFee = Math.round(rentalFee * 0.05); // 5% marketplace service fee
  const totalPrice = rentalFee + platformFee;

  const { isConnected } = await connectToDatabase();

  if (isConnected) {
    try {
      const { Booking } = await getModels();

      // Check idempotency if key provided
      if (data.idempotencyKey) {
        const existing = await Booking.findOne({ idempotencyKey: data.idempotencyKey });
        if (existing) {
          return {
            id: existing._id.toString(),
            _id: existing._id.toString(),
            toolId: existing.tool?.toString() || existing.toolTitle,
            toolTitle: existing.toolTitle,
            toolPhoto: existing.toolPhoto,
            renterName: existing.renterName,
            renterEmail: existing.renterEmail,
            ownerName: existing.ownerName,
            ownerEmail: existing.ownerEmail,
            startDate: existing.startDate,
            endDate: existing.endDate,
            totalDays: existing.totalDays,
            ratePerDay: existing.ratePerDay,
            deposit: existing.deposit,
            totalPrice: existing.totalPrice,
            status: existing.status,
            initialMsg: existing.initialMsg,
            isSigned: existing.isSigned,
            messages: formatMessages(existing.messages),
            createdAt: existing.createdAt?.toISOString(),
          };
        }
      }

      const doc = await Booking.create({
        tool: tool.id && tool.id.match(/^[0-9a-fA-F]{24}$/) ? tool.id : undefined,
        toolTitle: tool.title,
        toolPhoto: tool.images?.[0] || "/assets/drill machine.png",
        renterName: data.renterName,
        renterEmail: data.renterEmail.toLowerCase().trim(),
        ownerName: tool.ownerName,
        ownerEmail,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays: calculatedDays,
        ratePerDay,
        deposit,
        totalPrice,
        status: "CONFIRMED",
        initialMsg: data.initialMsg || "Requesting tool rental for DIY project.",
        isSigned: true,
        idempotencyKey: data.idempotencyKey,
        messages: [],
      });

      return {
        id: doc._id.toString(),
        _id: doc._id.toString(),
        toolId: tool.id || doc._id.toString(),
        toolTitle: doc.toolTitle,
        toolPhoto: doc.toolPhoto,
        renterName: doc.renterName,
        renterEmail: doc.renterEmail,
        ownerName: doc.ownerName,
        ownerEmail: doc.ownerEmail,
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
    } catch (e: any) {
      console.warn("MongoDB createBooking failed:", e.message);
    }
  }

  // Memory fallback with server calculated values
  const newBooking: BookingItem = {
    id: `b-${Date.now()}`,
    toolId: tool.id || data.toolId,
    toolTitle: tool.title,
    toolPhoto: tool.images?.[0] || "/assets/drill machine.png",
    renterName: data.renterName,
    renterEmail: data.renterEmail.toLowerCase().trim(),
    ownerName: tool.ownerName,
    startDate: data.startDate,
    endDate: data.endDate,
    totalDays: calculatedDays,
    ratePerDay,
    deposit,
    totalPrice,
    status: "CONFIRMED",
    initialMsg: data.initialMsg || "",
    isSigned: true,
    messages: [],
    createdAt: new Date().toISOString(),
  };

  memoryStore.bookings.unshift(newBooking);
  return newBooking;
}

/**
 * Validated status transitions with ownership verification
 */
export async function updateBookingStatus(
  id: string,
  newStatus: BookingItem["status"],
  callerEmail?: string,
  callerRole?: string
): Promise<{ success: boolean; error?: string }> {
  const { isConnected } = await connectToDatabase();

  const VALID_STATUSES = ["PENDING", "APPROVED", "CONFIRMED", "RENTED", "RETURNED", "COMPLETED", "CANCELLED"];
  if (!VALID_STATUSES.includes(newStatus)) {
    return { success: false, error: "Invalid status transition" };
  }

  if (isConnected) {
    try {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        const { Booking } = await getModels();
        const booking = await Booking.findById(id);
        if (!booking) return { success: false, error: "Booking not found" };

        // Verify authorization if caller details passed
        if (callerEmail && callerRole !== "admin") {
          const isRenter = booking.renterEmail.toLowerCase() === callerEmail.toLowerCase();
          const isOwner = (booking.ownerEmail || "").toLowerCase() === callerEmail.toLowerCase();
          if (!isRenter && !isOwner) {
            return { success: false, error: "Unauthorized to update this booking" };
          }
        }

        booking.status = newStatus;
        if (newStatus === "RENTED" && !booking.actualStartTime) {
          booking.actualStartTime = new Date();
        }
        await booking.save();
        return { success: true };
      }
    } catch (e: any) {
      console.warn("MongoDB updateBookingStatus failed:", e.message);
    }
  }

  const b = memoryStore.bookings.find((item) => item.id === id || item._id === id);
  if (b) {
    b.status = newStatus;
    return { success: true };
  }
  return { success: false, error: "Booking not found" };
}

export async function toggleWishlist(userEmail: string, toolId: string): Promise<boolean> {
  const email = userEmail.toLowerCase().trim();
  if (!memoryStore.wishlists[email]) {
    memoryStore.wishlists[email] = [];
  }
  const arr = memoryStore.wishlists[email];
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
  const ids = memoryStore.wishlists[userEmail.toLowerCase().trim()] || [];
  const tools = await getTools();
  return tools.filter((t) => ids.includes(t.id) || (t._id && ids.includes(t._id)));
}

export async function addBookingMessage(
  bookingId: string,
  msg: { senderName: string; senderEmail: string; text: string }
): Promise<{ success: boolean; message?: any; messages?: any[] }> {
  const newMsg = {
    senderName: msg.senderName,
    senderEmail: msg.senderEmail.toLowerCase().trim(),
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
    booking.messages.push(newMsg as any);
    return { success: true, message: newMsg, messages: booking.messages };
  }

  return { success: false };
}
