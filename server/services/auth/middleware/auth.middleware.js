const jwt = require("jsonwebtoken");
const { AppError } = require("../../../shared/utils");
const User = require("../models/user.model");

async function authenticate(req, _res, next) {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) throw AppError.unauthorized("Please login to continue");

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "access_secret");
    const user = await User.findById(decoded.userId);

    if (!user) throw AppError.unauthorized("User not found");
    if (user.isBanned) throw AppError.forbidden("Your account has been suspended");

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if (error.name === "TokenExpiredError")
      return next(AppError.unauthorized("Token expired, please login again"));
    next(AppError.unauthorized("Invalid token"));
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden("You don't have permission to access this resource"));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
