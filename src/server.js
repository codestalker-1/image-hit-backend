import express from "express";
import cors from "cors";
import config from "./config/config.js";
import logger from "./utils/logger.js";
import connectDB from "./db/connectDb.js";
import authRoutes from "./routes/authRoutes.js";
import healthRoute from "./routes/healthRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

const environment = process.env.ENVIRONMENT || "development";
const PORT = config.PORT;

const app = express();
app.use(cors());
app.use(express.json());

connectDB();
app.use("/api/v1/auth", authRoutes);
app.use("/health", healthRoute);
app.use("/*", imageRoutes);

app.listen(PORT, () => {
  logger.warn(`Server running in ${environment} mode on port ${PORT}`);
});
