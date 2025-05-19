import { Router } from "express";
import {isLoggedIn} from "../middlewares/auth.middleware.js"
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/note.controllers";

const router = Router()

router.post("/create-note/:projectId",isLoggedIn, createNote)
router.get("/all-notes/:projectId", isLoggedIn, getNotes)
router.get("/note/:noteId", isLoggedIn, getNoteById)
router.put("/update-note/:noteId", isLoggedIn, updateNote)
router.delete("/delete-note/:noteId", isLoggedIn, deleteNote)

export default router