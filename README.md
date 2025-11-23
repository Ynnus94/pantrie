# GrocerAI - AI-Powered Family Meal Planning

A comprehensive meal planning application that uses Claude AI to generate weekly meal plans tailored to your family's preferences, budget, and schedule.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for database)
- Anthropic API key (provided in setup)

### Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   cd apps/web && npm install --legacy-peer-deps
   cd ../api && npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL scripts in `database/`:
     - `database/schema.sql` - Creates all tables
     - `database/seed-prices.sql` - Seeds Metro Quebec prices

3. **Configure environment variables:**
   
   Create `apps/api/.env`:
   ```env
   ANTHROPIC_API_KEY=UMBUol0p7JivenzN
   SUPABASE_URL=your-supabase-url-here
   SUPABASE_ANON_KEY=your-supabase-anon-key-here
   NODE_ENV=development
   PORT=3001
   ```
   
   Create `apps/web/.env`:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_APP_NAME=GrocerAI
   VITE_SUPABASE_URL=your-supabase-url-here
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```
   
   This starts both:
   - Web app: http://localhost:5173
   - API server: http://localhost:3001

## 📁 Project Structure

```
grocerai/
├── apps/
│   ├── web/          # React + Vite frontend
│   ├── api/          # Express backend
│   └── mobile/       # React Native (Phase 2)
├── packages/         # Shared packages
├── database/         # SQL schema and seed data
└── README.md
```

## ✨ Features

### Phase 1 (Current)
- ✅ Weekly meal planning with Claude AI
- ✅ Quick Fix meal plan corrections
- ✅ Basic grocery list generation
- ✅ Auto-save approved meal plans
- ✅ Toddler food tracking
- ✅ Calendar export (ICS format)

### Phase 2 (Planned)
- Mobile app (React Native)
- Receipt scanning for price learning
- Enhanced price database

### Phase 3 (Planned)
- Meal history learning
- Advanced meal plan refinements

## 🛠️ Development

### Running Individual Services

```bash
# Web app only
npm run dev:web

# API only
npm run dev:api
```

### Building for Production

```bash
npm run build
```

## 📝 API Endpoints

- `POST /api/meal-plan/generate` - Generate new meal plan
- `POST /api/meal-plan/quick-fix` - Fix existing meal plan
- `POST /api/meal-plan/save` - Save approved meal plan
- `GET /api/meal-plan` - Get all meal plans
- `GET /api/toddler/tries` - Get food tries
- `POST /api/toddler/tries` - Add food try
- `POST /api/grocery/list` - Generate grocery list
- `GET /api/grocery/prices` - Get price data

## 🗄️ Database Schema

See `database/schema.sql` for complete schema. Main tables:
- `families` - Family preferences
- `meal_plans` - Saved meal plans
- `food_tries` - Toddler food tracking
- `price_data` - Quebec grocery prices
- `pantry_inventory` - Pantry tracking
- `calendar_exports` - Export history

## 🎯 Next Steps

1. Set up Supabase and run database migrations
2. Configure environment variables
3. Start development servers
4. Generate your first meal plan!

## 📄 License

Private project for family use.

