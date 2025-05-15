import {User} from "../models/user.models.js"
import {asyncHandler} from "../utils/async-handler.js"
import {ApiError} from "../utils/api-error.js"
import {ApiResponse} from "../utils/api-response.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {emailVerificationMailGenContent, forgotPasswordMailGenContent, sendMail} from "../utils/mail.js"
import crypto from "crypto"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findOne(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}

const registerUser = asyncHandler( async (req,res) => {
  const {username, fullname, email, password} = req.body

  // checking existing user
  const existingUser = await User.findOne({
    $or: [{email},{username,}]
  })

  if (existingUser) {
    throw new ApiError (400, "user already exist" )
  }
  
  // Handling avatar image through cloudinary

  // console.log(req.files)
  const avatarLocalPath = req.file?.avatar[0]?.path
  
  if(!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(avatar) {
    throw new ApiError(400, "Error while uploading avatar")
  }

  // creating new user in db
  const user = await User.create({
    email,
    fullname: fullname?
    username: username.toLowerCase(),
    avatar: avatar?.url,
    password
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken")

  if (!createdUser) {
    throw new ApiError(500, "Error while completing user registration")
  }

  // Email verification token
  const {hashedToken, unhashedToken, tokenExpiry} = user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save()

  // Sending email verification token
  await sendMail({
  email: user.email,
  subject: "Please verify your email",
  mailGenContent: emailVerificationMailGenContent(user.username, `${process.env.BASE_URL}/api/v1/users/verifyEmail/${unhashedToken}`)
})

  return res.status(201).json(
    new ApiResponse(200, createdUser, "user registered successfully")
  )

})


const verifyEmail = asyncHandler ( async (req,res) => {
  const token = req.params
  if (!token) {
    throw new ApiError(400, "verification token not found")
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
  const user = await User.findOne(
    {emailVerificationToken: hashedToken}
  )
  if(!user) {
    throw new ApiError (400, "verification failed")
  }
  user.isEmailVerified = true;
  user.emailverificationToken = undefined;
  user.emailverificationTokenExpiry = undefined
  user.save();

  return res
      .status(200)
      .json(new ApiResponse(200, "Email verified successfully"))
})


const resendEmailVerification = asyncHandler( async (req,res) => {
  const {email} = req.body
  if(!email) {
    throw new ApiError(400, "Email is required")
  }
  const user = await User.findOne({email})
  if(!user) {
    throw new ApiError(400, "user not found, registration pending")
  }
  if (user.isEmailVerified) {
    throw new ApiError(400, "your email is already verified")
  }
  const {hashedToken, unhashedToken, tokenExpiry} = user.generateTemporaryToken()
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry
  await user.save()

  await sendMail({
  email: user.email,
  subject: "Please verify your email",
  mailGenContent: emailVerificationMailGenContent(user.username, `${process.env.BASE_URL}/api/v1/users/verifyEmail/${unhashedToken}`)
})

  return res
      .status(200)
      .json(new ApiResponse(200, "Email verified successfully"))
})


const loginUser = asyncHandler( async (req,res)=> {
  const{email,password} = req.body

  const user = await User.findOne({email})
  if(!user) {
    throw new ApiError(400, "You are not a registered user")
  }
  if(!user.isEmailVerified) {
    throw new ApiError(400, "verify your email first")
  }
  const isPasswordValid = await user.isPasswordCorrect(password) 
  if(!isPasswordValid) {
    throw new ApiError (400, "invalid email or password")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
          .status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options)
          .json(
            new ApiResponse(
              200,
              {
                user: loggedInUser, accessToken, refreshToken
              },
              "Login successful"
            )
          )
})


const logoutUser = asyncHandler(async(req,res)=> {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      },
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
          .status(200)
          .clearCookie("accessToken", options)
          .clearCookie("refreshToken", options)
          .json(
            200,
            "User logout successfully"
          )
})


const getCurrentUser = asyncHandler( async (req,res)=> {
  return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              req.user,
              "User fetched successfully"
            )
          )
})


const refreshAccessToken = asyncHandler (async(req,res)=> {
  const incomingRefreshToken = req.cookie?.refreshToken || req.body.refreshToken
  if(incomingRefreshToken) {
    throw new ApiError (400, "unauthorized request")
  }

  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

  const user = await User.findById(decodedToken?._id)

  if(!user) {
    throw new ApiError(400, "invalid refresh token")
  }

  if(incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(400, "refresh token is expired")
  }

  const options = {
    httpOnly: true,
    secure: true
  }

  const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

  return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshTokenToken, options)
        .json(
          200, 
          {accessToken, refreshToken: newRefreshToken},
          "Access-Token refreshed successfully"
        )
})


const changeCurrentPassword = asyncHandler (async(req,res)=> {
  const {oldPassword, newPassword, confirmPassword} = req.body
  if (!(newPassword === confirmPassword )) {
    throw new ApiError(400, "Both new password and confirm password are different,please try again");
  }

  const user = req.user
  const isPasswordValid = await user.isPasswordCorrect(oldPassword)
  if(!isPasswordValid) {
    throw new ApiError (400, "your old password is not valid")
  }

  user.password = newPassword
  await user.save()

  return res
          .status(200)
          .json(new ApiResponse(200, "your password change successfully"))
})


const forgotPasswordRequest = asyncHandler (async(req,res)=> {
  const {email} = req.body
  
  const user = await User.findOne(email)
  if(!user) {
    throw new ApiError (400, "You are not a registered user")
  }

  const {unhashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()
  user.forgotPasswordToken = hashedToken
  user.forgotPasswordExpiry = tokenExpiry
  await user.save()

  await sendMail(({
  email: user.email,
  subject: "Please verify your email",
  mailGenContent: forgotPasswordMailGenContent(user.username, `${process.env.BASE_URL}/api/v1/users/verifyEmail/${unhashedToken}`)
  }))

  return res
          .status(200)
          .json(new ApiResponse(
            200,
            "forgot password email sent successfully"
          ))
})


const resetPasswordRequest = asyncHandler (async(req,res)=> {
  const {token} = req.params
  const {newPassword} = req.body

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
  const user = await User.findOne (
    {
      forgotPasswordToken: hashedToken
    }
  )
  if(!user) {
    throw new ApiError (400, "invalid token, please try again")
  }

  user.password= newPassword
  user.forgotPasswordToken= undefined
  user.forgotPasswordExpiry = undefined
  await user.save()

  return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              "password reset successfully"
            )
          )
})


const updateUserAvatar = asyncHandler (async(req,res)=> {
  const avatarLocalPath = req.file?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if(!avatar.url) {
    throw new ApiError (400, "Error while uploading avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar : avatar.url
      }
    },
    {
      new: true
    }
  ).select("-password -refreshToken")

   return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

export {registerUser, 
        verifyEmail, 
        resendEmailVerification, 
        loginUser, 
        logoutUser, 
        getCurrentUser, 
        refreshAccessToken, 
        changeCurrentPassword, 
        forgotPasswordRequest, 
        resetPasswordRequest, 
        updateUserAvatar
        }