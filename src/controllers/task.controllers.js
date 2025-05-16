import mongoose from "mongoose";
import { Task } from "../models/task.models.js";
import {ApiError} from "../utils/api-error.js";
import {ApiResponse} from "../utils/api-response.js"
import {ProjectMember} from "../models/projectmember.models.js"
import {asyncHandler} from "../utils/async-handler.js"
import { SubTask } from "../models/subtask.models.js";


// get all tasks
const getTasks = asyncHandler(async (req, res) => {
  const{projectId} = req.params

  if(!projectId){
    throw new ApiError(400, "invalid project id")
  }
  const projectMember = await ProjectMember.findOne(
    {user: req.user._id}
  )

  let tasks =[]
  if(projectMember.role === "member" || projectMember.role === "project_admin") {
    tasks = await Task.find(
      {project: mongoose.Types.ObjectId(projectId)}
    )

    if(!tasks) {
      throw new ApiError(400, "no task found for this project")
    }
  }

  return res
          .status(200)
          .json(new ApiResponse(200, tasks, "fetched all the task related to project"))

});

// get task by id
const getTaskById =asyncHandler (async (req, res) => {
  const {taskId} = req.params
  if(!taskId) {
    throw new ApiError(400, "invalid task id")
  }

  const task = await Task.findById(taskId).populate("project","name description").populate("assignedTo", "username fullname avatar").populate("assignedBy", "username fullname avatar").populate("attachments", "url mimeType size")
  if(!task) {
    throw new ApiError(400, "task not found, try again")
  }

  return res
          .status(200)
          .json(new ApiResponse(200, task, "task fetched successfully"))
});

// create task
const createTask = asyncHandler(async (req, res) => {
  const {title, description, assignedTo, status, attachments} = req.body
  const {projectId} = req.params

  if(!projectId) {
    throw new ApiError(400, "project id is mandatory")
  }
  if(!title || !description || !assignedTo) {
    throw new ApiError(400, "title,description,assignedTo are mandatory fields")
  }

  const newTask = await Task.create(
    {
      title,
      description,
      project: projectId,
      assignedTo,
      assignedBy: req.user._id,
      status,
      attachments
    }
  )

  const populatedNewTask = await Task.findById(newTask._id).populate("project", "name description").populate("assignedTo", "username fullname avatar").populate("assignedBy", "username fullname avatar")

  return res
          .status(201)
          .json(new ApiResponse(201, populatedNewTask, "Task created successfully")
  );
});

// update task
const updateTask = asyncHandler (async (req, res) => {
  const{taskId} = req.params
  const{title, description, status, attachments} = req.body

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      title,
      description,
      status,
      attachments
    },
    {
      new: true
    }
  )

  if (!updatedTask) {
    throw new ApiError(404, "Task Not Found");
  }

  return res
          .status(200)
          .json(new ApiResponse(200, updateTask, "task updated successfully"))
});

// delete task
const deleteTask = asyncHandler (async (req, res) => {
  const{taskId} = req.params
  if(!taskId) {
    throw new ApiError(400, "invalid task id")
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await SubTask.deleteMany({task: taskId})

  await Task.deleteOne({ _id: taskId })

  return res
          .status(200)
          .json(new ApiResponse(200, "Task and related subtasks deleted successfully"))
});

// create subtask
const createSubTask = asyncHandler(async (req, res) => {
  const{taskId} = req.params
  const{title} = req.body

  if(!taskId) {
    throw new ApiError(400, "invalid task id")
  }
  if(!title){
    throw new ApiError(400, "title is mandatory")
  }

  const subtask = await SubTask.create(
    {
      title: title.trim(),
      task: taskId,
      isCompleted: false,
      createdBy: req.user._id
    }
  )

  return res
          .status(200)
          .json(new ApiResponse(200, subtask, "subtask created successfully"))

});

// update subtask
const updateSubTask = asyncHandler(async (req, res) => {
  const{subtaskId}= req.params
  const{title, isCompleted} = req.body

  if(!subtaskId) {
    throw new ApiError(400, "invalid suntask id")
  }

  const updatedSubtask = await SubTask.findByIdAndUpdate(
    subtaskId,
    {
      title,
      isCompleted
    },
    {
      new: true
    }
  )

  return res
          .status(200)
          .json(new ApiResponse(200,updatedSubtask, "subtask updated successfully"))
});

// delete subtask
const deleteSubTask = asyncHandler(async (req, res) => {
  const{subtaskId} = req.params
  if(!subtaskId) {
    throw new ApiError(400, "invalid suntask id")
  }

  const subtask = await SubTask.findById(subtaskId)
  if(!subtask) {
    throw new ApiError(400, "subtask doesnot exists")
  }

  await SubTask.deleteOne({_id: subtaskId})

  return res
          .status(200)
          .json(new ApiResponse(200, "subtask deleted successfully"))
});

export {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
};