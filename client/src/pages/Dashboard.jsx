import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ReadingForm from "../components/ReadingForm";
import { getReadings } from "../services/reading.service";

const Dashboard = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchReadings();
  }, []);

  return (
    <div className="dashboard">
      <Navbar />

      <main className="dashboard-content">
        <section className="dashboard-header">
          <h1>Dashboard</h1>
          <p>
            Track your blood glucose readings and monitor your progress.
          </p>
        </section>

        <ReadingForm onReadingAdded={fetchReadings} />

        <section className="dashboard-overview">
          <h2>Overview</h2>
          <p>Your glucose statistics will appear here.</p>
        </section>

        <section className="dashboard-readings">
          <h2>Recent Readings</h2>

          {loading && <p>Loading readings...</p>}

          {error && <p className="error-message">{error}</p>}

          {!loading && !error && readings.length === 0 && (
            <p>No glucose readings found. Start by adding your first reading!</p>
          )}

          {!loading && !error && readings.length > 0 && (
            <div className="readings-list">
              {readings.map((reading) => (
                <div className="reading-item" key={reading.id}>
                  <div>
                    <h3>{reading.time_slot}</h3>
                    <p>{String(reading.reading_date).slice(0, 10)}</p>
                  </div>

                  <strong>{reading.value} mg/dL</strong>
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
