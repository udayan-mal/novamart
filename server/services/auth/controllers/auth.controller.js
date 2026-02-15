const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const { AppError, generateOtp, isOtpExpired, validateEmail, validatePassword } = require("../../../shared/utils");
const { sendEmail } = require("../utils/email");

// Generate access & refresh tokens
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET || "access_secret",
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || "refresh_secret",
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" }
  );
  return { accessToken, refreshToken };
}

// Set token cookies
function setTokenCookies(res, accessToken, refreshToken) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// ── REGISTER ──────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      throw AppError.badRequest("Name, email and password are required");
    if (!validateEmail(email)) throw AppError.badRequest("Invalid email address");

    const { isValid, errors } = validatePassword(password);
    if (!isValid) throw AppError.badRequest("Password is too weak", { password: errors.join(", ") });

    const existingUser = await User.findOne({ email });
    if (existingUser) throw AppError.conflict("An account with this email already exists");

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpiry,
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "Verify your NovaMart account",
      html: `<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fafafa;border-radius:12px">
        <h2 style="color:#4f46e5;margin:0 0 16px">Welcome to NovaMart!</h2>
        <p>Hi ${name}, your verification code is:</p>
        <div style="text-align:center;margin:24px 0">
          <span style="font-size:32px;letter-spacing:8px;font-weight:700;color:#4f46e5">${otp}</span>
        </div>
        <p style="color:#737373;font-size:14px">This code expires in 5 minutes.</p>
      </div>`,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: false },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// ── VERIFY OTP ────────────────────────────────────────────────
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) throw AppError.badRequest("Email and OTP are required");

    const user = await User.findOne({ email }).select("+otp +otpExpiry");
    if (!user) throw AppError.notFound("User not found");
    if (user.isVerified) throw AppError.badRequest("Account already verified");
    if (!user.otp || isOtpExpired(user.otpExpiry)) throw AppError.badRequest("OTP expired, please request a new one");
    if (user.otp !== otp) throw AppError.badRequest("Invalid OTP");

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

// ── RESEND OTP ────────────────────────────────────────────────
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw AppError.badRequest("Email is required");

    const user = await User.findOne({ email });
    if (!user) throw AppError.notFound("User not found");
    if (user.isVerified) throw AppError.badRequest("Account already verified");

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: "Your NovaMart verification code",
      html: `<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px"><h2 style="color:#4f46e5">Verification Code</h2><div style="text-align:center;margin:24px 0"><span style="font-size:32px;letter-spacing:8px;font-weight:700;color:#4f46e5">${otp}</span></div><p style="color:#737373;font-size:14px">This code expires in 5 minutes.</p></div>`,
    });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    next(error);
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw AppError.badRequest("Email and password are required");

    const user = await User.findOne({ email }).select(
      "+password +failedLoginAttempts +lockUntil"
    );
    if (!user) throw AppError.unauthorized("Invalid email or password");
    if (user.isBanned) throw AppError.forbidden("Your account has been suspended");

    // Account lock check
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      throw AppError.tooManyRequests(
        `Account locked. Try again in ${remaining} minutes.`
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
        user.failedLoginAttempts = 0;
      }
      await user.save();
      throw AppError.unauthorized("Invalid email or password");
    }

    // Reset failed attempts on success
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      message: "Login successful",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// ── REFRESH TOKEN ─────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw AppError.unauthorized("No refresh token");

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "refresh_secret");
    const user = await User.findById(decoded.userId);
    if (!user) throw AppError.unauthorized("User not found");

    const { accessToken, refreshToken } = generateTokens(user._id);
    setTokenCookies(res, accessToken, refreshToken);

    res.json({ success: true, accessToken });
  } catch (error) {
    next(AppError.unauthorized("Invalid refresh token"));
  }
};

// ── LOGOUT ────────────────────────────────────────────────────
exports.logout = async (_req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
};

// ── FORGOT PASSWORD ───────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw AppError.badRequest("Email is required");

    const user = await User.findOne({ email });
    if (!user) throw AppError.notFound("No account with that email");

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await user.save();

    const resetUrl = `${process.env.WEB_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your NovaMart password",
      html: `<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px"><h2 style="color:#4f46e5">Password Reset</h2><p>Click the link below to reset your password:</p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0">Reset Password</a><p style="color:#737373;font-size:14px">This link expires in 30 minutes.</p></div>`,
    });

    res.json({ success: true, message: "Password reset link sent to your email" });
  } catch (error) {
    next(error);
  }
};

// ── RESET PASSWORD ────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) throw AppError.badRequest("Token and new password are required");

    const { isValid, errors } = validatePassword(password);
    if (!isValid) throw AppError.badRequest("Password is too weak", { password: errors.join(", ") });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpiry");

    if (!user) throw AppError.badRequest("Invalid or expired reset token");

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

// ── GET ME ────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── CHANGE PASSWORD ───────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) throw AppError.badRequest("Both passwords are required");

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw AppError.badRequest("Current password is incorrect");

    const { isValid, errors } = validatePassword(newPassword);
    if (!isValid) throw AppError.badRequest("New password is too weak", { password: errors.join(", ") });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
