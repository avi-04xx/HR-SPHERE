import { Router } from "express";
import { PerformanceReview } from "../models/PerformanceReview.js";
import { Employee } from "../models/Employee.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    const list = await PerformanceReview.find({
      organization: req.user.organizationId,
    })
      .populate("employee", "firstName lastName email jobTitle")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { employeeId, periodLabel, rating, summary, goals, reviewerName } =
      req.body;

    if (!employeeId || !periodLabel || rating == null) {
      return res.status(400).json({
        message: "employeeId, periodLabel, and rating are required",
      });
    }

    const emp = await Employee.findOne({
      _id: employeeId,
      organization: req.user.organizationId,
    });
    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const review = await PerformanceReview.create({
      organization: req.user.organizationId,
      employee: employeeId,
      periodLabel: String(periodLabel).trim(),
      rating: Number(rating),
      summary: summary || "",
      goals: goals || "",
      reviewerName: reviewerName || "",
    });

    const populated = await PerformanceReview.findById(review._id).populate(
      "employee",
      "firstName lastName email"
    );
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

export default router;
