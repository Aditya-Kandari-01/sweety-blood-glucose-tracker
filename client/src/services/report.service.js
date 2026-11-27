import { apiRequest } from "./api";

export const getDailyReport = async (date) =>
  apiRequest(`/reports/daily?date=${date}`);

export const getMonthToDateReport = async (date) =>
  apiRequest(`/reports/month-to-date?date=${date}`);

export const getPreviousMonthReport = async (date) =>
  apiRequest(`/reports/monthly?date=${date}`);
