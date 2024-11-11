// Import required modules
import express, { urlencoded } from "express";
import path from "path";
import { fileURLToPath } from "url";
import flash from "connect-flash";
import session from "express-session";
import redis from "redis";
import connectRedis from "connect-redis";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Initialize app and environment variables
const app = express();
dotenv.config();

// Redis and session setup
const RedisStore = connectRedis(session);
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis-17819.c92.us-east-1-3.ec2.redns.redis-cloud.com:17819",
  legacyMode: true, // Enable legacy mode if using callback-based Redis functions
});

// Connect Redis
redisClient.connect().catch(console.error);

// Database connection
import db from "./config/mongodb-connection.js";

// Define directory constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Configure session with Redis store
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

// Flash messages middleware
app.use(flash());

// Import and use routes
import indexRouter from "./routes/indexRouter.js";
import userRouter from "./routes/userRouter.js";
import adminRouter from "./routes/adminRouter.js";
import doctorRouter from "./routes/doctorRouter.js";

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/doctor", doctorRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
