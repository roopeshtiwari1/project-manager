import app from "./app.js"
import dotenv from "dotenv"
import connectDb from "./db/index.js";

dotenv.config({
    path: "./.env"
})

const port = process.env.PORT || 5000;

connectDb()
    .then( ()=> {
        app.listen(port, () => {
            console.log(`server is running on port: ${port}`)
        })
    })
    .catch((err)=> {
        console.error("mongodb connection error",err)
        process.exit(1)
    })



