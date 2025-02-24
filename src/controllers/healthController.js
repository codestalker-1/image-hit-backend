import { ok, server_running } from "../utils/StringConstants.js";

export const checkHealth = (req, res) => {
  return res.status(200).json({
    status: ok,
    message: server_running,
  });
};
