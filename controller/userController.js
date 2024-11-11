import userModel from "../models/user-model.js";
import doctorModel from "../models/doctor-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import adminModel from "../models/admin-model.js";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  
  const user = await userModel.findOne({ email });

  if (user) {
    req.flash("error", "User already exist");
    console.log("User already exists");
    return res.redirect("/");
  }

  try {
    let admin = await adminModel.findOne();
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    const createdUser = await userModel.create({
      name,
      email,
      password: hash,
    });
    let token = jwt.sign(
      { id: createdUser._id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
    admin.allusers.push({
      UserId: createdUser._id
    });
    await admin.save();

    res.cookie("token", token);
    req.flash("success", "user registered successfully");
    return res.redirect("/user/dashboard");
  } catch (error) {
    req.flash("error", error.message);
    return res.redirect("/");
  }
};

const appointmentPage = async (req, res) => {
  try {
    const messages = {
      successs : req.flash('success'),
      error : req.flash('error')
    };
    const doctorId = req.params.id;
    let doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      req.flash("error", "sorry unable to fetch the doctor details");
      return res.redirect("/user/dashboard");
    }
    res.render("bookAppointment", { doctor , messages});
  } catch (error) {
    req.flash("error", "something went wrong" + error.message);
    return res.redirect("/user/dashboard");
  }
};

const bookAppointment = async (req, res) => {
  try {
    let user = req.user;
    const { appointmentDate, appointmentTime, duration} = req.body;

    let durationInMinutes;
    if (duration === "halfanhour") {
      durationInMinutes = '30 Minutes';
    } else if (duration === "hour") {
      durationInMinutes = '60 Minutes';
    } else if (duration === "doctor") {
      durationInMinutes = '90 Minutes';
    }

    const doctorId = req.params.id;

    if (!appointmentDate || !appointmentTime) {
      req.flash("error", "Appointment date and time are required.");
      return res.redirect("/user/dashboard");
    }

    let doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      req.flash("error", "Unable to connect to the doctor. Please try again later.");
      console.log('Doctor not found for appointment approval')
      return res.redirect("/user/dashboard");
    }
    doctor.notifications.push({
      message: `${user.name} wants to book an appointment at ${appointmentTime} on ${appointmentDate}`,
      status: 'unread'
    });
    doctor.appointments.push({
      requests: `Requested for appointment at ${appointmentTime} on ${appointmentDate}`,
      userId: user._id,
      userName: user.name,
      type: "pending",
      time : appointmentTime,
      date : appointmentDate,
      duration : durationInMinutes || '30 Minutes'
    })

    await doctor.save();

    user.notification.push({
      message: `Successfully applied for an appointment. Waiting for doctor ${doctor.name}'s approval.`,
      type: "pending"
    });
    await user.save();

    req.flash('success','Successfully applied for appointment. Waiting for approval.');
    res.redirect('/user/dashboard');
  } catch (error) {
    req.flash('error','Unable to book appointment. Something went wrong.'+error.message);
    console.log('something went wrong',error.message);
    res.redirect('/user/dashboard');
  }
};

const acceptedAppointments = async (req, res) => {
  let user = req.user;
  try {
    const messages = {
      successs : req.flash('success'),
      error : req.flash('error')
    };
    let User = await userModel.findById(user._id).populate('appointments.appointmentId').populate('appointments.doctorId');
    if(!User){
      req.flash('error','Unable to fetch Details');
      return res.redirect('/user/dashboard')
    }
    let appointments = User.appointments;
    res.render('userAppointments',{appointments, notifications: User.notification,messages});
  } catch (error) {
    req.flash('error','Unable to fetch the Data'+error.message);
    res.redirect('/user/dashboard');
  }
}

const updateProfile = async (req, res) => {
  const { name, email, contact, password } = req.body;

  try {
    const updateData = { name, email, contact };

    if (password) {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await userModel.findByIdAndUpdate(req.user.id, updateData, { new: true });

    if (!user) {
      req.flash('error', 'Unable to Update the Details');
      console.log('User not found');
      return res.redirect('/user/profile');
    }

    req.flash('success', 'Successfully Updated');
    res.redirect('/user/profile');
  } catch (error) {
    req.flash('error', 'Something went wrong: ' + error.message);
    console.log('Error:', error.message);
    res.redirect('/user/profile');
  }
};

const notifications =  async (req, res) => {
  const messages = {
    successs : req.flash('success'),
    error : req.flash('error')
  };
  let user = await userModel.findById(req.user.id);
  if(!user){
    req.flash('error','Unable to find User');
    console.log('User not Found');
    res.redirect('/user/notifications')
  }
  user.notification.forEach(n => {
    if(n.status === 'unread'){
      n.status = 'read';
    }
  });
  await user.save();
  res.render("userNotification", { notifications: user.notification ,messages});
}

export { registerUser, appointmentPage, bookAppointment, acceptedAppointments , updateProfile , notifications };
