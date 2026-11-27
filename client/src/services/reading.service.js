import { apiRequest } from "./api";

export const getReadings = async (date) => {
  const query = date ? `?date=${date}` : "";
  return apiRequest(`/readings${query}`);
};

export const createReading = async (readingData) => {
  return apiRequest("/readings", {
    method: "POST",
    body: JSON.stringify(readingData),
  });
};

export const updateReading = async (id, readingData) => {
  return apiRequest(`/readings/${id}`, {
    method: "PUT",
    body: JSON.stringify(readingData),
  });
};

export const deleteReading = async (id) => {
  return apiRequest(`/readings/${id}`, {
    method: "DELETE",
  });
};
