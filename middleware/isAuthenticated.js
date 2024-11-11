import jwt from "jsonwebtoken";
import userModel from "../models/user-model.js";

const isAuthenticated = async (req, res, next) => {
  const cookie = req.cookies.token;
  if (!cookie) {
    req.flash("error", "you need to log in to access these page");
    console.log("you need to log in to access these page");
    return res.redirect("/login");
  }

  try {
    let decode = jwt.verify(cookie, process.env.JWT_KEY);
    let user = await userModel.findById(decode.id ).select("-password");
    if (!user) {
      req.flash("error", "User not found.");
      console.log("token does not match with any user");
      return res.redirect("/login");
    }
    req.user = user;
    next();
  } catch (error) {
    req.flash("error", "Something went wrong.");
    console.log('failed to authenticate the user', error.message);
    return res.redirect("/login");
  }
};


export {isAuthenticated};