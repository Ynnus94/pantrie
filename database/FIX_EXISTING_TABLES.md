# Fix: Tables Already Exist Error

If you're getting the error "relation already exists", you have two options:

## Option 1: Use Safe Schema (Recommended)

Use the safe version that won't error if tables exist:

1. **Run `database/schema-safe.sql`** instead of `schema.sql`
   - This uses `CREATE TABLE IF NOT EXISTS`
   - Won't error if tables already exist
   - Safe to run multiple times

2. **Run `database/seed-prices-safe.sql`** instead of `seed-prices.sql`
   - This only inserts prices that don't already exist
   - Won't create duplicates

## Option 2: Reset Everything (Fresh Start)

If you want to start completely fresh:

1. **Run `database/reset-database.sql`** first
   - This drops all existing tables
   - ⚠️ **WARNING**: This deletes all your data!

2. **Then run `database/schema.sql`** to recreate tables

3. **Then run `database/seed-prices.sql`** to add prices

## Quick Fix for Right Now

Since your tables already exist, just run:

```sql
-- In Supabase SQL Editor, run this:
INSERT INTO price_data (item_name, price, unit, store, source) 
SELECT * FROM (VALUES
('chicken breast', 12.99, 'per lb', 'Metro', 'metro_baseline'),
('chicken breast prime', 11.99, 'per lb', 'Metro', 'metro_baseline'),
-- ... (rest of your seed data)
) AS v(item_name, price, unit, store, source)
WHERE NOT EXISTS (
  SELECT 1 FROM price_data 
  WHERE price_data.item_name = v.item_name 
    AND price_data.source = v.source
);
```

Or simply use the `seed-prices-safe.sql` file I created!

## Verify Your Setup

After running the safe scripts, check your tables:

```sql
-- Check if family exists
SELECT * FROM families;

-- Check if prices were inserted
SELECT COUNT(*) FROM price_data WHERE source = 'metro_baseline';
-- Should show 25 if all prices were inserted
```

