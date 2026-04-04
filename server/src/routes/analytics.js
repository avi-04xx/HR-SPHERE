import { Router } from "express";
import mongoose from "mongoose";
import { Employee } from "../models/Employee.js";
import { LeaveRequest } from "../models/LeaveRequest.js";
import { PayrollRecord } from "../models/PayrollRecord.js";
import { PerformanceReview } from "../models/PerformanceReview.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/summary", async (req, res, next) => {
  try {
    const orgStr = req.user.organizationId;
    const orgOid = new mongoose.Types.ObjectId(orgStr);

    const [
      employeeCount,
      activeCount,
      pendingLeaves,
      payrollThisMonth,
      avgRatingAgg,
    ] = await Promise.all([
      Employee.countDocuments({ organization: orgStr }),
      Employee.countDocuments({ organization: orgStr, status: "active" }),
      LeaveRequest.countDocuments({
        organization: orgStr,
        status: "pending",
      }),
      PayrollRecord.aggregate([
        {
          $match: {
            organization: orgOid,
            periodYear: new Date().getFullYear(),
            periodMonth: new Date().getMonth() + 1,
          },
        },
        { $group: { _id: null, totalNet: { $sum: "$netPay" } } },
      ]),
      PerformanceReview.aggregate([
        { $match: { organization: orgOid } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
    ]);

    const monthNet =
      payrollThisMonth[0]?.totalNet != null ? payrollThisMonth[0].totalNet : 0;
    const avgRating =
      avgRatingAgg[0]?.avg != null ? Math.round(avgRatingAgg[0].avg * 10) / 10 : null;

    res.json({
      employees: employeeCount,
      activeEmployees: activeCount,
      pendingLeaveRequests: pendingLeaves,
      currentMonthPayrollNet: monthNet,
      averageReviewRating: avgRating,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
