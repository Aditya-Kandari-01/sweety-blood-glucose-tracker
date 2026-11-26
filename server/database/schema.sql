-- USER'S TABLE

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- GLUCOSE READINGS TABLE

CREATE TABLE glucose_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    reading_date DATE NOT NULL,

    time_slot VARCHAR(30) NOT NULL
        CHECK (
            time_slot IN (
                'Morning',
                'After breakfast',
                'After lunch',
                'After dinner'
            )
        ),

    value INTEGER NOT NULL
        CHECK (value BETWEEN 40 AND 600),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_user_daily_slot
        UNIQUE (user_id, reading_date, time_slot)
);

-- INDEXES FOR FASTER USER-SPECIFIC QUERIES

CREATE INDEX idx_glucose_readings_user_date
ON glucose_readings(user_id, reading_date);
