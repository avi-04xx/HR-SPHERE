import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    department: { type: String, default: "", trim: true },
    jobTitle: { type: String, default: "", trim: true },
    hireDate: { type: Date, default: null },
    baseSalary: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "on_leave", "terminated"],
      default: "active",
    },
  },
  { timestamps: true }
);

employeeSchema.index({ organization: 1, email: 1 }, { unique: true });

export const Employee = mongoose.model("Employee", employeeSchema);
