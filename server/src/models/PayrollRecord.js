import mongoose from "mongoose";

const payrollRecordSchema = new mongoose.Schema(
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
    periodYear: { type: Number, required: true },
    periodMonth: { type: Number, required: true, min: 1, max: 12 },
    grossPay: { type: Number, required: true, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    netPay: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["draft", "processed", "paid"],
      default: "draft",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

payrollRecordSchema.index(
  { organization: 1, employee: 1, periodYear: 1, periodMonth: 1 },
  { unique: true }
);

export const PayrollRecord = mongoose.model("PayrollRecord", payrollRecordSchema);
