import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { 
            name: "avatar",
            maxCount: 1 
        },
        { 
            name: "coverImage", 
            maxCount: 1 
        },
    ]),
    registerUser
);
router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJwtToken, logoutUser)
router.route("/refresh").post(refreshUser)


export default router