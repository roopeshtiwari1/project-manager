import { ApiError } from "../utils/api-error";
import { Project } from "../models/project.models.js";
import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { Task } from "../models/task.models.js";
import mongoose from "mongoose";
import { SubTask } from "../models/subtask.models.js";
import {ProjectMember} from "../models/projectmember.models.js"



const getProjects = asyncHandler ( async (req, res) => {
  const allProjects = await Project.find({})
  if(allProjects.length === 0) {
        throw new ApiError(404, "No projects found!");
    }

  return res
          .status(200)
          .json(new ApiResponse(200, allProjects, "Projects found successfully!"))
});

const getProjectById = asyncHandler ( async (req, res) => {
  const {projectId} = req.params
  if(!projectId) {
    throw new ApiError(400, "invalid project Id")
  }

  const currentProject = await Project.findById(projectId).populate("createdBy", "avatar fullname email")
  if (!currentProject) {
  throw new ApiError(404, "Project not found");
}
  return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              currentProject,
              "project by id fetched successfully"
            )
          )
});

const createProject = asyncHandler ( async (req, res) => {
  const {name, description} = req.body
  const user = req.user

  if(!user) {
    throw new ApiError (400, "unauthorized request, please login")
  }
  if(!name?.trim() || !description?.trim()) {
    throw new ApiError( 400, "name and description is mandatory")
  }
  
  const project = await Project.create(
    {
      name,
      description,
      createdBy: user._id
    }
  )

  return res
          .status(200)
          .json(new ApiResponse(200, project, "project created successfully"))
});

const updateProject = asyncHandler ( async (req, res) => {
  const {projectId} = req.params
  const {name, description} = req.body

  if (!name?.trim() && !description?.trim()) {
    throw new ApiError(400, "Nothing to update");
  }

  const updatedProject = await Project.findByIdAndUpdate(
    projectId, 
    {
      name,
      description
    },
    {
      new: true
    }
  )

  if(!updatedProject) {
    throw new ApiError(404, "Project could not be updated!");
  }

  return res
          .status(200)
          .json(new ApiResponse(200, updatedProject, "project updated successfully"))
});

const deleteProject = asyncHandler (async (req, res) => {
  const {projectId} = req.params
  if(!projectId) {
    throw new ApiError(400, "invalid project Id")
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const tasks = await Task.find(
    {project: mongoose.Types.ObjectId(projectId)}
  )
  const taskIds = tasks.map( task => task._id)

  await ProjectMember.deleteMany({ project: projectId });

  await SubTask. deleteMany({task: {$in: taskIds}})

  await Task.deleteMany( {project: projectId} )

  await Project.findByIdAndDelete(projectId)

  return res
          .status(200)
          .json(new ApiResponse(200, "project with given Id - deleted successfully"))
});

const getProjectMembers = asyncHandler (async (req, res) => {
  const{projectId} = req.params
  if(!projectId) {
    throw new ApiError(400, "invalid project Id")
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const currentProjectMembers = await ProjectMember.find(
    {project: mongoose.Types.ObjectId(projectId)}
  ).populate("user", "username fullname avatar")

  return res
          .status(200)
          .json(new ApiResponse(200, currentProjectMembers, "project members fetched successfully"))
});

const addMemberToProject = asyncHandler (async (req, res) => {
  const {projectId} = req.params
  const {userId, role} = req.body

  if(!userId || !role || !projectId ) {
    throw new ApiError(400, "projectId,userId and role is mandatory")
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const isMemberExists = await ProjectMember.findone(
    {
      user: mongoose.Types.ObjectId(userId),
      project: mongoose.Types.ObjectId(projectId),
    }
  )

  if(isMemberExists) {
    throw new ApiError(400,"member already exists in this particular project")
  }

  const newProjectMember = await ProjectMember.create(
    {
      user: userId,
      project: projectId,
      role
    }
  )

  if(!newProjectMember) {
    throw new ApiError(500, "newMember not saved in database")
  }

  return res
          .status(200)
          .json(new ApiResponse(200, newProjectMember, "member added successfully in project" ))
});

const deleteMember = asyncHandler ( async (req, res) => {
  const {projectId, userId} = req.params   // userId and projectId of member through params, which we want to remove

  if(!userId || !projectId) {
    throw new ApiError(400, "userId and projectId is mandatory")
  }

  await ProjectMember.deleteOne(
    {
      user: userId,
      project: projectId
    }
  )

  return res
          .status(200)
          .json(new ApiResponse(200, "member deleted from project successfully"))
});

const updateMemberRole = asyncHandler (async (req, res) => {
  const {projectId} = req.params
  const {userId, role} = req.body

  if(!userId || !role || !projectId) {
    throw new ApiError(400, "projectId,userId and role is mandatory")
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const isMemberExists = await ProjectMember.findOne(
    {
      user: mongoose.Types.ObjectId(userId),
      project: mongoose.Types.ObjectId(projectId),
    }
  )

  if(!isMemberExists) {
    throw new ApiError(400, "member doesnot exists")
  }
  if(isMemberExists.role === role) {
    throw new ApiError(400, "member already has the same role")
  }

  const updatedProjectMember = await ProjectMember.findOneAndUpdate(
    {
      user: mongoose.Types.ObjectId(userId),
      project: mongoose.Types.ObjectId(projectId),
    },
    {
      role
    },
    {
      new: true
    }
  ).populate("user", "username fullname avatar")

  return res
          .status(200)
          .json(new ApiResponse(200, updatedProjectMember, "member role updated successfully"))
});

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};