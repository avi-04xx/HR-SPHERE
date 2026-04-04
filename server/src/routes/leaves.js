import { Router } from "express";
import { LeaveRequest } from "../models/LeaveRequest.js";
import { Employee } from "../models/Employee.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    const list = await LeaveRequest.find({ organization: req.user.organizationId })
      .populate("employee", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { employeeId, type, startDate, endDate, reason } = req.body;
    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({ message: "employeeId, startDate, endDate required" });
    }

    const emp = await Employee.findOne({
      _id: employeeId,
      organization: req.user.organizationId,
    });
    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const leave = await LeaveRequest.create({
      organization: req.user.organizationId,
      employee: employeeId,
      type: type || "annual",
      startDate,
      endDate,
      reason: reason || "",
      status: "pending",
    });
    const populated = await LeaveRequest.findById(leave._id).populate(
      "employee",
      "firstName lastName email"
    );
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const doc = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organizationId },
      { status },
      { new: true }
    ).populate("employee", "firstName lastName email");

    if (!doc) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

export default router;
