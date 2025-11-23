-- GrocerAI Database Schema for Supabase (Safe Version - Won't Error if Tables Exist)
-- Run this in your Supabase SQL editor

-- Drop existing tables if they exist (use this if you want a fresh start)
-- Uncomment the lines below if you want to reset everything:
/*
DROP TABLE IF EXISTS calendar_exports CASCADE;
DROP TABLE IF EXISTS pantry_inventory CASCADE;
DROP TABLE IF EXISTS price_data CASCADE;
DROP TABLE IF EXISTS food_tries CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS families CASCADE;
*/

-- families table (simplified - no auth needed for MVP)
CREATE TABLE IF NOT EXISTS families (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL DEFAULT 'The Sunny Family',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert your family by default (only if it doesn't exist)
INSERT INTO families (name, preferences) 
SELECT 'The Sunny Family', 
  '{
    "adults": ["Sunny", "Audrey"],
    "children": [{"name": "daughter", "age": 2, "favorites": ["salmon", "chicken", "pasta"]}],
    "office_days": ["Monday", "Wednesday", "Friday"],
    "budget": {"min": 150, "max": 200},
    "location": "Montreal, QC"
  }'::JSONB
WHERE NOT EXISTS (SELECT 1 FROM families WHERE name = 'The Sunny Family');

-- meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
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
CREATE TABLE IF NOT EXISTS food_tries (
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
CREATE TABLE IF NOT EXISTS price_data (
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
CREATE TABLE IF NOT EXISTS pantry_inventory (
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
CREATE TABLE IF NOT EXISTS calendar_exports (
  id SERIAL PRIMARY KEY,
  family_id INTEGER REFERENCES families(id) DEFAULT 1,
  meal_plan_id INTEGER REFERENCES meal_plans(id),
  export_format VARCHAR(20) DEFAULT 'ics', -- ics, csv
  exported_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance (IF NOT EXISTS for indexes)
CREATE INDEX IF NOT EXISTS idx_meal_plans_week ON meal_plans(week_starting);
CREATE INDEX IF NOT EXISTS idx_food_tries_child ON food_tries(child_name, tried_at);
CREATE INDEX IF NOT EXISTS idx_price_data_item ON price_data(item_name, recorded_at DESC);

