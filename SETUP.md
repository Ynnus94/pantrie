# GrocerAI Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Dependencies

From the project root:
```bash
npm install
cd apps/web && npm install --legacy-peer-deps
cd ../api && npm install
cd ../..
```

### 2. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to the SQL Editor
3. Run the schema file:
   - Copy and paste the contents of `database/schema.sql`
   - Click "Run" to execute
4. Seed the price data:
   - Copy and paste the contents of `database/seed-prices.sql`
   - Click "Run" to execute

### 3. Get Your Supabase Credentials

1. In your Supabase project, go to Settings → API
2. Copy the following:
   - **Project URL** (this is your `SUPABASE_URL`)
   - **anon public** key (this is your `SUPABASE_ANON_KEY`)

### 4. Configure Environment Variables

#### API Environment (`apps/api/.env`)

Create `apps/api/.env` with:
```env
ANTHROPIC_API_KEY=UMBUol0p7JivenzN
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=development
PORT=3001
```

#### Web Environment (`apps/web/.env`)

Create `apps/web/.env` with:
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=GrocerAI
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Start the Development Servers

From the project root:
```bash
npm run dev
```

This will start:
- **Web app**: http://localhost:5173
- **API server**: http://localhost:3001

### 6. Verify Everything Works

1. Open http://localhost:5173 in your browser
2. Click "Generate Meal Plan"
3. Wait for Claude to generate your weekly meal plan
4. Try the "Quick Fix" feature
5. Save the meal plan
6. Switch to the "Toddler Tracker" tab and add a food try

## Troubleshooting

### API Connection Issues

If the web app can't connect to the API:
- Make sure the API server is running on port 3001
- Check that `VITE_API_URL` in `apps/web/.env` matches
- Check browser console for CORS errors

### Database Connection Issues

If you see database errors:
- Verify your Supabase credentials are correct
- Make sure you ran both SQL scripts (schema.sql and seed-prices.sql)
- Check that your Supabase project is active

### Claude API Issues

If meal plan generation fails:
- Verify the `ANTHROPIC_API_KEY` is correct
- Check the API server logs for detailed error messages
- Make sure you have API credits available

## Next Steps

Once everything is working:
1. Generate your first meal plan
2. Try the Quick Fix feature
3. Track some toddler food tries
4. Export a meal plan to your calendar
5. Start customizing the family preferences in the database

## Development Tips

- The API server logs all requests and errors
- Check the browser console for frontend errors
- Meal plans are saved to the `meal_plans` table in Supabase
- Food tries are saved to the `food_tries` table

Happy meal planning! 🍽️

