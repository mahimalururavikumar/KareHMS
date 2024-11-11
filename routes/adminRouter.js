import express from "express";
const router = express.Router();
import isAdminAuthenticated from "../middleware/isItOwner.js";
import bcrypt from "bcryptjs";
import adminModel from "../models/admin-model.js";
import {
  requestaccepted,
  removedAccess,
  requestdeclined,
  allDoctors,
  allUsers,
  docProfile,
  requests,
  notifications
} from "../controller/adminController.js";


router.get("/", (req, res) => {
  res.send("Owners route");
});

router.get("/dashboard", isAdminAuthenticated, async (req, res) => {
  const messages = {
    successs : req.flash('success'),
    error : req.flash('error')
  };
  let admin = await adminModel.findOne();
  res.render("adminhome",{admin,notifications: admin.usernotification,messages});
});

router.get("/allDoctors", isAdminAuthenticated,allDoctors);

router.get('/allUsers', isAdminAuthenticated, allUsers);

router.get("/notifications", isAdminAuthenticated, notifications);

router.get("/requests", isAdminAuthenticated, requests);

router.get('/docProfile/:id', isAdminAuthenticated, docProfile);



router.post("/requestaccepted/:id", isAdminAuthenticated, requestaccepted);

router.post("/removedocaccess/:id", isAdminAuthenticated, removedAccess);

router.post("/requestdeclined/:id", isAdminAuthenticated, requestdeclined);

router.post("/create", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "development") {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Name, email, and password are required to create an owner.",
        });
      }
      const admin = await adminModel.find();
      if (admin.length > 0) {
        return res.status(400).json({
          message: "There should be only one owner.",
        });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      const createdOwner = await adminModel.create({
        name,
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        message: "Owner created successfully",
        owner: createdOwner,
      });
    } else {
      res.status(403).json({
        message:
          "Admin creation is restricted to development environment only.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the owner.",
      error: error.message,
    });
  }
});

export default router;
