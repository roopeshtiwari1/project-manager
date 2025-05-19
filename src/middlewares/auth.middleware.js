import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt, { decode } from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import mongoose from "mongoose";


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


export const validatePermissions = (roles = []) => asyncHandler(async(req,res,next)=> {
  try {
    const {projectId} = req.params

  if(!projectId) {
    throw new ApiError(400, "unathorized request")
  }

  const projectMember = await ProjectMember.findOne(
    {
      project: mongoose.Types.ObjectId(projectId),
      user: mongoose.Types.ObjectId( req.user._id)
    }
  )
  if(!projectMember) {
    throw new ApiError(400, "project member not found")
  }

  const givenRole = projectMember.role

  if(!roles.includes(givenRole)) {
    throw new ApiError (400, "not authorized to perform this task")
  }

  req.user.role = givenRole
  next()
  } catch (error) {
     throw new ApiError(400, error?.message || "project permission failed")
  }
})