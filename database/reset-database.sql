-- Reset Database - Drops all tables and recreates them
-- WARNING: This will delete all your data!
-- Use this if you want a completely fresh start

DROP TABLE IF EXISTS calendar_exports CASCADE;
DROP TABLE IF EXISTS pantry_inventory CASCADE;
DROP TABLE IF EXISTS price_data CASCADE;
DROP TABLE IF EXISTS food_tries CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- Now run schema.sql to recreate everything

