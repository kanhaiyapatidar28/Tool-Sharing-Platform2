import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITool extends Document {
  title: string;
  description: string;
  category: string;
  condition: "BRAND_NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
  ratePerDay: number;
  deposit: number;
  images: string[];
  city: string;
  address: string;
  pickupArea?: string;
  specs: Record<string, string>;
  owner?: mongoose.Types.ObjectId;
  ownerId?: string | mongoose.Types.ObjectId;
  ownerName: string;
  ownerEmail?: string;
  isAvailable: boolean;
  isPublished: boolean;
  publicId: string;
  rating: number;
  reviewsCount: number;
  featured?: boolean;
  model3DType?: string;
  createdAt: Date;
}

const ToolSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["POWER_TOOLS", "HAND_TOOLS", "GARDEN", "HEAVY_EQUIPMENT", "WOODWORKING", "CLEANING"],
      index: true,
    },
    condition: {
      type: String,
      required: true,
      enum: ["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR"],
      default: "LIKE_NEW",
    },
    ratePerDay: { type: Number, required: true, index: true },
    deposit: { type: Number, default: 0 },
    images: [{ type: String }],
    city: { type: String, default: "Mumbai", index: true },
    address: { type: String, default: "Andheri West, Mumbai" },
    pickupArea: { type: String, default: "Andheri West" },
    specs: { type: Map, of: String, default: {} },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    ownerId: { type: String, index: true },
    ownerName: { type: String, default: "Tool Owner" },
    ownerEmail: { type: String, default: "", index: true },
    isAvailable: { type: Boolean, default: true, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    publicId: { type: String, unique: true, sparse: true, index: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 8 },
    featured: { type: Boolean, default: false, index: true },
    model3DType: { type: String, default: "drill" },
  },
  { timestamps: true }
);

ToolSchema.index({ featured: -1, createdAt: -1 });
ToolSchema.index({ isPublished: 1, isAvailable: 1 });

export const Tool: Model<ITool> =
  mongoose.models.Tool || mongoose.model<ITool>("Tool", ToolSchema);
export default Tool;
