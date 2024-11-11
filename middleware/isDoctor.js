import jwt from "jsonwebtoken";
import doctorModel from "../models/doctor-model.js";

const isDoctor = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.flash("error", "You need to log in to access this page");
    console.log("User attempted to access without login.");
    return res.redirect("/doctorlogin");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const doctor = await doctorModel.findById(decoded.id).select("-password");

    if (!doctor) {
      req.flash("error", "Doctor not found.");
      console.log("Token does not match any doctorId.");
      return res.redirect("/doctorlogin");
    }

    req.doctor = doctor; 
    next();
  } catch (error) {
    req.flash("error", "Something went wrong.");
    console.log("Failed to authenticate the doctor:", error.message);
    return res.redirect("/doctorlogin");
  }
};

export default isDoctor;
