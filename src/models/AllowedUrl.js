import mongoose from "mongoose";
import AuditableSchema from "./Auditable.js";

const allowedUrlSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
});
allowedUrlSchema.add(AuditableSchema);

const AllowedUrl = mongoose.model("AllowedUrl", allowedUrlSchema);
export default AllowedUrl;
