-- Check what exists and seed prices safely
-- Run this in Supabase SQL Editor

-- First, let's check what tables exist (this won't error)
DO $$
BEGIN
  -- Check if families table exists and has data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'families') THEN
    RAISE NOTICE '✅ families table exists';
    IF EXISTS (SELECT 1 FROM families LIMIT 1) THEN
      RAISE NOTICE '✅ Family data already exists';
    ELSE
      RAISE NOTICE '⚠️  Family table exists but is empty';
    END IF;
  ELSE
    RAISE NOTICE '❌ families table does not exist';
  END IF;

  -- Check price_data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'price_data') THEN
    RAISE NOTICE '✅ price_data table exists';
    IF EXISTS (SELECT 1 FROM price_data WHERE source = 'metro_baseline' LIMIT 1) THEN
      RAISE NOTICE '⚠️  Price data already exists - will skip duplicates';
    ELSE
      RAISE NOTICE '✅ Price data table is empty - will insert all prices';
    END IF;
  ELSE
    RAISE NOTICE '❌ price_data table does not exist - need to create tables first';
  END IF;
END $$;

-- Insert prices (only if they don't already exist)
INSERT INTO price_data (item_name, price, unit, store, source) 
SELECT * FROM (VALUES
-- Proteins
('chicken breast', 12.99, 'per lb', 'Metro', 'metro_baseline'),
('chicken breast prime', 11.99, 'per lb', 'Metro', 'metro_baseline'),
('chicken breast organic', 16.99, 'per lb', 'Metro', 'metro_baseline'),
('chicken thighs', 5.99, 'per lb', 'Metro', 'metro_baseline'),
('ground beef lean', 9.29, 'per lb', 'Metro', 'metro_baseline'),
('salmon fillets', 18.99, 'per lb', 'Metro', 'metro_baseline'),

-- Pantry Staples  
('pasta penne', 2.49, 'per 454g box', 'Metro', 'metro_baseline'),
('pasta spaghetti', 2.49, 'per 454g box', 'Metro', 'metro_baseline'),
('rice basmati', 4.99, 'per 2kg bag', 'Metro', 'metro_baseline'),
('bread whole grain', 3.49, 'per loaf', 'Metro', 'metro_baseline'),
('milk 2%', 5.79, 'per 4L', 'Metro', 'metro_baseline'),
('eggs large', 4.49, 'per dozen', 'Metro', 'metro_baseline'),
('butter', 6.99, 'per 454g', 'Metro', 'metro_baseline'),
('olive oil', 8.99, 'per 500ml', 'Metro', 'metro_baseline'),

-- Produce (seasonal averages)
('onions yellow', 3.99, 'per 3lb bag', 'Metro', 'metro_baseline'),
('carrots', 2.99, 'per 2lb bag', 'Metro', 'metro_baseline'),
('potatoes russet', 4.99, 'per 5lb bag', 'Metro', 'metro_baseline'),
('sweet potatoes', 2.99, 'per lb', 'Metro', 'metro_baseline'),
('bell peppers', 1.99, 'each', 'Metro', 'metro_baseline'),
('spinach baby', 4.99, 'per 142g bag', 'Metro', 'metro_baseline'),
('tomatoes', 4.99, 'per lb', 'Metro', 'metro_baseline'),

-- Specialty Items (common adventure meal ingredients)
('kimchi', 5.99, 'per 400g jar', 'Asian Market', 'specialty_estimate'),
('golden curry paste', 4.99, 'per jar', 'Asian Market', 'specialty_estimate'),
('miso paste', 6.99, 'per container', 'Asian Market', 'specialty_estimate'),
('tahini', 8.99, 'per jar', 'Health Store', 'specialty_estimate'),
('coconut milk', 3.49, 'per 400ml can', 'Metro', 'metro_baseline')
) AS v(item_name, price, unit, store, source)
WHERE NOT EXISTS (
  SELECT 1 FROM price_data 
  WHERE price_data.item_name = v.item_name 
    AND price_data.source = v.source
);

-- Show results
SELECT 
  'Total prices inserted' as status,
  COUNT(*) as count 
FROM price_data 
WHERE source IN ('metro_baseline', 'specialty_estimate');

