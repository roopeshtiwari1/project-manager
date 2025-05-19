import { Router } from "express";
import {registerUser, verifyEmail, resendEmailVerification, loginUser, logoutUser, getCurrentUser, 
  refreshAccessToken, changeCurrentPassword, forgotPasswordRequest,updateUserAvatar, resetPasswordRequest} from "../controllers/auth.controllers.js"
import {validate} from "../middlewares/validator.middleware.js"
import {userRegistrationValidator, changeCurrentPasswordValidator,resetPasswordRequestValidator, userLoginValidator, forgotPasswordRequestValidator } from "../validators/index.js"
import {isLoggedIn} from "../middlewares/auth.middleware.js"


const router = Router()

router.post("/register", upload.single("avatar"), userRegistrationValidator(), validate, registerUser)
router.get("/verify-email/:token", verifyEmail)
router.get("/resend-email-verification", resendEmailVerification)
router.post("/login", userLoginValidator(), validate, loginUser)
router.get("/logout",isLoggedIn, logoutUser)
router.get("/my-profile", isLoggedIn, getCurrentUser)
router.post("/refresh-token", refreshAccessToken)
router.post("/change-password", isLoggedIn, changeCurrentPasswordValidator(), validate, changeCurrentPassword)
router.post("/forgot-password", forgotPasswordRequestValidator(),validate, forgotPasswordRequest)
router.post("/reset-password", isLoggedIn,resetPasswordRequestValidator(), validate, resetPasswordRequest)
router.patch("/update-avatar", isLoggedIn, upload.single("avatar"), updateUserAvatar)

export default router