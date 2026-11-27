# Sweety – Blood Glucose Tracker

Sweety is a full-stack blood glucose tracking application that allows users to record, manage, and monitor their glucose readings. It provides daily and monthly reports to help users understand their glucose trends.

## Features

- **User Authentication:** Secure registration and login using bcrypt password hashing and JWT-based authentication with HTTP-only cookies.
- **Glucose Readings Management:** Create, view, update, and delete glucose readings.
- **Reading Validation:** Supports four daily time slots, glucose values between 40 and 600 mg/dL, and prevents duplicate readings for the same time slot and date.
- **Daily Reports:** View the highest, lowest, and average glucose readings along with the total reading count and individual readings for a selected date.
- **Month-to-Date Reports:** View glucose statistics from the beginning of the selected month through the selected date.
- **Previous Month Reports:** View statistics for the entire previous calendar month.
- **User Data Isolation:** Users can access only their own glucose readings and reports.

## Tech Stack

**Frontend**
- React
- Vite
- React Router
- CSS

**Backend**
- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt

## Project Structure

```text
sweety/
├── client/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── App.jsx
│
├── server/
│   ├── scripts/
│   │   └── seed.js
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── server.js
│
├── .gitignore
└── README.md
```

## Prerequisites

Make sure you have the following installed:

- Node.js and npm
- PostgreSQL
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Aditya-Kandari-01/sweety-blood-glucose-tracker
cd sweety-blood-glucose-tracker
```

### 2. Database Setup

Create a PostgreSQL database named `sweety`.

Execute the database schema SQL to create the required `users` and `glucose_readings` tables and indexes.

### 3. Backend Setup

Navigate to the server directory:

```bash
cd server
npm install
```

Create a `.env` file using `.env.example` as a reference and configure your PostgreSQL credentials and JWT secret.

Start the backend development server:

```bash
npm run dev
```

The backend runs at `http://localhost:5000`.

### 4. Frontend Setup

Open another terminal and navigate to the client directory:

```bash
cd client
npm install
```

Create a `.env` file using `.env.example` and configure:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Demo Account

A demo account and sample glucose readings can be generated using the database seed script.

From the `server` directory, run:

```bash
npm run seed
```

**Demo Credentials**

| Field | Value |
|---|---|
| Email | demo@sweety.com |
| Password | SweetyDemo@123 |

## API Endpoints

All reading and report endpoints require authentication.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get the authenticated user |

### Glucose Readings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/readings` | Create a reading |
| GET | `/api/readings` | Get all readings |
| GET | `/api/readings?date=YYYY-MM-DD` | Get readings for a selected date |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Daily report |
| GET | `/api/reports/month-to-date?date=YYYY-MM-DD` | Month-to-date report |
| GET | `/api/reports/monthly?date=YYYY-MM-DD` | Previous calendar month report |

## Validation Rules

- All reading fields are required.
- Glucose values must be integers between 40 and 600 mg/dL.
- Only the following time slots are supported:
  - Morning (Fasting)
  - After breakfast
  - After lunch
  - After dinner
- Only one reading is allowed per time slot per day for each user.
- Future-dated readings are not allowed.
- Users cannot access or modify another user's readings.

## Assumptions and Future Improvements

- Each user can record a maximum of four readings per day, one for each supported time slot.
- Monthly reports use the entire previous calendar month and the current month through the selected date.
- Future improvements could include glucose trend charts, pagination, Docker-based setup, and automated reminders.

## Author

**Aditya Kandari**

GitHub: [Aditya-Kandari-01](https://github.com/Aditya-Kandari-01)
