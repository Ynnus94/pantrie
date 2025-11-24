-- Meal History table (automatic log)
CREATE TABLE IF NOT EXISTS meal_history (
  id SERIAL PRIMARY KEY,
  family_id INTEGER REFERENCES families(id) DEFAULT 1,
  meal_plan_id INTEGER REFERENCES meal_plans(id),
  
  -- When & What
  cooked_date DATE NOT NULL,
  day_of_week VARCHAR(20),
  meal_name VARCHAR(200) NOT NULL,
  
  -- Source tracking
  was_from_meal_plan BOOLEAN DEFAULT false,
  was_improvised BOOLEAN DEFAULT false,
  
  -- Recipe data (snapshot at time of cooking)
  recipe_snapshot JSONB NOT NULL,
  
  -- Family feedback
  actually_cooked BOOLEAN DEFAULT true,
  average_rating DECIMAL(2,1),
  would_make_again BOOLEAN,
  notes TEXT,
  
  -- Library connection
  saved_to_library BOOLEAN DEFAULT false,
  library_recipe_id INTEGER REFERENCES recipes(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual ratings per family member for each meal instance
CREATE TABLE IF NOT EXISTS meal_history_ratings (
  id SERIAL PRIMARY KEY,
  meal_history_id INTEGER REFERENCES meal_history(id) ON DELETE CASCADE,
  family_member_id INTEGER REFERENCES family_members(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  notes TEXT,
  rated_at TIMESTAMP DEFAULT NOW()
);

-- Update recipes table to track source
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'url-import';
-- Possible values: 'url-import', 'meal-history', 'manual'

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source_meal_history_id INTEGER REFERENCES meal_history(id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_meal_history_date ON meal_history(cooked_date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_history_family ON meal_history(family_id);
CREATE INDEX IF NOT EXISTS idx_meal_history_library ON meal_history(saved_to_library);
CREATE INDEX IF NOT EXISTS idx_meal_history_ratings_meal ON meal_history_ratings(meal_history_id);

