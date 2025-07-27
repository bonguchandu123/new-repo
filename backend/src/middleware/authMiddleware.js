import jwt from "jsonwebtoken"
import User from "../models/User.js";
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔐 Incoming Header:", authHeader);

  const token = authHeader?.split(" ")[1];
  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    console.log("❌ JWT error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
