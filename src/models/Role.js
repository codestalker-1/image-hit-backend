import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permission: { type: mongoose.Schema.Types.ObjectId, ref: "Permission" },
});

export default mongoose.model("Role", RoleSchema);
