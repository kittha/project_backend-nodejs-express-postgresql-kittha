import connectionPool from "../utils/db.mjs";
import bcrypt from "bcrypt";

const saltRounds = 10;

export const createUser = async (username, password, email, name) => {
  const hashPassword = await bcrypt.hash(password, saltRounds);
  const result = await connectionPool.query(
    `
    INSERT INTO users (username, password, email, name)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `,
    [username, hashPassword, email, name]
  );
  return result.rows[0].id;
};

export const findUserByUsername = async (username) => {
  const result = await connectionPool.query(
    `
    SELECT *
    FROM users
    WHERE username = $1
    `,
    [username]
  );
  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const result = await connectionPool.query(
    `
    SELECT *
    FROM users
    WHERE id = $1
    `,
    [id]
  );
  return result.rows[0] || null;
};
