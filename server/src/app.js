import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());



app.use("/api/auth", authRoutes);


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sweety API is running!",
  });
});

export default app;

