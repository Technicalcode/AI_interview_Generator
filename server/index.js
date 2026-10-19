const express = require("express"); // Use require for standard Node apps
const dotenv = require("dotenv");
const connectDB = require("./config/connectDB");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const rateLimiter = require("./middlewares/rateLimiter");
const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");
const interviewRouter = require("./routes/interview.route")
const paymentRouter = require("./routes/payment.route")
dotenv.config();

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://technicalcode.github.io",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
].filter(Boolean);

const isAllowedLocalOrigin = (origin) => {
    try {
        const { hostname, protocol } = new URL(origin);
        return protocol === "http:" && ["localhost", "127.0.0.1"].includes(hostname);
    } catch {
        return false;
    }
};

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || isAllowedLocalOrigin(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));

app.use(cookieParser())
app.use(express.json({ limit: "1mb" }))
app.use(rateLimiter({ windowMs: 60 * 1000, limit: 180 }))

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter)
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use((error, req, res, next) => {
    if (error) {
        return res.status(400).json({ message: error.message || "Request failed" });
    }

    next();
});


const PORT = process.env.PORT || process.env.port || 3000;



app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await connectDB();
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
    }
});
