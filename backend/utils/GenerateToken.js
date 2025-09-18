import jwt from "jsonwebtoken";

const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    Fullname: user.Fullname,
    isEmailVerified: user.isEmailVerified
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
    issuer: "career-assessment-api",
    audience: "career-assessment-users"
  });
};

export default generateToken;