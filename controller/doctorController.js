import userModel from "../models/user-model.js";
import adminModel from "../models/admin-model.js";
import appointmentModel from "../models/appointment-model.js";
import doctorApplicationModel from "../models/doctorApplication-model.js";
import doctorModel from "../models/doctor-model.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

const register = async (req, res) => {
  let { name, email, password } = req.body;

  try {
    let existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      req.flash("error", "Email already registered. Please log in.");
      console.log("Email already registered");
      return res.redirect("/doctorRegistration");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let doctor = await doctorModel.create({
      name,
      email,
      password: hashedPassword,
    });

    if (!doctor) {
      req.flash("error", "Unable to create account. Please try again later.");
      console.log("Registration failed");
      return res.redirect("/doctorRegistration");
    }

    let token = generateToken(doctor);
    res.cookie("token", token, { httpOnly: true });

    req.flash("success", "Registered successfully");
    res.redirect("/doctor/doctorApplication");
  } catch (error) {
    req.flash("error", "Something went wrong: " + error.message);
    console.log("Registration error:", error.message);
    res.redirect("/doctorRegistration");
  }
};

const doctorLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      req.flash("error", "Invalid credentials. Please try again.");
      console.log("Doctor not found with the given email");
      return res.redirect("/doctorLogin");
    }
    const checkPassword = await bcrypt.compare(password, doctor.password);
    if (!checkPassword) {
      req.flash("error", "Invalid credentials. Please try again.");
      console.log("Password did not match");
      return res.redirect("/doctorLogin");
    }

    const token = generateToken(doctor);
    res.cookie("token", token, { httpOnly: true });

    if (!doctor.isDoctor) {
      return res.redirect("/doctor/doctorApplication");
    }

    res.redirect("/doctor/dashboard");
  } catch (error) {
    req.flash("error", "Unable to login. Please try again later.");
    console.log("Login error:", error.message);
    res.redirect("/doctorLogin");
  }
};

const doctorformSubmit = async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      degree,
      experience,
      fees,
      specialist,
      address,
      timings,
    } = req.body;

    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      console.log("Doctor not found");
      req.flash("error", "You must be Login to access Page");
      return res.redirect("/user/applydoctor");
    }
    let application = await doctorApplicationModel.create({
      userId: doctor._id,
      name,
      email,
      password: doctor.password,
      contact,
      degree,
      experience,
      fees,
      specialist,
      address,
      timings: {
        start: timings.start || null,
        end: timings.end || null,
      },
    });

    const admin = await adminModel.findOne();
    if (!admin) {
      console.log("Admin not found");
      req.flash("error", "Admin not found. Please try again later.");
      return res.redirect("/doctor/doctorApplication");
    }
    admin.userRequests.push({
      userId: doctor._id,
      appicationId: application._id,
      request: "Request for doctor access",
    });

    admin.usernotification.push({
      message: `${doctor.name} was requested for doctor access`,
    });
    await admin.save();

    doctor.notifications.push({
      message:
        "Your request for doctor access has been submitted and waiting for approval.",
    });
    await doctor.save();
    req.flash("success", "Successfully applied for doctor");
    res.redirect("/doctor/doctorApplication");
  } catch (error) {
    console.log("Error in doctorformSubmit:", error.message);
    req.flash("error", "Failed to submit the request: " + error.message);
    res.redirect("/doctor/doctorApplication");
  }
};

const appointments = async (req, res) => {
  try {
    const messages = {
      successs: req.flash("success"),
      error: req.flash("error"),
    };
    let doctor = req.doctor;
    const appointments = doctor.appointments;
    res.render("doctorAppointments", {
      appointments,
      notifications: doctor.notifications,
      messages,
    });
  } catch (error) {
    req.flash("error", "something went wrong" + error.message);
    console.log("Unable to fetch the appointmentPage");
    res.redirect("/doctor/dashboard");
  }
};

const acceptAppointment = async (req, res) => {
  const doc = req.doctor;
  const doctorId = doc._id;

  try {
    let doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      req.flash("error", "Unable to fetch doctor information.");
      return res.redirect("/doctor/appointments");
    }

    const userId = req.params.id;
    let appIndex = doctor.appointments.findIndex(
      (app) => app.userId.toString() === userId
    );
    if (appIndex === -1) {
      req.flash("error", "Appointment time not found for this user.");
      return res.redirect("/doctor/appointments");
    }

    doctor.appointments[appIndex].type = "accepted";

    const appointment = await appointmentModel.create({
      userId,
      doctorId,
      status: "accepted",
      appointmentTime: {
        time: doctor.appointments[appIndex].time,
        date: doctor.appointments[appIndex].date,
      },
    });

    if (!appointment) {
      req.flash("error", "Failed to create an appointment.");
      console.log("Failed to create an appointment - internal server error.");
      return res.redirect("/doctor/appointments");
    }

    let user = await userModel.findById(userId);
    if (!user) {
      req.flash("error", `User not found with ID: ${userId}`);
      return res.redirect("/doctor/appointments");
    }

    doctor.acceptedAppointment.push({
      appointmentId: appointment._id,
      userId: userId,
    });

    doctor.notifications.push({
      message: `Patient ${user.name}'s appointment was accepted`,
    });

    await doctor.save();

    user.appointments.push({
      appointmentId: appointment._id,
      type: "accepted",
      doctorId: doctorId,
    });
    user.notification.push({
      message: "Your appointment request has been accepted",
      type: "accepted",
    });

    await user.save();

    res.redirect("/doctor/appointments");
  } catch (error) {
    req.flash("error", "Something went wrong: " + error.message);
    console.log("Error during appointment acceptance:", error.message);
    res.redirect("/doctor/appointments");
  }
};

const allappointments = async (req, res) => {
  let doctor = req.doctor;
  const messages = {
    successs: req.flash("success"),
    error: req.flash("error"),
  };
  try {
    let doc = await doctorModel
      .findById(doctor._id)
      .populate("acceptedAppointment.appointmentId");

    if (!doc) {
      req.flash("error", "Doctor not Found");
      console.log("Doctor details not found");
      return res.redirect("/doctor/dashboard");
    }

    let acceptedApp = doc.acceptedAppointment;
    res.render("doctorAcceptedApp", {
      acceptedApp,
      notifications: doctor.notifications,
      messages,
    });
  } catch (error) {
    req.flash("error", "Unable to fetch Appointments Detail: " + error.message);
    console.error("Error fetching appointments:", error.message);
    res.redirect("/doctor/dashboard");
  }
};

const dashBoard = async (req, res) => {
  let doc = req.doctor;
  const messages = {
    successs: req.flash("success"),
    error: req.flash("error"),
  };
  let doctor = await doctorModel.findById(doc._id);
  let acceptedAppointment = doc.acceptedAppointment;
  let appointments = doc.appointments;
  let notifications = doc.notifications;
  res.render("doctorDashboard", {
    doc,
    acceptedAppointment,
    appointments,
    notifications,
    messages,
  });
};

const appointmentCompleted = async (req, res) => {
  let appId = req.params.id;
  let doc = req.doctor;
  try {
    let appDetails = await appointmentModel.findById(appId).populate("userId");
    if (!appDetails) {
      req.flash("error", "Unable to fetch Data");
    }
    let user = appDetails.userId;
    user.notification.push({
      message: `Appointment Session has Successfully Completed with ${doc.name}`,
      status: "unread",
    });
    await user.save();
    appDetails.status = "completed";
    await appDetails.save();
    req.flash("success", "Appointment marked as completed.");
    res.redirect("/doctor/allAppointments");
  } catch (error) {
    req.flash("error", "Something went Wrong" + error.message);
    res.redirect("/doctor/allAppointments");
  }
};

const updateProfile = async (req, res) => {
  const { name, email, contact, fees, experience, address, timings } = req.body;

  try {
    if (!timings || !timings.start || !timings.end) {
      req.flash("error", "Please provide valid timings.");
      return res.redirect("/doctor/profile");
    }
    let doctor = await doctorModel.findByIdAndUpdate(req.doctor.id, {
      name,
      email,
      contact,
      fees,
      experience,
      address,
      timings: {
        start: timings.start,
        end: timings.end,
      },
    });

    if (!doctor) {
      req.flash("error", "Unable to update the profile.");
      return res.redirect("/doctor/profile");
    }

    req.flash("success", "Profile updated successfully.");
    res.redirect("/doctor/profile");
  } catch (error) {
    req.flash("error", "Sorry, internal error: " + error.message);
    console.error(error.message);
    res.redirect("/doctor/profile");
  }
};

export {
  appointments,
  acceptAppointment,
  register,
  doctorLogin,
  doctorformSubmit,
  allappointments,
  dashBoard,
  appointmentCompleted,
  updateProfile,
};
