#!/bin/bash

# GrocerAI Environment Setup Script
# This script creates the .env files with your Supabase credentials

echo "🚀 Setting up GrocerAI environment files..."

# API .env file
cat > apps/api/.env << 'EOF'
# Anthropic Claude API
ANTHROPIC_API_KEY=UMBUol0p7JivenzN

# Supabase Configuration
SUPABASE_URL=https://zhwmkhjqqpbvmrfgnphy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpod21raGpxcXBidm1yZmducGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDMyODIsImV4cCI6MjA3OTQxOTI4Mn0.lCHLTYqMnaIJedNWfyABzyNy3j_-p8-au2v89M3sWEM

# Server Configuration
NODE_ENV=development
PORT=3001
EOF

# Web .env file
cat > apps/web/.env << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:3001

# App Configuration
VITE_APP_NAME=GrocerAI

# Supabase Configuration (for direct client access if needed)
VITE_SUPABASE_URL=https://zhwmkhjqqpbvmrfgnphy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpod21raGpxcXBidm1yZmducGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDMyODIsImV4cCI6MjA3OTQxOTI4Mn0.lCHLTYqMnaIJedNWfyABzyNy3j_-p8-au2v89M3sWEM
EOF

echo "✅ Environment files created!"
echo ""
echo "📝 Created:"
echo "   - apps/api/.env"
echo "   - apps/web/.env"
echo ""
echo "⚠️  Next steps:"
echo "   1. Run the database schema in Supabase SQL Editor:"
echo "      - database/schema.sql"
echo "      - database/seed-prices.sql"
echo "   2. Install dependencies: npm install"
echo "   3. Start dev servers: npm run dev"

