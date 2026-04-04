import mongoose from "mongoose";

const performanceReviewSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    reviewerName: { type: String, default: "", trim: true },
    periodLabel: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    summary: { type: String, default: "" },
    goals: { type: String, default: "" },
  },
  { timestamps: true }
);

export const PerformanceReview = mongoose.model(
  "PerformanceReview",
  performanceReviewSchema
);
