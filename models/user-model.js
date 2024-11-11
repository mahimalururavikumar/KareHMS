import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  contact: {
    type: String,
  },
  appointments: [
    {
      appointmentId: {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
      },
      type: {
        type: String,
        enum: ["info", "alert", "reminder", "accepted", "declined", "pending"],
        default: "info",
      },
      doctorId : {
        type : Schema.Types.ObjectId,
        ref: 'Doctor'
      }
    }
  ],
  isadmin: {
    type: Boolean,
    default: false,
  },
  isDoctor: {
    type: Boolean,
    default: false,
  },
  doctorApplication: {
    type: String,
    enum: ["pending", "accepted", "declined", "removedAccess"],
    default: "pending",
  },
  notification: [
    {
      message: { type: String, required: true },
      date: { type: Date, default: Date.now },
      status: { type: String, default: "unread" },
      type: {
        type: String,
        enum: [
          "info",
          "alert",
          "reminder",
          "accepted",
          "declined",
          "pending",
          "rejected",
        ],
        default: "info",
      },
    },
  ],
});

const userModel = mongoose.model("User", userSchema);

export default userModel;
