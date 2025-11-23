-- GrocerAI Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- families table (simplified - no auth needed for MVP)
CREATE TABLE families (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL DEFAULT 'The Sunny Family',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert your family by default
INSERT INTO families (name, preferences) VALUES (
  'The Sunny Family', 
  '{
    "adults": ["Sunny", "Audrey"],
    "children": [{"name": "daughter", "age": 2, "favorites": ["salmon", "chicken", "pasta"]}],
    "office_days": ["Monday", "Wednesday", "Friday"],
    "budget": {"min": 150, "max": 200},
    "location": "Montreal, QC"
  }'::JSONB
);

-- meal_plans table
CREATE TABLE meal_plans (
  id SERIAL PRIMARY KEY,
  family_id INTEGER REFERENCES families(id) DEFAULT 1,
  week_starting DATE NOT NULL,
  meals JSONB NOT NULL,
  grocery_list JSONB NOT NULL,
  week_summary JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'approved', -- approved, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- food_tries table (toddler tracking)
CREATE TABLE food_tries (
  id SERIAL PRIMARY KEY,
  family_id INTEGER REFERENCES families(id) DEFAULT 1,
  child_name VARCHAR(50) NOT NULL DEFAULT 'daughter',
  food_item VARCHAR(100) NOT NULL,
  reaction VARCHAR(20) NOT NULL, -- loved, tried, refused
  meal_context VARCHAR(200),
  notes TEXT,
  tried_at TIMESTAMP DEFAULT NOW()
);

-- price_data table (Quebec pricing intelligence)
CREATE TABLE price_data (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50), -- per lb, per package, etc.
  store VARCHAR(50), -- Metro, Maxi, IGA, user_entry
  source VARCHAR(50) DEFAULT 'metro_baseline', -- metro_baseline, receipt_scan, manual_entry
  family_id INTEGER REFERENCES families(id), -- null for baseline prices
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- pantry_inventory table
CREATE TABLE pantry_inventory (
  id SERIAL PRIMARY KEY,
  family_id INTEGER REFERENCES families(id) DEFAULT 1,
  item_name VARCHAR(100) NOT NULL,
  quantity VARCHAR(50),
  category VARCHAR(50),
  expiration_date DATE,
  location VARCHAR(50) DEFAULT 'pantry', -- pantry, fridge, freezer
  last_updated TIMESTAMP DEFAULT NOW()
);

-- calendar_exports table (track what was exported)
CREATE TABLE calendar_exports (
  id SERIAL PRIMARY KEY,
  family_id INTEGER REFERENCES families(id) DEFAULT 1,
  meal_plan_id INTEGER REFERENCES meal_plans(id),
  export_format VARCHAR(20) DEFAULT 'ics', -- ics, csv
  exported_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_meal_plans_week ON meal_plans(week_starting);
CREATE INDEX idx_food_tries_child ON food_tries(child_name, tried_at);
CREATE INDEX idx_price_data_item ON price_data(item_name, recorded_at DESC);

