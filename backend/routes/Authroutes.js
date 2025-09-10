import { Router } from "express";
import { Registeruser, loginuser, logout } from "../controller/Authcontroller.js";

const router = Router();

router.post("/register", Registeruser);

router.post("/login", loginuser);

router.post("/logout", logout);

export default router;
