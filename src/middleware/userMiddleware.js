const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../models/user"); // Assuming your model is named User

const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify the token
    const payload = jwt.verify(token, process.env.JWT_KEY);

    // Debug the payload structure
    console.log("Token payload:", payload);

    // Check for user ID in the payload (handle different possible field names)
    const userId =
      payload._id || payload.id || payload.userId || payload.user_id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Invalid token format: missing user identifier" });
    }

    // Check if token is blacklisted in Redis
    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) {
      return res
        .status(401)
        .json({ message: "Session expired, please login again" });
    }

    // Find user in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request object
    req.user = user;

    // Proceed to next middleware or route handler
    next();
  } catch (err) {
    // Handle different types of errors appropriately
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    console.error("Authentication error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error during authentication" });
  }
};

module.exports = userMiddleware;
