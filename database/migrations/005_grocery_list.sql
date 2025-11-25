-- ============================================
-- GROCERY LIST ITEMS TABLE
-- Full CRUD support for grocery lists
-- ============================================

-- Drop if exists for clean migration
DROP TABLE IF EXISTS grocery_list_items CASCADE;

-- Grocery List Items
CREATE TABLE grocery_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id INTEGER REFERENCES families(id) ON DELETE CASCADE DEFAULT 1,
  meal_plan_id INTEGER REFERENCES meal_plans(id) ON DELETE CASCADE,
  
  -- Item details
  item_name TEXT NOT NULL,
  quantity DECIMAL(10, 2),
  unit TEXT, -- oz, lbs, cups, etc.
  category TEXT DEFAULT 'Other', -- Produce, Dairy, Meat, etc.
  aisle TEXT, -- Optional aisle number/name
  
  -- Status
  is_checked BOOLEAN DEFAULT false,
  
  -- Source tracking
  source_type TEXT DEFAULT 'manual', -- 'meal-plan', 'manual', 'recipe'
  source_id TEXT, -- ID of meal or recipe if from meal plan
  
  -- Optional
  estimated_price DECIMAL(10, 2),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_grocery_list_family ON grocery_list_items(family_id);
CREATE INDEX idx_grocery_list_meal_plan ON grocery_list_items(meal_plan_id);
CREATE INDEX idx_grocery_list_checked ON grocery_list_items(is_checked);
CREATE INDEX idx_grocery_list_category ON grocery_list_items(category);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_grocery_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS grocery_list_updated_at ON grocery_list_items;
CREATE TRIGGER grocery_list_updated_at
  BEFORE UPDATE ON grocery_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_grocery_list_updated_at();

