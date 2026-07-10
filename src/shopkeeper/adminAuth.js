import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prismaConfig.js";

export const adminAuthRouter = Router();

// Middleware: verify admin JWT
const adminMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    if (!decoded.adminid) return res.status(403).json({ success: false, message: "Not an admin token" });
    req.adminid = decoded.adminid;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/* --------------------------------------------------
   POST /owner/admin/login
-------------------------------------------------- */
adminAuthRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ adminid: admin.id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    return res.status(200).json({
      success: true,
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
});

/* --------------------------------------------------
   POST /owner/admin/create  (protected — existing admin only)
-------------------------------------------------- */
adminAuthRouter.post("/create", adminMiddleware, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "name, email and password are required" });
    }

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Admin with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({ data: { name, email, password: hashed } });

    return res.status(201).json({
      success: true,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("Create admin error:", err);
    return res.status(500).json({ success: false, message: "Failed to create admin" });
  }
});

/* --------------------------------------------------
   GET /owner/admin/me  (protected)
-------------------------------------------------- */
adminAuthRouter.get("/me", adminMiddleware, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.adminid },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    return res.status(200).json({ success: true, admin });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
});
