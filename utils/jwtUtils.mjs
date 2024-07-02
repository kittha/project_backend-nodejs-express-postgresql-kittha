import jwt from "jsonwebtoken";
import "dotenv/config";

const secretKey = process.env.SRV_PRIVATE_KEY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_PRIVATE_KEY;

export const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, secretKey, {
    expiresIn: "1h",
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    refreshTokenSecretKey,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, refreshTokenSecretKey, (error, decoded) => {
      if (error) {
        return reject(error);
      }
      resolve(decoded);
    });
  });
};
