import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);


router.get("/me", authenticateUser, (req, res) => {
    res.status(200).json({
        success: true,
        message: "You are authenticated!",
        user: { id: req.user.id },
    });
});

router.post("/logout", logoutUser);


export default router;
