import doctorApplicationModel from "../models/doctorApplication-model.js";
import doctorModel from "../models/doctor-model.js";
import adminModel from "../models/admin-model.js";

const requestaccepted = async (req, res) => {
  try {
    let id = req.params.id;

    let admin = await adminModel.findOne();
    let docApplication = await doctorApplicationModel
      .findByIdAndUpdate(id, { status: "accepted" })
      .populate("userId");

    if (!docApplication) {
      req.flash("error", "Doctor Application not found");
      console.log(`Doctor Application with ID ${id} was not found.`);
      return res.redirect("/admin/requests");
    }

    let doctor = await doctorModel.findByIdAndUpdate(docApplication.userId, {
      isDoctor: true,
      name: docApplication.name,
      email: docApplication.email,
      contact: docApplication.contact,
      degree: docApplication.degree,
      experience: docApplication.experience,
      specialist: docApplication.specialist,
      address: docApplication.address,
      timings: docApplication.timings,
      fees: docApplication.fees || 500,
    });

    if (!doctor) {
      req.flash("error", "Doctor not found");
      console.log(`Doctor with ID ${docApplication.userId} was not found.`);
      return res.redirect("/admin/requests");
    }

    doctor.notifications.push({
      message:
        "Request for doctor application was accepted; you can access doctor login now.",
      status: "approved",
    });
    await doctor.save();

    admin.usernotification.push({
      message: `Doctor access has given to ${doctor.name} `,
    });
    admin.allDoctors.push({
      DoctorId: doctor._id,
    });
    await admin.save();

    req.flash("success", "Doctor application accepted successfully.");
    res.redirect("/admin/requests");
  } catch (error) {
    req.flash("error", "Failed to accept the request: " + error.message);
    console.error("Error in requestaccepted function:", error);
    res.redirect("/admin/requests");
  }
};

const removedAccess = async (req, res) => {
  try {
    const id = req.params.id;

    let admin = await adminModel.findOne();

    const docApplication = await doctorApplicationModel
      .findByIdAndUpdate(id, { status: "removedAccess" })
      .populate("userId");

    if (!docApplication) {
      req.flash("error", "Unable to find doctor application");
      console.log(`Doctor application not found with ID ${id}`);
      return res.redirect("/admin/requests");
    }

    const doctor = await doctorModel.findByIdAndUpdate(docApplication.userId, {
      isDoctor: false,
    });

    if (!doctor) {
      req.flash(
        "error",
        "Unable to fetch doctor details due to an internal error"
      );
      console.log(`Doctor with user ID ${docApplication.userId} not found.`);
      return res.redirect("/admin/requests");
    }

    doctor.notifications.push({
      message: "Doctor access has been removed by admin",
      status: "unread",
    });
    await doctor.save();

    admin.usernotification.push({
      message: `Doctor access has removed to the Doctor ${doctor.name}`,
      status: 'unread'
    });
    admin.allDoctors.pull({
      DoctorId: doctor._id,
    });
    await admin.save();

    req.flash("success", "Doctor access successfully removed.");
    res.redirect("/admin/requests");
  } catch (error) {
    req.flash("error", "Unable to complete the action: " + error.message);
    console.error("Error in removedAccess function:", error.message);
    res.redirect("/admin/requests");
  }
};

const requestdeclined = async (req, res) => {
  try {
    const id = req.params.id;

    let admin = await adminModel.findOne();

    const docApplication = await doctorApplicationModel
      .findByIdAndUpdate(id, { status: "declined" })
      .populate("userId");

    if (!docApplication) {
      req.flash("error", "Doctor application not found.");
      console.log(`Doctor application with ID ${id} not found.`);
      return res.redirect("/admin/requests");
    }

    const doctor = await doctorModel.findById(docApplication.userId);
    if (!doctor) {
      req.flash("error", `Doctor not found with ID: ${docApplication.userId}`);
      console.log(`Doctor with ID ${docApplication.userId} not found.`);
      return res.redirect("/admin/requests");
    }

    doctor.notifications.push({
      message: "Your doctor application was declined by the admin",
      status: "unread",
    });
    await doctor.save();

    admin.usernotification.push({
      message: `Doctor access request was rejected to the Doctor ${doctor.name}`,
    });
    await admin.save();

    req.flash("success", "Doctor application successfully declined.");
    res.redirect("/admin/requests");
  } catch (error) {
    req.flash("error", "Failed to decline the request: " + error.message);
    console.error("Error in requestdeclined function:", error.message);
    res.redirect("/admin/requests");
  }
};

const allDoctors = async (req, res) => {
  try {
    const messages = {
      successs : req.flash('success'),
      error : req.flash('error')
    };
    let admin = await adminModel.findOne().populate("allDoctors.DoctorId");
    if (!admin) {
      req.flash("error", "Internal server error");
      res.redirect("/admin/dashboard");
    }
    let allDoctors = admin.allDoctors;
    res.render("adminAllDocs", { allDoctors, admin,notifications: admin.usernotification ,messages});
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    res.redirect("/admin/dashboard");
  }
};

const allUsers = async (req, res) => {
  try {
    const messages = {
      successs : req.flash('success'),
      error : req.flash('error')
    };
    let admin = await adminModel.findOne().populate("allusers.UserId");
    if (!admin) {
      req.flash("error", "Internal server error");
      res.redirect("/admin/dashboard");
    }
    let allUsers = admin.allusers;
    res.render('adminAllUsers',{allUsers, admin, notifications : admin.usernotification,messages});
  } catch (error) {
    req.flash('error','Unable to fetch user details'+error.message);
    res.redirect('/admin/dashboard');
  }
};

const docProfile =  async(req, res) => {
  let docId = req.params.id;
  try {
    const messages = {
      successs : req.flash('success'),
      error : req.flash('error')
    };
    let admin = await adminModel.findOne();
    let doctor = await doctorModel.findById(docId);
  if(!doctor){
    req.flash('error','Unable to fetch Doctor Details');
    console.log('Unable to fetch doctor details');
    res.redirect('/admin/allDoctors');
  }
  console.log(doctor);
  res.render('admindocProfile',{doctor,admin,notifications: admin.usernotification,messages});

  } catch (error) {
    req.flash('error','Something went wrong'+error.message);
    console.log(error.message);
    res.redirect('/admin/allDoctors');
  }
};

const requests =  async (req, res) => {
  try {
    const messages = {
      successs : req.flash('success'),
      error : req.flash('error')
    };
    const admin = await adminModel
      .findOne()
      .populate("userRequests.userId")
      .populate("userRequests.appicationId");
    if (!admin) {
      req.flash("error", "Admin not found");
      console.log("admin not found");
      return res.redirect("/admin/dashboard");
    }
    console.log(admin.userRequests);
    res.render("adminRequests", { requests: admin.userRequests , admin, notifications: admin.usernotification,messages});
  } catch (error) {
    req.flash("error", "Failed to load Requests: " + error.message);
    console.log("error while loading Requests", error.message);
    res.redirect("/admin/dashboard");
  }
};

const notifications =  async (req, res) => {
  try {
    const messages = {
      successs : req.flash('success'),
      error : req.flash('error')
    };
    const admin = await adminModel.findOne();
    if (!admin) {
      req.flash("error", "Admin not found");
      console.log("admin not found");
      return res.redirect("/admin/dashboard");
    }
    admin.usernotification.forEach((notification) => {
      if(notification.status === 'unread'){
        notification.status = 'read';
      }
    });
    await admin.save();

    res.render("adminNotifications", { notifications : admin.usernotification,admin ,messages});
  } catch (error) {
    req.flash("error", "Failed to load notifications: " + error.message);
    console.log("error while loading notifications", error.message);
    res.redirect("/admin/dashboard");
  }
};

export { requestaccepted, removedAccess, requestdeclined, allDoctors, allUsers , docProfile ,requests , notifications};
