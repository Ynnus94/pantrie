# 🚀 GrocerAI Quick Start

## What's Been Set Up

✅ **Complete monorepo structure** with React web app and Express API  
✅ **Database schema** ready for Supabase  
✅ **Claude AI integration** for meal plan generation  
✅ **Toddler tracking** component  
✅ **Calendar export** (ICS format)  
✅ **Quick Fix** functionality  
✅ **Grocery list generation**  
✅ **UI components** (Card, Button, Badge)  
✅ **Tailwind CSS** styling  

## What You Need to Do

### 1. Install Dependencies (5 minutes)
```bash
npm install
cd apps/web && npm install --legacy-peer-deps
cd ../api && npm install
```

### 2. Set Up Supabase (10 minutes)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run `database/schema.sql` in SQL Editor
4. Run `database/seed-prices.sql` in SQL Editor
5. Copy your Project URL and anon key

### 3. Configure Environment (2 minutes)
Create `apps/api/.env`:
```env
ANTHROPIC_API_KEY=UMBUol0p7JivenzN
SUPABASE_URL=your-url-here
SUPABASE_ANON_KEY=your-key-here
PORT=3001
```

Create `apps/web/.env`:
```env
VITE_API_URL=http://localhost:3001
```

### 4. Start Development (1 minute)
```bash
npm run dev
```

Visit http://localhost:5173 and start planning meals! 🍽️

## Project Structure

```
grocerai/
├── apps/
│   ├── web/          ← React frontend (Vite + TypeScript)
│   └── api/          ← Express backend (TypeScript)
├── database/         ← SQL schema & seed data
└── README.md         ← Full documentation
```

## Key Features Ready to Use

- **Meal Plan Generation**: Click "Generate Meal Plan" to create a weekly plan
- **Quick Fix**: Use natural language to modify meals ("Make Tuesday vegetarian")
- **Toddler Tracker**: Track what foods your daughter tries
- **Calendar Export**: Export meal plans to iOS Calendar
- **Auto-save**: Approved meal plans are saved to database

## Need Help?

See `SETUP.md` for detailed instructions or `README.md` for full documentation.

