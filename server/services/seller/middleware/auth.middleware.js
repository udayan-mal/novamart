const jwt = require("jsonwebtoken");
const { AppError } = require("../../../shared/utils");

exports.authenticate = (req, _res, next) => {
  try {
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization?.startsWith("Bearer") ? req.headers.authorization.split(" ")[1] : null);

    if (!token) throw AppError.unauthorized("Please login to continue");

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(AppError.unauthorized("Invalid or expired token"));
  }
};

exports.authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden("You are not authorized to perform this action"));
    }
    next();
  };
};
