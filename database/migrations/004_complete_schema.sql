-- ============================================
-- PANTRIE COMPLETE DATABASE SCHEMA
-- ============================================

-- Families table
CREATE TABLE IF NOT EXISTS families (
  id SERIAL PRIMARY KEY,
  family_name VARCHAR(100) DEFAULT 'My Family',
  location VARCHAR(100) DEFAULT 'Montreal, QC',
  weekly_budget INTEGER DEFAULT 200,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default family
INSERT INTO families (id, family_name, location) 
VALUES (1, 'My Family', 'Montreal, QC')
ON CONFLICT (id) DO NOTHING;

-- Family members
CREATE TABLE IF NOT EXISTS family_members (
  id SERIAL PRIMARY KEY,
  family_id INTEGER REFERENCES families(id) DEFAULT 1,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50), -- 'adult', 'child'
  age INTEGER,
  adventurousness INTEGER CHECK (adventurousness BETWEEN 1 AND 5),
  spice_tolerance VARCHAR(20), -- 'none', 'mild', 'medium', 'hot'
  cooking_skill INTEGER CHECK (cooking_skill BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default family members
INSERT INTO family_members (family_id, name, role, age, adventurousness, spice_tolerance) VALUES
(1, 'Sunny', 'adult', NULL, 5, 'hot'),
(1, 'Audrey', 'adult', NULL, 2, 'mild'),
(1, 'Daughter', 'child', 2, 1, 'none')
ON CONFLICT DO NOTHING;

-- Food ratings (how each person rates specific foods)
CREATE TABLE IF NOT EXISTS food_ratings (
  id SERIAL PRIMARY KEY,
  family_member_id INTEGER REFERENCES family_members(id),
  food_name VARCHAR(200) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Meal plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id SERIAL PRIMARY KEY,
  family_id INTEGER REFERENCES families(id) DEFAULT 1,
  week_starting DATE NOT NULL,
  meals JSONB,
  grocery_list JSONB,
  week_summary JSONB,
  status VARCHAR(20) DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Meal history (automatic log of everything cooked)
CREATE TABLE IF NOT EXISTS meal_history (
  id SERIAL PRIMARY KEY,
  family_id INTEGER REFERENCES families(id) DEFAULT 1,
  meal_plan_id INTEGER REFERENCES meal_plans(id),
  
  cooked_date DATE NOT NULL,
  day_of_week VARCHAR(20),
  meal_name VARCHAR(200) NOT NULL,
  
  was_from_meal_plan BOOLEAN DEFAULT false,
  was_improvised BOOLEAN DEFAULT false,
  
  recipe_snapshot JSONB NOT NULL,
  
  actually_cooked BOOLEAN DEFAULT true,
  average_rating DECIMAL(2,1),
  would_make_again BOOLEAN,
  notes TEXT,
  
  saved_to_library BOOLEAN DEFAULT false,
  library_recipe_id INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual ratings per family member for meal history
CREATE TABLE IF NOT EXISTS meal_history_ratings (
  id SERIAL PRIMARY KEY,
  meal_history_id INTEGER REFERENCES meal_history(id) ON DELETE CASCADE,
  family_member_id INTEGER REFERENCES family_members(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  notes TEXT,
  rated_at TIMESTAMP DEFAULT NOW()
);

-- Recipe library (curated favorites)
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  family_id INTEGER REFERENCES families(id) DEFAULT 1,
  
  title VARCHAR(200) NOT NULL,
  description TEXT,
  
  source_type VARCHAR(50) DEFAULT 'url-import', -- 'url-import', 'meal-history', 'manual'
  source_url TEXT,
  source_meal_history_id INTEGER REFERENCES meal_history(id),
  
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  prep_time INTEGER,
  cook_time INTEGER,
  total_time INTEGER,
  servings INTEGER,
  difficulty VARCHAR(20),
  image_url TEXT,
  author TEXT,
  source TEXT,
  
  times_made INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1),
  last_made DATE,
  
  tags JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key for library_recipe_id after recipes table exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_library_recipe'
  ) THEN
    ALTER TABLE meal_history 
    ADD CONSTRAINT fk_library_recipe 
    FOREIGN KEY (library_recipe_id) 
    REFERENCES recipes(id);
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meal_history_date ON meal_history(cooked_date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_history_family ON meal_history(family_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_week ON meal_plans(week_starting DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_family ON recipes(family_id);
CREATE INDEX IF NOT EXISTS idx_meal_history_ratings_meal ON meal_history_ratings(meal_history_id);

