import express from "express";
import { getDailyReport,getMonthToDateReport,getMonthlyReport } from "../controllers/report.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/daily", authenticateUser, getDailyReport);
router.get("/month-to-date", authenticateUser, getMonthToDateReport);
router.get("/monthly", authenticateUser, getMonthlyReport);

export default router;