const jwt = require("jsonwebtoken");
const { AppError } = require("../../../shared/utils");

function authenticate(req, _res, next) {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
    if (!token) throw AppError.unauthorized("Please login to continue");
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "access_secret");
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(AppError.unauthorized("Invalid token"));
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden("You don't have permission"));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
