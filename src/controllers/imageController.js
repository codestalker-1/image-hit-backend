import { getImage } from "../services/transform.js";

export const transformToController = (req, res) => {
  return getImage(req, res);
};
