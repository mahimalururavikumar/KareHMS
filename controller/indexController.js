import userModel from "../models/user-model.js";
import adminModel from "../models/admin-model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

const Login =  async (req, res) => {
    const { email, password } = req.body;
  
    try {
      let user = await userModel.findOne({ email });
      if (!user) {
        user = await adminModel.findOne({email});
      }
      
      if (!user) {
        req.flash("error", "User not found");
        console.log("User email does not exist in both user and admin models");
        return res.redirect("/login");
      }
  
      let result = await bcrypt.compare(password, user.password);
      if (!result) {
        req.flash("error", "Invalid Credientials");
        console.log("Password Wrong");
        return res.redirect("/login");
      }
      const token = generateToken(user);
      res.cookie('token',token, { httpOnly: true });
      if(!user.isadmin) {
        return res.redirect("/user/dashboard");
      }
      res.redirect("/admin/dashboard");
    } catch (error) {
      req.flash('error','Unable to login'+error.message);
      console.log(error.message);
      res.redirect('/login');
    }
}

export {Login};