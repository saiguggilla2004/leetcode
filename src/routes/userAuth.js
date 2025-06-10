const express = require("express");
const {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
} = require("../controllers/userAuthenticate");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const authRouter = express.Router();

//register
authRouter.post("/register", register);
//login
authRouter.post("/login", login);
//logout
authRouter.get("/logout", userMiddleware, logout);

authRouter.post("/admin/register",adminMiddleware,adminRegister)
//get user
// authRouter.get("/getProfile", getProfile);
authRouter.delete("/deleteProfile",userMiddleware,deleteProfile)
module.exports = authRouter;
