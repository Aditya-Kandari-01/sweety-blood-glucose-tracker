import { useEffect, useState } from "react";
import { createReading,updateReading} from "../services/reading.service";

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const ReadingForm = ({ onReadingAdded, editingReading, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    reading_date: editingReading?.reading_date
      ? String(editingReading.reading_date).slice(0, 10)
      : getToday(),
    time_slot: editingReading?.time_slot || "Morning",
    value: editingReading?.value?.toString() || "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setFormData({
      reading_date: editingReading?.reading_date
        ? String(editingReading.reading_date).slice(0, 10)
        : getToday(),
      time_slot: editingReading?.time_slot || "Morning",
      value: editingReading?.value?.toString() || "",
    });

    setError("");
    setSuccess("");
  }, [editingReading]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const glucoseValue = Number(formData.value);

    if (!formData.reading_date || !formData.time_slot || formData.value === "") {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.reading_date > getToday()) {
      setError("Reading date cannot be in the future.");
      return;
    }

    if (
      !Number.isInteger(glucoseValue) ||
      glucoseValue < 40 ||
      glucoseValue > 600
    ) {
      setError("Glucose value must be an integer between 40 and 600.");
      return;
    }

    try {
      setLoading(true);

      if (editingReading) {
        await updateReading(editingReading.id, {
          ...formData,
          value: glucoseValue,
        });
      } else {
        await createReading({
          ...formData,
          value: glucoseValue,
        });
      }

      setSuccess(
        editingReading
          ? "Glucose reading updated successfully!"
          : "Glucose reading added successfully!"
      );

      setFormData({
        reading_date: getToday(),
        time_slot: "Morning",
        value: "",
      });

      await onReadingAdded();
      if (editingReading) {
        onCancelEdit();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="reading-form-section">
      <h2>{editingReading ? "Edit Glucose Reading" : "Add Glucose Reading"}</h2>

      <form onSubmit={handleSubmit} className="reading-form">
        <div className="form-group">
          <label htmlFor="reading_date">Date</label>
          <input
            type="date"
            id="reading_date"
            name="reading_date"
            value={formData.reading_date}
            max={getToday()}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="time_slot">Time Slot</label>
          <select
            id="time_slot"
            name="time_slot"
            value={formData.time_slot}
            onChange={handleChange}
            required
          >
            <option value="Morning">Morning (Fasting)</option>
            <option value="After breakfast">After breakfast</option>
            <option value="After lunch">After lunch</option>
            <option value="After dinner">After dinner</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="value">Glucose Value (mg/dL)</label>
          <input
            type="number"
            id="value"
            name="value"
            placeholder="Enter value (40–600)"
            min="40"
            max="600"
            step="1"
            value={formData.value}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : editingReading
              ? "Update Reading"
              : "Add Reading"}
        </button>
        {editingReading && (
          <button type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}

      </form>
    </section>
  );
};

export default ReadingForm;
