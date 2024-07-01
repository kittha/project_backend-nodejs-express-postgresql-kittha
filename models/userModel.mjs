import connectionPool from "../utils/db.mjs";
import bcrypt from "bcrypt";
import logger from "../utils/logger.mjs";

const saltRounds = 10;

export const createUser = async (username, password, email, name) => {
  try {
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const result = await connectionPool.query(
      `
      INSERT INTO users (username, password, email, name)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [username, hashPassword, email, name]
    );
    const userId = result.rows[0].id;
    logger.info(`User created successfully: ${username} (ID: ${userId})`);
    return userId;
  } catch (error) {
    logger.error(`Error creating user: ${username}. Error: ${error.message}`);
    throw error;
  }
};

export const findUserByUsername = async (username) => {
  try {
    const result = await connectionPool.query(
      `
      SELECT *
      FROM users
      WHERE username = $1
      `,
      [username]
    );
    const user = result.rows[0];

    if (user) {
      logger.debug(`User found by username: ${username}`);
    } else {
      logger.debug(`User not found with username: ${username}`);
    }

    return user || null;
  } catch (error) {
    logger.error(
      `Error finding user by username: ${username}. Error: ${error.message}`
    );
    throw error;
  }
};

export const findUserById = async (id) => {
  try {
    const result = await connectionPool.query(
      `
      SELECT *
      FROM users
      WHERE id = $1
      `,
      [id]
    );
    const user = result.rows[0];

    if (user) {
      logger.debug(`User found by ID: ${id}`);
    } else {
      logger.debug(`User not found with ID: ${id}`);
    }

    return user || null;
  } catch (error) {
    logger.error(`Error finding user by ID: ${id}. Error: ${error.message}`);
    throw error;
  }
};
