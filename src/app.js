import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
  origin: process.env.BASE_URL,
  credentials: true,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())


// router imports

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authenticationRouter from "./routes/auth.routes.js"
import projectRouter from "./routes/project.routes.js"
import taskRouter from "./routes/task.routes.js"
import noteRouter from "./routes/note.routes.js"


app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/users", authenticationRouter)
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/note", noteRouter);

export default app 