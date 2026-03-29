import genToken from "./token.js";

export const sendToken = (user, statusCode, message, res) => {
  const token = genToken(user._id);
  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      sameSite: "none", 
      secure: process.env.NODE_ENV === "production", 
    })
    .json({
      success: true,
      user,
      message,
      token,
    });
};
