import mongoose from "mongoose";
import bcrypt from "bcrypt";
import AuditableSchema from "./Auditable.js";

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lastLoginAt: { type: Date },
});

UserSchema.add(AuditableSchema);

export default mongoose.model("User", UserSchema);
