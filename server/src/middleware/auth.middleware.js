import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  try {
    // 1. Read JWT from HttpOnly cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach authenticated user's ID to request
    req.user = {
      id: decoded.userId,
    };

    // 4. Allow request to continue
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};
