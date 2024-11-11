// If you want these project dm me through linkedln
//https://www.linkedin.com/in/mahimaluru-venkata-ravikumar-357064299/


import express, { urlencoded } from "express";
import path from "path";
import { fileURLToPath } from "url";
import flash from "connect-flash";
import session from "express-session";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Initialize
const app = express();
dotenv.config();

// Database connection
import db from "./config/mongodb-connection.js";

//define
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: false,
  })
);

//Flash messages
app.use(flash());

// Routes
import indexRouter from "./routes/indexRouter.js";
import userRouter from "./routes/userRouter.js";
import adminRouter from "./routes/adminRouter.js";
import doctorRouter from "./routes/doctorRouter.js";
app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/doctor", doctorRouter);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
