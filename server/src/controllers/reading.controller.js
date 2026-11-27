import { pool } from "../config/db.js";

const ALLOWED_TIME_SLOTS = [
  "Morning",
  "After breakfast",
  "After lunch",
  "After dinner",
];

export const createReading = async (req, res) => {
  try {
    const { reading_date, time_slot, value } = req.body;

    // 1. Validate required fields
    if (!reading_date || !time_slot || value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: "Reading date, time slot and value are required.",
      });
    }

    // 2. Validate date format and actual calendar date
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const parsedDate = new Date(`${reading_date}T00:00:00.000Z`);

    if (
      typeof reading_date !== "string" ||
      !datePattern.test(reading_date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== reading_date
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date in YYYY-MM-DD format.",
      });
    }

    // 3. Validate time slot
    if (!ALLOWED_TIME_SLOTS.includes(time_slot)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot.",
      });
    }

    // 4. Validate glucose value
    if (!Number.isInteger(value) || value < 40 || value > 600) {
      return res.status(400).json({
        success: false,
        message: "Glucose value must be an integer between 40 and 600.",
      });
    }

    // 5. Reject future dates
    const dateCheck = await pool.query(
      "SELECT $1::date > CURRENT_DATE AS is_future",
      [reading_date]
    );

    if (dateCheck.rows[0].is_future) {
      return res.status(400).json({
        success: false,
        message: "Future readings cannot be added.",
      });
    }

    // 6. Insert reading for the authenticated user
    const result = await pool.query(
      `INSERT INTO glucose_readings
        (user_id, reading_date, time_slot, value)
       VALUES ($1, $2, $3, $4)
       RETURNING id, reading_date, time_slot, value, created_at`,
      [req.user.id, reading_date, time_slot, value]
    );

    return res.status(201).json({
      success: true,
      message: "Glucose reading added successfully.",
      reading: result.rows[0],
    });
  } catch (error) {
    // Unique constraint: one reading per slot per day per user
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A reading already exists for this time slot on this date.",
      });
    }

    console.error("Create reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while adding the reading.",
    });
  }
};


export const getReadings = async (req, res) => {
  try {
    const { date } = req.query;

    let query = `
      SELECT id, reading_date, time_slot, value, created_at, updated_at
      FROM glucose_readings
      WHERE user_id = $1
    `;

    const values = [req.user.id];

    // Optional date filter
    if (date) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      const parsedDate = new Date(`${date}T00:00:00.000Z`);

      if (
        !datePattern.test(date) ||
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== date
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid date in YYYY-MM-DD format.",
        });
      }

      query += ` AND reading_date = $2`;
      values.push(date);
    }

    query += `
      ORDER BY reading_date DESC,
      CASE time_slot
        WHEN 'Morning' THEN 1
        WHEN 'After breakfast' THEN 2
        WHEN 'After lunch' THEN 3
        WHEN 'After dinner' THEN 4
      END ASC
    `;

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      readings: result.rows,
    });
  } catch (error) {
    console.error("Get readings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching readings.",
    });
  }
};


export const updateReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { reading_date, time_slot, value } = req.body;

    // 1. Validate required fields
    if (!reading_date || !time_slot || value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: "Reading date, time slot and value are required.",
      });
    }

    // 2. Validate date
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const parsedDate = new Date(`${reading_date}T00:00:00.000Z`);

    if (
      typeof reading_date !== "string" ||
      !datePattern.test(reading_date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== reading_date
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date in YYYY-MM-DD format.",
      });
    }

    // 3. Validate time slot
    if (!ALLOWED_TIME_SLOTS.includes(time_slot)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot.",
      });
    }

    // 4. Validate glucose value
    if (!Number.isInteger(value) || value < 40 || value > 600) {
      return res.status(400).json({
        success: false,
        message: "Glucose value must be an integer between 40 and 600.",
      });
    }

    // 5. Reject future dates
    const dateCheck = await pool.query(
      "SELECT $1::date > CURRENT_DATE AS is_future",
      [reading_date]
    );

    if (dateCheck.rows[0].is_future) {
      return res.status(400).json({
        success: false,
        message: "Future readings cannot be selected.",
      });
    }

    // 6. Update only the authenticated user's reading
    const result = await pool.query(
      `UPDATE glucose_readings
       SET reading_date = $1,
           time_slot = $2,
           value = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING id, reading_date, time_slot, value, created_at, updated_at`,
      [reading_date, time_slot, value, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reading not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Glucose reading updated successfully.",
      reading: result.rows[0],
    });
  } catch (error) {
    // Duplicate date and time slot
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A reading already exists for this time slot on this date.",
      });
    }

    console.error("Update reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the reading.",
    });
  }
};

export const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM glucose_readings
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Reading not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reading deleted successfully.",
    });
  } catch (error) {
    console.error("Delete reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete reading.",
    });
  }
};