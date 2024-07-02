// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
import "dotenv/config";
const { Pool } = pg.default;
import logger from "./logger.mjs";

let connectionPool;

try {
  connectionPool = new Pool({
    user: `${process.env.DB_USERNAME}`,
    password: `${process.env.DB_PASSWORD}`,
    host: "localhost",
    port: 5432,
    database: "techup_Backend-Skill-Checkpoint",
  });
} catch (error) {
  logger.error(`Error creating database connection pool: ${error.message}`);
  process.exit(-1);
}

export default connectionPool;
