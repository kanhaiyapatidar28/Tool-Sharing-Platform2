import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  tool: mongoose.Types.ObjectId;
  toolTitle: string;
  toolPhoto: string;
  renter?: mongoose.Types.ObjectId;
  renterName: string;
  renterEmail: string;
  ownerId?: mongoose.Types.ObjectId;
  ownerName: string;
  ownerEmail?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  ratePerDay: number;
  deposit: number;
  totalPrice: number;
  status: "PENDING" | "APPROVED" | "CONFIRMED" | "RENTED" | "RETURNED" | "COMPLETED" | "CANCELLED";
  initialMsg?: string;
  isSigned: boolean;
  idempotencyKey?: string;
  actualStartTime?: Date;
  messages: Array<{
    senderName: string;
    senderEmail: string;
    senderRole?: "owner" | "borrower";
    text: string;
    timestamp: Date;
  }>;
  createdAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    tool: { type: Schema.Types.ObjectId, ref: "Tool", required: true, index: true },
    toolTitle: { type: String, required: true },
    toolPhoto: { type: String, default: "" },
    renter: { type: Schema.Types.ObjectId, ref: "User" },
    renterName: { type: String, default: "Borrower" },
    renterEmail: { type: String, default: "", index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    ownerName: { type: String, default: "Owner" },
    ownerEmail: { type: String, default: "", index: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    totalDays: { type: Number, default: 1 },
    ratePerDay: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "CONFIRMED", "RENTED", "RETURNED", "COMPLETED", "CANCELLED"],
      default: "CONFIRMED",
      index: true,
    },
    initialMsg: { type: String, default: "" },
    isSigned: { type: Boolean, default: true },
    idempotencyKey: { type: String, sparse: true, index: true },
    actualStartTime: { type: Date },
    messages: [
      {
        senderName: { type: String },
        senderEmail: { type: String },
        senderRole: { type: String, enum: ["owner", "borrower"] },
        text: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for fast overlapping availability scans
BookingSchema.index({ tool: 1, status: 1, startDate: 1, endDate: 1 });

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
export default Booking;
