import { Router } from "express";
import { isLoggedIn, validatePermissions } from "../middlewares/auth.middleware";
import { addMemberToProject, createProject, deleteMember, deleteProject, getProjectById, getProjectMembers, getProjects, updateMemberRole, updateProject } from "../controllers/project.controllers";
import { UserRolesEnum } from "../utils/constants.js";


const router = Router()

router.get("/all-projects",isLoggedIn, validatePermissions([ UserRolesEnum.ADMIN]), getProjects)
router.get("/get-project/:projectId", isLoggedIn, getProjectById)
router.post("create-project", isLoggedIn, validatePermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), createProject)
router.put("/update-project/:projectId", isLoggedIn, updateProject)
router.delete("/delete-project/:projectId", isLoggedIn, validatePermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), deleteProject)
router.get("/project-members/:projectId",isLoggedIn, getProjectMembers)
router.post("/add-project-member/:projectId", isLoggedIn, ([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), addMemberToProject)
router.delete("/delete-member/:projectId/:userId", isLoggedIn, ([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), deleteMember)
router.post("/update-member-role/:projectId", isLoggedIn, ([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), updateMemberRole)

export default router