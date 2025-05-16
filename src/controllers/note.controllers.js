import { asyncHandler } from "../utils/async-handler";
import {ApiError} from "../utils/api-error.js";
import {ApiResponse} from "../utils/api-response.js"
import { ProjectNote } from "../models/note.models";



const createNote = asyncHandler(async (req, res) => {
  const{projectId} = req.params
  const{content} = req.body
  
  if(!projectId) {
    throw new ApiError(400, "invalid project id")
  }
  if(!content) {
    throw new ApiError(400, "content is mandatory")
  }

  const note = await ProjectNote.create(
    {
      project: projectId,
      content: content.trim(),
      createdBy: req.user._id
    }
  )
  const populatedNote = await ProjectNote.findById(note._id).populate("project","name description").populate("createdBy","username fullname avatar")

  return res
          .status(200)
          .json(new ApiResponse(200, populatedNote, "note created successfully"))

});

const getNotes = asyncHandler (async (req, res) => {
  const{projectId} = req.params
  if(!projectId) {
    throw new ApiError(400, "invalid project id")
  }

  const notes = await ProjectNote.find({project: projectId}).sort({ createdAt: -1 }).populate("createdBy", "username fullname avatar")

  return res
          .status(200)
          .json(new ApiResponse(200, notes, "fetched all notes related to particular project"))
});

const getNoteById = async (req, res) => {
  const {noteId} = req.params
  if(!noteId) {
    throw new ApiError(400, "invalid noteId")
  }

  const note = await ProjectNote.findOne({_id: noteId}).populate("project","name description").populate("createdBy","username fullname avatar")
  if(!note) {
    throw new ApiError(400, "note not found")
  }

  return res
          .status(200)
          .json(new ApiResponse(200, note, "note fetched successfully"))
};

const updateNote = async (req, res) => {
  const {noteId} = req.params
  const{content} = req.body
  if(!noteId) {
    throw new ApiError(400, "invalid noteId")
  }
  if(!content) {
    throw new ApiError(400, "content is mandatory")
  }

  const updatedNote = await ProjectNote.findByIdAndUpdate(
    noteId,
    {
      content: content.trim()
    },
    {
      new: true
    }
  ).populate("project","name description").populate("createdBy","username fullname avatar")

  if (!updatedNote) {
    throw new ApiError(404, "Note not found");
  }

  return res
          .status(200)
          .json(new ApiResponse(200, updatedNote, "note updated successfully"))
};

const deleteNote = async (req, res) => {
  const{noteId}= req.params
  if(!noteId) {
    throw new ApiError(400, "invalid noteId")
  }

  const note = await ProjectNote.findById(noteId);
  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  await ProjectNote.deleteOne(noteId)

  return res
          .status(200)
          .json(new ApiResponse(200, "note deleted successfully"))
};

export { createNote, deleteNote, getNoteById, getNotes, updateNote }