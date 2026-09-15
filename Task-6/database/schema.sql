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

-- Row Level Security (RLS) example — students only see their own rows.
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_own_borrowings ON borrowings
    FOR SELECT USING (student_id = auth.uid());

ALTER TABLE fines ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_own_fines ON fines
    FOR SELECT USING (
        borrowing_id IN (SELECT id FROM borrowings WHERE student_id = auth.uid())
    );
