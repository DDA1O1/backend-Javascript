import { Router } from "express";
import { registerUser,
         loginUser,
         logoutUser,
         refreshUser,
         changeCurrentUserPassword,
         getCurrentUser, 
         updateUser, 
         updateUserAvatar, 
         updateUserCoverImage, 
         getUserChannelProfile,
          getWatchHistory} from "../controllers/user.controller.js";
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
router.route("/change-password").post(verifyJwtToken, changeCurrentUserPassword);
router.route("/current-user").get(verifyJwtToken, getCurrentUser);
router.route("/update-user").patch(verifyJwtToken, updateUser);

router.route("/update-user-avatar").patch(verifyJwtToken, upload.single("avatar"), updateUserAvatar);
router.route("/update-user-cover-image").patch(verifyJwtToken, upload.single("coverImage"), updateUserCoverImage);


router.route("/c/:username").get(getUserChannelProfile);
router.route("/watch-history").get(verifyJwtToken, getWatchHistory);

export default router