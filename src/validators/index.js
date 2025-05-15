import {body} from "express-validator"

const userRegistrationValidator = () => {
  return [
    body('username')
        .trim()
        .notEmpty().withMessage("username is required")
        .isLength({min: 3, max:20}).withMessage("Username must be between 3 to 20 characters")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

    body('fullname')
        .trim()
        .matches(/^[a-zA-Z]+$/).withMessage('Username can only contain letters'),

    body('email')
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email is invalid")
        .normalizeEmail(),

    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &)'),
  ]
}

const userLoginValidator = () => {
  return [
    body('email')
        .notEmpty().withMessage("email is required")
        .isEmail().withMessage("invalid email")
        .normalizeEmail(),
    body('password')
        .isLength({min: 8}).withMessage("minimum 8 character password")
        .notEmpty().withMessage("password cannot be empty")
  ]
}

const changeCurrentPasswordValidator = () => {
  return [
    body('oldPassword')
        .notEmpty().withMessage("Old password is required"),
    body('newPassword')
        .notEmpty().withMessage("new password is required"),
    body('confirmPassword')
        .notEmpty().withMessage("confirm password is required")
  ]
}

const forgotPasswordRequestValidator = () => {
  return [
    body('email')
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email is invalid")
  ]
}

const resetPasswordRequestValidator = ()=> {
  return [
    body(newPassword) 
        .trim()
        .notEmpty().withMessage("new Password is required")
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &)')
  ]
}


export {userRegistrationValidator, userLoginValidator, changeCurrentPasswordValidator, forgotPasswordRequestValidator, resetPasswordRequestValidator}