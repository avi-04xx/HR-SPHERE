import { Router } from "express";
import { PayrollRecord } from "../models/PayrollRecord.js";
import { Employee } from "../models/Employee.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const filter = { organization: req.user.organizationId };
    if (year) filter.periodYear = Number(year);
    if (month) filter.periodMonth = Number(month);

    const list = await PayrollRecord.find(filter)
      .populate("employee", "firstName lastName email department")
      .sort({ periodYear: -1, periodMonth: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      employeeId,
      periodYear,
      periodMonth,
      grossPay,
      deductions,
      netPay,
      status,
      notes,
    } = req.body;

    if (!employeeId || !periodYear || !periodMonth || grossPay == null) {
      return res.status(400).json({
        message: "employeeId, periodYear, periodMonth, grossPay required",
      });
    }

    const emp = await Employee.findOne({
      _id: employeeId,
      organization: req.user.organizationId,
    });
    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const ded = Number(deductions) || 0;
    const gross = Number(grossPay);
    const net =
      netPay != null && netPay !== ""
        ? Number(netPay)
        : Math.max(0, gross - ded);

    const record = await PayrollRecord.create({
      organization: req.user.organizationId,
      employee: employeeId,
      periodYear: Number(periodYear),
      periodMonth: Number(periodMonth),
      grossPay: gross,
      deductions: ded,
      netPay: net,
      status: status || "draft",
      notes: notes || "",
    });

    const populated = await PayrollRecord.findById(record._id).populate(
      "employee",
      "firstName lastName email"
    );
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Payroll for this employee and period already exists",
      });
    }
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const body = req.body;
    const updates = {};
    if (body.grossPay != null) updates.grossPay = Number(body.grossPay);
    if (body.deductions != null) updates.deductions = Number(body.deductions);
    if (body.netPay != null) updates.netPay = Number(body.netPay);
    if (body.status) updates.status = body.status;
    if (body.notes != null) updates.notes = body.notes;

    const doc = await PayrollRecord.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organizationId },
      updates,
      { new: true }
    ).populate("employee", "firstName lastName email");

    if (!doc) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

export default router;
