import express from "express";
import { register, login, refresh } from "../controllers/authController.mjs";
import { validateUsernamePassword } from "../middlewares/username-password.validation.mjs";

const router = express.Router();

router.post("/register", [validateUsernamePassword], register);
router.post("/login", [validateUsernamePassword], login);
router.post("/refresh", refresh);

export default router;
