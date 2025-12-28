// src/utils/refrel.js
import { v4 as uuidv4 } from "uuid";

export function generateReferralId() {
  return uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
}
