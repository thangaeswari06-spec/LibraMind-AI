-- LibraMind AI - Task 6
-- PostgreSQL / Supabase schema
-- Run this in the Supabase SQL editor (or any Postgres instance) to provision the database.

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'librarian', 'admin')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(30) UNIQUE,
    department VARCHAR(80),
    year INT,
    semester INT
);

CREATE TABLE IF NOT EXISTS librarians (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    desk_location VARCHAR(80)
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    isbn VARCHAR(20),
    title VARCHAR(200) NOT NULL,
    author_id INT REFERENCES authors(id),
    category_id INT REFERENCES categories(id),
    publisher VARCHAR(120),
    publication_year INT,
    description TEXT,
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_copies (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books(id) ON DELETE CASCADE,
    copy_number INT NOT NULL,
    condition VARCHAR(20) DEFAULT 'good',
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','borrowed','reserved','lost','damaged'))
);

CREATE TABLE IF NOT EXISTS borrowings (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    book_copy_id INT REFERENCES book_copies(id),
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) DEFAULT 'borrowed' CHECK (status IN ('borrowed','returned','overdue','lost','damaged'))
);

CREATE TABLE IF NOT EXISTS returns (
    id SERIAL PRIMARY KEY,
    borrowing_id INT REFERENCES borrowings(id),
    returned_at TIMESTAMP DEFAULT NOW(),
    condition_on_return VARCHAR(20) DEFAULT 'good'
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    book_id INT REFERENCES books(id),
    reserved_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','available','cancelled','expired'))
);

CREATE TABLE IF NOT EXISTS fines (
    id SERIAL PRIMARY KEY,
    borrowing_id INT REFERENCES borrowings(id),
    amount NUMERIC(10,2) NOT NULL,
    reason VARCHAR(100) DEFAULT 'late_return',
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_progress (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    book_id INT REFERENCES books(id),
    pages_read INT DEFAULT 0,
    total_pages INT,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('not_started','in_progress','completed')),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================== Extended schema (full spec, section 26) =====================

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS publishers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS fine_payments (
    id SERIAL PRIMARY KEY,
    fine_id INT REFERENCES fines(id),
    amount_paid NUMERIC(10,2) NOT NULL,
    paid_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_history (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    book_id INT REFERENCES books(id),
    started_at TIMESTAMP DEFAULT NOW(),
    finished_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_roadmaps (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    goal VARCHAR(150),
    steps JSONB NOT NULL,          -- ordered array of {topic, status}
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_progress (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    topic VARCHAR(100),
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books(id),
    topic VARCHAR(100),
    question TEXT NOT NULL,
    options JSONB NOT NULL,        -- array of option strings
    correct_option INT NOT NULL,
    difficulty VARCHAR(10) DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard'))
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    quiz_question_id INT REFERENCES quiz_questions(id),
    selected_option INT,
    is_correct BOOLEAN,
    attempted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    topic VARCHAR(100),
    score NUMERIC(5,2),
    taken_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    book_id INT REFERENCES books(id),
    score NUMERIC(6,3),
    reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_embeddings (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books(id) UNIQUE,
    embedding VECTOR(384)          -- requires the pgvector extension: CREATE EXTENSION IF NOT EXISTS vector;
);

CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    query TEXT NOT NULL,
    searched_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demand_predictions (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books(id),
    current_copies INT,
    predicted_demand INT,
    suggested_additional_copies INT,
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    message TEXT NOT NULL,
    sender VARCHAR(10) CHECK (sender IN ('user','bot')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    type VARCHAR(30) NOT NULL,     -- due_date, overdue, fine, reservation, recommendation, quiz, milestone
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(80) UNIQUE NOT NULL,
    value TEXT NOT NULL
);

-- Row Level Security (RLS) example — students only see their own rows.
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_own_borrowings ON borrowings
    FOR SELECT USING (student_id = auth.uid());

ALTER TABLE fines ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_own_fines ON fines
    FOR SELECT USING (
        borrowing_id IN (SELECT id FROM borrowings WHERE student_id = auth.uid())
    );

ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_own_reading_progress ON reading_progress
    FOR SELECT USING (student_id = auth.uid());

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_own_quiz_results ON quiz_results
    FOR SELECT USING (student_id = auth.uid());

ALTER TABLE learning_roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_own_roadmap ON learning_roadmaps
    FOR SELECT USING (student_id = auth.uid());

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_own_chat_history ON chat_history
    FOR SELECT USING (student_id = auth.uid());

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_own_notifications ON notifications
    FOR SELECT USING (student_id = auth.uid());

-- Admins/librarians bypass RLS via a service-role key on the backend
-- (never expose the service key to the frontend).
