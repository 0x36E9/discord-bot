import mongoose from "mongoose";

const schema = new mongoose.Schema({
  key: { type: String, required: true },
  hwid: { type: String, default: "not set" },
  last_ip: { type: String, default: "not set" },
  last_change: { type: Number, default: 0 },
  banned: { type: Boolean, default: false },
});

export default mongoose.model<
  mongoose.Document & {
    key?: string;
    hwid?: string;
    last_ip?: string;
    last_change?: number;
    banned?: boolean;
  }
>("User", schema);
