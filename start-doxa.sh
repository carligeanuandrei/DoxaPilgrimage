#!/bin/bash

echo "==========================================="
echo "      DOXA Romanian Orthodox Platform      "
echo "==========================================="
echo ""
echo "Checking project structure..."
echo ""

# Verificare structura proiectului
cd DoxaPilgrimage
echo "📂 Project Files:"
ls -la | grep -v "node_modules" | head -n 10
echo "... (more files) ..."

echo ""
echo "📋 Scripts available:"
grep -A 10 '"scripts"' package.json

echo ""
echo "🛠️ Checking database connection..."
npx drizzle-kit introspect:pg

echo ""
echo "✅ Project ready to start!"
echo "To start the server, use the command:"
echo "cd DoxaPilgrimage && npm run dev"
echo ""
echo "The server will start on port 5000"
echo "==========================================="