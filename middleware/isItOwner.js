import jwt from "jsonwebtoken";
import adminModel from "../models/admin-model.js";

const isAdminAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.flash("error", "You need to log in to access this page");
    console.log("User attempted to access without login.");
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const admin = await adminModel.findById(decoded.id).select("-password");

    if (!admin) {
      req.flash("error", "Admin not found.");
      console.log("Token does not match with any admin.");
      return res.redirect("/login");
    }
    req.user = admin;
    next();
  } catch (error) {
    req.flash("error", "Something went wrong.");
    console.log("Failed to authenticate the admin:", error.message);
    return res.redirect("/login");
  }
};

export default isAdminAuthenticated;
