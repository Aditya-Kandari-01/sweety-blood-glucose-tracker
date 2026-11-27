import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ReadingForm from "../components/ReadingForm";
import { getReadings, deleteReading } from "../services/reading.service";
import {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
} from "../services/report.service";

const Dashboard = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReading, setEditingReading] = useState(null);

  const [dailyReport, setDailyReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState("");

  const [monthToDateReport, setMonthToDateReport] = useState(null);
  const [previousMonthReport, setPreviousMonthReport] = useState(null);
  const [monthlyReportLoading, setMonthlyReportLoading] = useState(true);
  const [monthlyReportError, setMonthlyReportError] = useState("");

  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getToday());

  
  const refreshDashboard = async () => {
    await Promise.all([
      fetchReadings(),
      fetchDailyReport(selectedDate),
      fetchMonthlyReports(selectedDate),
    ]);
  };

  const fetchReadings = async () => {
    try {
      setError("");
      const response = await getReadings();
      setReadings(response.readings);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyReport = async (date) => {
    try {
      setReportError("");
      setReportLoading(true);

      const response = await getDailyReport(date);
      setDailyReport(response.report);
    } catch (error) {
      setReportError(error.message);
    } finally {
      setReportLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this glucose reading?",
    );

    if (!confirmed) return;

    try {
      await deleteReading(id);
      await refreshDashboard();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (reading) => {
    setEditingReading(reading);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingReading(null);
  };


  const fetchMonthlyReports = async (date) => {
    try {
      setMonthlyReportError("");
      setMonthlyReportLoading(true);

      const [monthToDateResponse, previousMonthResponse] =
        await Promise.all([
          getMonthToDateReport(date),
          getPreviousMonthReport(date),
        ]);

      setMonthToDateReport(monthToDateResponse.report);
      setPreviousMonthReport(previousMonthResponse.report);
    } catch (error) {
      setMonthlyReportError(error.message);
    } finally {
      setMonthlyReportLoading(false);
    }
  };


  useEffect(() => {
    fetchReadings();
  }, []);

  useEffect(() => {
    fetchDailyReport(selectedDate);
    fetchMonthlyReports(selectedDate);
  }, [selectedDate]);

  return (
    <div className="dashboard">
      <Navbar />

      <main className="dashboard-content">
        <section className="dashboard-overview">
          <h2>
            {selectedDate === getToday()
              ? "Today's Overview"
              : `Overview for ${selectedDate}`}
          </h2>
          <div className="report-date-selector">
            <label htmlFor="report-date">Select Date</label>
            <input
              type="date"
              id="report-date"
              value={selectedDate}
              max={getToday()}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>

          {reportLoading && <p>Loading statistics...</p>}

          {reportError && <p className="error-message">{reportError}</p>}

          {!reportLoading && !reportError && dailyReport && (
            <div className="statistics-grid">
              <div className="stat-card">
                <h3>Highest</h3>
                <p>
                  {dailyReport.statistics.highest ?? "--"}
                  <span> mg/dL</span>
                </p>
              </div>

              <div className="stat-card">
                <h3>Lowest</h3>
                <p>
                  {dailyReport.statistics.lowest ?? "--"}
                  <span> mg/dL</span>
                </p>
              </div>

              <div className="stat-card">
                <h3>Average</h3>
                <p>
                  {dailyReport.statistics.average ?? "--"}
                  <span> mg/dL</span>
                </p>
              </div>

              <div className="stat-card">
                <h3>Total Readings</h3>
                <p>{dailyReport.statistics.count}</p>
              </div>
            </div>
          )}
        </section>

        <section className="monthly-reports">
          <h2>Monthly Reports</h2>

          {monthlyReportLoading && <p>Loading monthly reports...</p>}

          {monthlyReportError && (
            <p className="error-message">{monthlyReportError}</p>
          )}

          {!monthlyReportLoading && !monthlyReportError && (
            <div className="monthly-reports-grid">
              {/* Month-to-date report */}
              <div className="monthly-report-card">
                <h3>Month to Date</h3>

                <p>
                  {monthToDateReport?.start_date} to{" "}
                  {monthToDateReport?.end_date}
                </p>

                <div className="monthly-stat">
                  <span>Highest</span>
                  <strong>
                    {monthToDateReport?.statistics.highest ?? "--"} mg/dL
                  </strong>
                </div>

                <div className="monthly-stat">
                  <span>Lowest</span>
                  <strong>
                    {monthToDateReport?.statistics.lowest ?? "--"} mg/dL
                  </strong>
                </div>

                <div className="monthly-stat">
                  <span>Average</span>
                  <strong>
                    {monthToDateReport?.statistics.average ?? "--"} mg/dL
                  </strong>
                </div>

                <div className="monthly-stat">
                  <span>Total Readings</span>
                  <strong>
                    {monthToDateReport?.statistics.count ?? 0}
                  </strong>
                </div>
              </div>

              {/* Previous month report */}
              <div className="monthly-report-card">
                <h3>Previous Month</h3>

                <p>
                  {previousMonthReport?.start_date} to{" "}
                  {previousMonthReport?.end_date}
                </p>

                <div className="monthly-stat">
                  <span>Highest</span>
                  <strong>
                    {previousMonthReport?.statistics.highest ?? "--"} mg/dL
                  </strong>
                </div>

                <div className="monthly-stat">
                  <span>Lowest</span>
                  <strong>
                    {previousMonthReport?.statistics.lowest ?? "--"} mg/dL
                  </strong>
                </div>

                <div className="monthly-stat">
                  <span>Average</span>
                  <strong>
                    {previousMonthReport?.statistics.average ?? "--"} mg/dL
                  </strong>
                </div>

                <div className="monthly-stat">
                  <span>Total Readings</span>
                  <strong>
                    {previousMonthReport?.statistics.count ?? 0}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </section>


        <ReadingForm
          onReadingAdded={refreshDashboard}
          editingReading={editingReading}
          onCancelEdit={handleCancelEdit}
        />


        <section className="dashboard-readings">
          <h2>Recent Readings</h2>

          {loading && <p>Loading readings...</p>}

          {error && <p className="error-message">{error}</p>}

          {!loading && !error && readings.length === 0 && (
            <p>
              No glucose readings found. Start by adding your first reading!
            </p>
          )}

          {!loading && !error && readings.length > 0 && (
            <div className="readings-list">
              {readings.map((reading) => (
                <div className="reading-item" key={reading.id}>
                  <div>
                    <h3>{reading.time_slot}</h3>
                    <p>{String(reading.reading_date).slice(0, 10)}</p>
                  </div>

                  <div className="reading-actions">
                    <strong>{reading.value} mg/dL</strong>

                    <button type="button" onClick={() => handleEdit(reading)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(reading.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
