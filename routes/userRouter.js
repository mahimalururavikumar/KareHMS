import express from "express";
const router = express.Router();
import {
  registerUser,
  appointmentPage,
  bookAppointment,
  acceptedAppointments,
  updateProfile,
  notifications
} from "../controller/userController.js";
import upload from "../config/multer.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import userModel from "../models/user-model.js";
import doctorModel from "../models/doctor-model.js";

router.get("/dashboard", isAuthenticated ,async (req, res) => {
  const messages = {
    successs : req.flash('success'),
    error : req.flash('error')
  };
  let user = req.user;
  let doctors = await doctorModel.find();
  res.render("user", { doctors ,notifications: user.notification,messages,user});
});

router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const messages = {
      successs : req.flash('success'),
      error : req.flash('error')
    };
    let user = await userModel.findById(req.user.id);
    let notifications= user.notification
    res.render("userprofile", { user, notifications,messages});
  } catch (error) {
    console.log("error", error.message);
    req.flash("error", "error in fetching the page");
    return res.redirect("/user/dashboard");
  }
});

router.get("/notifications", isAuthenticated, notifications);

router.get("/bookAppointment/:id", isAuthenticated, appointmentPage);

router.get("/acceptedAppointments", isAuthenticated, acceptedAppointments);

router.post("/register", registerUser);

router.post("/appointmentBooked/:id", isAuthenticated, bookAppointment);

router.post('/updateProfile', isAuthenticated,upload.single('image'),updateProfile);

export default router;
