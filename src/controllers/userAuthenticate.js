const validate = require("../utils/validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const submission = require("../models/submission");


const register = async (req, res) => {
  try {
    //validate the data
    validate(req.body);
    const { firstName, lastName, emailId, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, emailId: emailId ,role:"user"},
      process.env.JWT_KEY,
      {
        expiresIn: 60 * 60,
      }
    );
    res.cookie("token", token, {
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).send("user registered succesfully");
  } catch (e) {
    res.status(400).send("Error" + " " + e);
  }
};

const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Input validation
    if (!emailId) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find user by email - MISSING AWAIT HERE IN ORIGINAL CODE
    const user = await User.findOne({ emailId });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare passwords - MISSING AWAIT HERE IN ORIGINAL CODE
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId,role:user.role },
      process.env.JWT_KEY,
      {
        expiresIn: 60 * 60, // 1 hour in seconds
      }
    );

    // Set cookie
    res.cookie("token", token, {
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
      httpOnly: true, // Adds security by preventing client-side JS from reading the cookie
      sameSite: "strict", // Adds CSRF protection
    });

    // Send success response
    return res.status(200).json({ message: "Logged in successfully" });
  } catch (e) {
    console.error("Login error:", e);
    return res
      .status(500)
      .json({ message: "Internal server error during login" });
  }
};

const logout = async (req, res) => {
  try {
    //validate the token
    const { token } = req.cookies;
    const payload = jwt.decode(token);
    //add the token to the redis block list
    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);
    //clear the cookies

    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.send("logged out succesfully");
  } catch (e) {
    res.status(401).send("Error " + e);
  }
};


const adminRegister=async (req,res)=>{
  try {
    //validate the data
    validate(req.body);
    const { firstName, lastName, emailId, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    // req.body.role="admin";
    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      {
        expiresIn: 60 * 60,
      }
    );
    res.cookie("token", token, {
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).send("admin registered succesfully");
  } catch (e) {
    res.status(400).send("Error" + " " + e);
  }
}

const deleteProfile=async (req,res)=>{
   try
   {
      const userId=req.user._id;
      if(!userId)
      {
        return res.status(400).send("Invalid User ID");
      }

      await User.findByIdAndDelete(userId);
      await submission.deleteMany({
        userId: userId,
      });

      res.status(201).send("Profile deleted successfully");
   }
   catch(e)
   {
    return res.status(400).send("Error Occured: " + e.message);
   }

}


module.exports = { register, login, logout, adminRegister, deleteProfile };
