import express from "express";
const router = express.Router();
import isDoctor from "../middleware/isDoctor.js";
import {
  appointments,
  acceptAppointment,
  register,
  doctorLogin,
  doctorformSubmit,
  allappointments,
  dashBoard,
  appointmentCompleted,
  updateProfile
} from "../controller/doctorController.js";

router.get("/dashboard", isDoctor, dashBoard);

router.get("/doctorApplication", (req, res) => {
  const messages = {
    successs : req.flash('success'),
    error : req.flash('error')
  };
  res.render("applyfordoctor",{messages});
});

router.get("/notifications", isDoctor, async (req, res) => {
  const messages = {
    successs : req.flash('success'),
    error : req.flash('error')
  };
  let doctor = req.doctor;
  doctor.notifications.forEach(n => {
    n.status = 'read'
  });
  await doctor.save();
  let notifications = doctor.notifications;
  res.render("doctorNotifications", { notifications ,messages});
});

router.get("/profile", isDoctor, (req, res) => {
  const messages = {
    successs : req.flash('success'),
    error : req.flash('error')
  };
  let doctor = req.doctor;
  res.render("doctorProfile",{doctor, notifications: doctor.notifications , messages});
});

router.get("/allAppointments", isDoctor, allappointments);

router.get("/appointments", isDoctor, appointments);

router.post("/login", doctorLogin);

router.post("/doctorformSubmit", isDoctor, doctorformSubmit);

router.post("/appointmentAccepted/:id", isDoctor, acceptAppointment);

router.post("/register", register);

router.post("/completeAppointment/:id", isDoctor, appointmentCompleted);

router.post('/updateProfile', isDoctor , updateProfile);

export default router;