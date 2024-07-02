import connectionPool from "../utils/db.mjs";

export const createRefreshTokenInDb = async (userId, token, expiresAt) => {
  const result = await connectionPool.query(
    `
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
    [userId, token, expiresAt]
  );

  return result.rows[0].id;
};

export const findRefreshTokenInDb = async (token) => {
  const result = await connectionPool.query(
    `
        SELECT * FROM refresh_tokens
        WHERE token = $1
        `,
    [token]
  );
  return result.rows[0] || null;
};

export const deleteRefreshTokenInDb = async (token) => {
  await connectionPool.query(
    `
        DELETE FROM refresh_tokens
        WHERE token = $1
        `,
    [token]
  );
};
