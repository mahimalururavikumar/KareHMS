import mongoose from "mongoose";
import { Schema } from "mongoose";

const doctotSchema = new mongoose.Schema({
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
  acceptedAppointment: [
    {
      appointmentId: {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    }
  ],
  appointments: [
    {
      requests: {
        type: String,
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      userName: {
        type: String,
      },
      type: {
        type: String,
        enum: ["info", "alert", "reminder", "accepted", "declined", "pending"],
        default: "info",
      },
      time: {
        type: String,
      },
      date: {
        type: String,
      },
      duration: {
        type: String,
        default: "30 Minutes",
      },
    },
  ],
  isDoctor: {
    type: Boolean,
    default: false
  },
  degree: {
    type: String,
  },
  address: {
    type: String,
  },
  experience: {
    type: Number,
  },
  specialist: {
    type: String,
  },
  timings: {
    start: {
      type: String,
    },
    end: {
      type: String,
    },
  },
  notifications: [
    {
      message: { type: String, required: true },
      date: { type: Date, default: Date.now },
      status: { type: String, default: "unread" },
    },
  ],
  fees: {
    type: Number,
    default: 500,
  },
});

const doctorModel = mongoose.model("Doctor", doctotSchema);

export default doctorModel;
