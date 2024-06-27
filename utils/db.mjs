// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
import "dotenv/config";
const { Pool } = pg.default;

const connectionPool = new Pool({
  user: `${process.env.DB_USERNAME}`,
  password: `${process.env.DB_PASSWORD}`,
  host: "localhost",
  port: 5432,
  database: "techup_Backend-Skill-Checkpoint",
});

export default connectionPool;
