import mongoose from "mongoose";
import AuditableSchema from "./Auditable.js";

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lastLoginAt: { type: Date },
  isAdmin: { type: Boolean, default: false },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
});

UserSchema.add(AuditableSchema);

export default mongoose.model("User", UserSchema);
