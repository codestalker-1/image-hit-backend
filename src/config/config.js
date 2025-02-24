import path from "path";
import fs from "fs";
import { config } from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config(); // Load .env file

const ENV = process.env.ENVIRONMENT || "development";
const configPath = path.resolve(__dirname, "envConfigurations", `${ENV}.json`);

if (!fs.existsSync(configPath)) {
  throw new Error(`Configuration file for '${ENV}' environment is missing!`);
}

const loadedConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
export default loadedConfig;
