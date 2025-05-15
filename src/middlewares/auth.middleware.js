import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt, { decode } from "jsonwebtoken"
import { User } from "../models/user.models.js";


export const isLoggedIn =asyncHandler (async (req,res,next) => {
  try {
    const token = req.cookie?.accessToken || req.header("Authorization").replace("Bearer ", "")

    if (!token) {
      throw new ApiError(401, "Unauthorized request, user is not loggedin")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findOne(decodedToken).select("-password -refreshToken")

    if(!user) {
      throw new ApiError(400,"not a loggedin user, invalid accessToken")
    }
    req.user = user
    next()

  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }
})