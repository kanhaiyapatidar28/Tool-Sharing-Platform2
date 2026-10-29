import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "owner" | "borrower" | "admin";
  isOwner: boolean;
  avatar?: string;
  phone?: string;
  bio?: string;
  city?: string;
  rating?: number;
  reviewsCount?: number;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role: { type: String, enum: ["owner", "borrower", "admin"], default: "borrower" },
    isOwner: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "+91 98765 43210" },
    bio: { type: String, default: "Passionate DIYer and community builder." },
    city: { type: String, default: "Mumbai" },
    rating: { type: Number, default: 4.9 },
    reviewsCount: { type: Number, default: 12 },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
