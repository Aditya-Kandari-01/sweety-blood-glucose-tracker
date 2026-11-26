import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg; // manages database connections so we can reuse them.

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const testDatabaseConnection = async () => {
  try {
    // SELECT NOW() checks whether the connection works.
    const result = await pool.query("SELECT NOW() AS current_time"); 

    console.log("PostgreSQL connected successfully!");
    console.log("Database time:", result.rows[0].current_time);
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    throw error;
  }
};
