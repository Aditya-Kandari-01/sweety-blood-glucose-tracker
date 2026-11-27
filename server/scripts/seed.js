import "dotenv/config";
import bcrypt from "bcrypt";
import { pool } from "../src/config/db.js";

const DEMO_USER = {
  name: "Sweety Demo User",
  email: process.env.SEED_DEMO_EMAIL || "demo@sweety.com",
  password: process.env.SEED_DEMO_PASSWORD || "SweetyDemo@123",
};

// Format a JavaScript date as YYYY-MM-DD using local date components.
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDate = (monthOffset, day) => {
  const today = new Date();

  return formatDate(
    new Date(today.getFullYear(), today.getMonth() + monthOffset, day)
  );
};

const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");

    // Create or update the demo user.
    const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);

    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash
       RETURNING id, name, email`,
      [DEMO_USER.name, DEMO_USER.email, passwordHash]
    );

    const user = userResult.rows[0];

    // Sample readings from the current and previous months.
    const readings = [
      // Current month
      [getDate(0, 1), "Morning", 105],
      [getDate(0, 1), "After breakfast", 142],
      [getDate(0, 5), "Morning", 98],
      [getDate(0, 5), "After lunch", 156],
      [getDate(0, 12), "Morning", 110],
      [getDate(0, 12), "After dinner", 148],
      [formatDate(new Date()), "Morning", 102],
      [formatDate(new Date()), "After breakfast", 135],

      // Previous month
      [getDate(-1, 5), "Morning", 108],
      [getDate(-1, 5), "After breakfast", 145],
      [getDate(-1, 15), "Morning", 95],
      [getDate(-1, 15), "After lunch", 160],
      [getDate(-1, 25), "Morning", 112],
      [getDate(-1, 25), "After dinner", 150],
    ];

    let insertedCount = 0;

    for (const [date, timeSlot, value] of readings) {
      const result = await pool.query(
        `INSERT INTO glucose_readings
          (user_id, reading_date, time_slot, value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, time_slot)
         DO NOTHING`,
        [user.id, date, timeSlot, value]
      );

      insertedCount += result.rowCount;
    }

    console.log("Database seeding completed!");
    console.log(`Demo user: ${user.email}`);
    console.log(`New readings inserted: ${insertedCount}`);
    console.log("Demo password:", DEMO_USER.password);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seedDatabase();
