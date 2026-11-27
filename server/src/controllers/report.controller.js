import { pool } from "../config/db.js";

export const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;

    // Validate the selected date
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date in YYYY-MM-DD format.",
      });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid calendar date.",
      });
    }

    // Fetch daily statistics
    const statsResult = await pool.query(
      `SELECT
         MAX(value) AS highest,
         MIN(value) AS lowest,
         ROUND(AVG(value)::numeric, 1) AS average,
         COUNT(*) AS count
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date = $2`,
      [req.user.id, date]
    );

    // Fetch individual readings
    const readingsResult = await pool.query(
      `SELECT
         id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         time_slot,
         value
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date = $2
       ORDER BY
         CASE time_slot
           WHEN 'Morning' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
         END`,
      [req.user.id, date]
    );

    const stats = statsResult.rows[0];

    return res.status(200).json({
      success: true,
      report: {
        period: "daily",
        start_date: date,
        end_date: date,
        statistics: {
          highest: stats.highest === null ? null : Number(stats.highest),
          lowest: stats.lowest === null ? null : Number(stats.lowest),
          average: stats.average === null ? null : Number(stats.average),
          count: Number(stats.count),
        },
        readings: readingsResult.rows,
      },
    });
  } catch (error) {
    console.error("Daily report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate daily report.",
    });
  }
};

export const getMonthToDateReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date in YYYY-MM-DD format.",
      });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid calendar date.",
      });
    }

    // Calculate the first day of the selected month
    const startDate = `${date.slice(0, 7)}-01`;
    const endDate = date;

    const statsResult = await pool.query(
      `SELECT
         MAX(value) AS highest,
         MIN(value) AS lowest,
         ROUND(AVG(value)::numeric, 1) AS average,
         COUNT(*) AS count
       FROM glucose_readings
       WHERE user_id = $1
         AND reading_date BETWEEN $2 AND $3`,
      [req.user.id, startDate, endDate]
    );

    const stats = statsResult.rows[0];

    return res.status(200).json({
      success: true,
      report: {
        period: "month-to-date",
        start_date: startDate,
        end_date: endDate,
        statistics: {
          highest: stats.highest === null ? null : Number(stats.highest),
          lowest: stats.lowest === null ? null : Number(stats.lowest),
          average: stats.average === null ? null : Number(stats.average),
          count: Number(stats.count),
        },
      },
    });
  } catch (error) {
    console.error("Month-to-date report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate month-to-date report.",
    });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date in YYYY-MM-DD format.",
      });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid calendar date.",
      });
    }

    // Calculate the previous calendar month's date range
    const year = parsedDate.getUTCFullYear();
    const month = parsedDate.getUTCMonth();

    const startDate = new Date(
      Date.UTC(year, month - 1, 1)
    ).toISOString().slice(0, 10);

    const endDate = new Date(
      Date.UTC(year, month, 0)
    ).toISOString().slice(0, 10);

    const statsResult = await pool.query(
      `SELECT
         MAX(value) AS highest,
         MIN(value) AS lowest,
         ROUND(AVG(value)::numeric, 1) AS average,
         COUNT(*) AS count
       FROM glucose_readings
       WHERE user_id = $1
         AND reading_date BETWEEN $2 AND $3`,
      [req.user.id, startDate, endDate]
    );

    const stats = statsResult.rows[0];

    return res.status(200).json({
      success: true,
      report: {
        period: "monthly",
        start_date: startDate,
        end_date: endDate,
        statistics: {
          highest: stats.highest === null ? null : Number(stats.highest),
          lowest: stats.lowest === null ? null : Number(stats.lowest),
          average: stats.average === null ? null : Number(stats.average),
          count: Number(stats.count),
        },
      },
    });
  } catch (error) {
    console.error("Monthly report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly report.",
    });
  }
};