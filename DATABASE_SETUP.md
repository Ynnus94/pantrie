# Database Setup Instructions

Your Supabase credentials are already configured! Now you just need to set up the database schema.

## Quick Setup Steps

### 1. Open Supabase SQL Editor

1. Go to your Supabase project: https://zhwmkhjqqpbvmrfgnphy.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### 2. Run the Schema

1. Open `database/schema.sql` in this project
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

### 3. Seed the Price Data

1. Open `database/seed-prices.sql` in this project
2. Copy the entire contents
3. Paste into the Supabase SQL Editor (you can use the same query window)
4. Click "Run"
5. You should see "Success. X rows inserted" (where X is the number of price entries)

### 4. Verify Setup

In Supabase, go to "Table Editor" and verify you see these tables:
- ✅ `families` (should have 1 row - "The Sunny Family")
- ✅ `meal_plans` (empty, ready for meal plans)
- ✅ `food_tries` (empty, ready for toddler tracking)
- ✅ `price_data` (should have ~25 rows with Metro Quebec prices)
- ✅ `pantry_inventory` (empty)
- ✅ `calendar_exports` (empty)

## That's It! 🎉

Your database is now ready. You can start the app and it will connect to Supabase automatically.

## Troubleshooting

**If you see permission errors:**
- Make sure you're using the SQL Editor (not the Table Editor)
- The schema uses default permissions which should work with the anon key

**If tables already exist:**
- You can drop them first: `DROP TABLE IF EXISTS calendar_exports, pantry_inventory, price_data, food_tries, meal_plans, families CASCADE;`
- Then run the schema again

**To verify your connection:**
- The API will log connection errors if there's an issue
- Check the browser console for any frontend connection errors

