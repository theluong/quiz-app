-- Table: categories
CREATE TABLE categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: questions
CREATE TABLE questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  hint text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow public read-only access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to questions" ON questions FOR SELECT USING (true);

-- Insert dummy categories
INSERT INTO categories (name, slug, description) VALUES
('Toán Tiểu Học', 'toan-tieu-hoc', 'Phép tính cộng trừ nhân chia cơ bản'),
('Toán THCS', 'toan-thcs', 'Đại số và phương trình'),
('Lịch sử - Địa lý', 'lich-su-dia-ly', 'Hỏi đáp chung về lịch sử địa lý'),
('Tiếng Anh Cơ Bản', 'tieng-anh-co-ban', 'Từ vựng và ngữ pháp'),
('Du lịch & Công tác', 'du-lich-cong-tac', 'Tiếng anh cho người đi làm');
