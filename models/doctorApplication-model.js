import mongoose from "mongoose";
import { Schema } from "mongoose";

const doctorApplicationSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  degree: { type: String, required: true },
  experience: { type: Number, required: true },
  fees: { type: Number, required: true},
  specialist: { type: String, required: true },
  address: {
    type: String,
    required: true,
  },
  timings: {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "removedAccess"],
    default: "pending",
  },
});

const doctorApplicationModel = mongoose.model(
  "DoctorApplication",
  doctorApplicationSchema
);

export default doctorApplicationModel;
