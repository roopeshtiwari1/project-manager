import {asyncHandler} from "../utils/async-handler.js"

const registerUser = asyncHandler( async (req,res) => {
  const {email, password} = req.body

  
})

export {registerUser}