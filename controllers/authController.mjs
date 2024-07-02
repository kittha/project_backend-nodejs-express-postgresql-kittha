import { generateToken } from "../utils/jwtUtils.mjs";
import bcrypt from "bcrypt";
import { createUser, findUserByUsername } from "../models/userModel.mjs";
import logger from "../utils/logger.mjs";
// **********
// DEBUGGER ZONE: TO INSPECT OUTGOING JWT Token
// import "dotenv/config";
// import jwt from "jsonwebtoken";
// **********

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExists = await findUserByUsername(username);
    if (userExists) {
      logger.info(`Registration failed: User '${username}' already exists`);
      return res.status(404).json({ message: "User already exists" });
    }
    const userId = await createUser(username, password);
    logger.info(`User registered successfully: ${username} (ID: ${userId})`);
    res.status(201).json({ message: `User id: ${userId} created` });
  } catch (error) {
    logger.error(`Error registering user '${username}': ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await findUserByUsername(username);

    if (!user) {
      logger.info(`Login failed: User '${username}' not found`);
      // OWASP guidelines recommend that app should respond with generic error message!
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.info(`Login failed: Invalid password for user '${username}'`);
      // OWASP guidelines recommend that app should respond with generic error message!
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = generateToken(user);

    // *****
    // DEBUGGER ZONE: TO INSPECT OUTGOING JWT Token
    // jwt.verify(token, process.env.SRV_PRIVATE_KEY, (err, decoded) => {
    //   console.log(decoded);
    // });
    // *****

    logger.info(`User '${username}' logged in successfully`);
    return res.status(200).json({ token });
  } catch (error) {
    logger.error(`Error logging in user '${username}': ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
