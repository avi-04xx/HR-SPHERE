import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Organization } from "../models/Organization.js";
import { User } from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

router.post("/register", async (req, res, next) => {
  try {
    const { companyName, adminName, email, password } = req.body;
    if (!companyName || !adminName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    let baseSlug = slugify(companyName) || "company";
    let slug = baseSlug;
    let n = 1;
    while (await Organization.findOne({ slug })) {
      slug = `${baseSlug}-${n++}`;
    }

    const org = await Organization.create({ name: companyName.trim(), slug });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.trim().toLowerCase(),
      passwordHash,
      name: adminName.trim(),
      role: "org_admin",
      organization: org._id,
    });

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        organizationId: org._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organization: { id: org._id, name: org.name, slug: org.slug },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        organizationId: user.organization.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const org = await Organization.findById(user.organization);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organization: org
        ? { id: org._id, name: org.name, slug: org.slug }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const org = await Organization.findById(user.organization);
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organization: org
        ? { id: org._id, name: org.name, slug: org.slug }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
