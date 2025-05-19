import { Router } from "express";
import { isLoggedIn, validatePermissions } from "../middlewares/auth.middleware";
import { createSubTask, createTask, deleteSubTask, deleteTask, getTaskById, getTasks, updateSubTask, updateTask } from "../controllers/task.controllers";

const router = Router()

router.get("/all-tasks/:projectId", isLoggedIn, getTasks)
router.get("/task/:teskId", isLoggedIn, getTaskById)
router.post("/create-task/:projectId", isLoggedIn, createTask)
router.put("/update-task/:taskId", isLoggedIn, updateTask)
router.delete("/delete-task/:taskId", isLoggedIn, deleteTask)
router.post("/create-subtask/:taskId",isLoggedIn, createSubTask)
router.put("/update-subtask/:subTaskId", isLoggedIn, updateSubTask)
router.delete("/delete-subtask/:subTaskId", isLoggedIn, deleteSubTask)

export default router