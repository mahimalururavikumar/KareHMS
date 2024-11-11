import express from "express";
import { Login } from "../controller/indexController.js";

const router = express.Router();

router.get("/", (req, res) => {
  const messages = {
    successs : req.flash('success'),
    error : req.flash('error')
  };
  res.render("register",{messages});
});

router.get("/login", (req, res) => {
  const messages = {
    successs : req.flash('success'),
    error : req.flash('error')
  };
  res.render("login",{messages});
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

router.get("/doctorRegistration", (req, res) => {
  const messages = {
    successs : req.flash('success'),
    error : req.flash('error')
  };
  res.render("doctorRegistration",{messages});
});

router.get("/doctorLogin", (req, res) => {
  const messages = {
    successs : req.flash('success'),
    error : req.flash('error')
  };
  res.render("doctorLogin",{messages});
});


router.post("/login", Login);

export default router;
