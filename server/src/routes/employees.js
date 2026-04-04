import { Router } from "express";
import { Employee } from "../models/Employee.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    const orgId = req.user.organizationId;
    const employees = await Employee.find({ organization: orgId }).sort({
      lastName: 1,
      firstName: 1,
    });
    res.json(employees);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const doc = await Employee.findOne({
      _id: req.params.id,
      organization: req.user.organizationId,
    });
    if (!doc) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body;
    const employee = await Employee.create({
      organization: req.user.organizationId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      department: body.department || "",
      jobTitle: body.jobTitle || "",
      hireDate: body.hireDate || null,
      baseSalary: Number(body.baseSalary) || 0,
      status: body.status || "active",
    });
    res.status(201).json(employee);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already used for an employee in this org" });
    }
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const body = req.body;
    const doc = await Employee.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organizationId },
      {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        department: body.department,
        jobTitle: body.jobTitle,
        hireDate: body.hireDate,
        baseSalary: body.baseSalary != null ? Number(body.baseSalary) : undefined,
        status: body.status,
      },
      { new: true, runValidators: true }
    );
    if (!doc) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(doc);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email conflict" });
    }
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await Employee.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organizationId,
    });
    if (!result) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
