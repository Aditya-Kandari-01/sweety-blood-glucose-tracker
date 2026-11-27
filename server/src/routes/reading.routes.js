import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { createReading,getReadings,updateReading,deleteReading } from "../controllers/reading.controller.js";

const router = express.Router();

router.post("/", authenticateUser, createReading);
router.get("/", authenticateUser, getReadings);
router.put("/:id", authenticateUser, updateReading);
router.delete("/:id", authenticateUser, deleteReading);

export default router;
