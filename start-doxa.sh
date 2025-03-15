#!/bin/bash

# Script pentru pornirea serviciilor DOXA

echo "
╔════════════════════════════════════════════════════╗
║                                                    ║
║  Pornire servicii DOXA Platform & DOXA AI         ║
║                                                    ║
╚════════════════════════════════════════════════════╝
"

echo "🚀 Pornire servicii DOXA..."
echo "📝 Acest script va porni toate serviciile în background"

# Verificăm dacă serviciile sunt deja active
AI_RUNNING=0
PLATFORM_RUNNING=0
PILGRIMAGE_RUNNING=0

if curl -s http://localhost:3333/status >/dev/null 2>&1; then
  echo "ℹ️ DOXA AI rulează deja pe portul 3333"
  AI_RUNNING=1
fi

if curl -s http://localhost:5001/status >/dev/null 2>&1; then
  echo "ℹ️ DOXA Platform rulează deja pe portul 5001"
  PLATFORM_RUNNING=1
fi

# Verificăm serviciul Pilgrimage (pe portul 3000 - port standard pentru dev)
if curl -s http://localhost:3000 >/dev/null 2>&1; then
  echo "ℹ️ DOXA Pilgrimage rulează deja pe portul 3000"
  PILGRIMAGE_RUNNING=1
fi

# Pornim serviciul AI dacă nu rulează deja
if [ $AI_RUNNING -eq 0 ]; then
  echo "🤖 Pornire DOXA AI..."
  node doxa-ai-run.js > doxa_ai.log 2>&1 &
  echo "✅ DOXA AI pornit cu PID: $!"
  echo "   Logs salvate în doxa_ai.log"
fi

# Pornim serviciul de platformă dacă nu rulează deja
if [ $PLATFORM_RUNNING -eq 0 ]; then
  echo "🌐 Pornire DOXA Platform..."
  node doxa-platform-run.js > doxa_platform.log 2>&1 &
  echo "✅ DOXA Platform pornit cu PID: $!"
  echo "   Logs salvate în doxa_platform.log"
fi

# Pornim serviciul Pilgrimage dacă nu rulează deja
if [ $PILGRIMAGE_RUNNING -eq 0 ]; then
  echo "🌐 Pornire DOXA Pilgrimage..."
  node start-doxa-pilgrimage.js > doxa_pilgrimage.log 2>&1 &
  echo "✅ DOXA Pilgrimage pornit cu PID: $!"
  echo "   Logs salvate în doxa_pilgrimage.log"
fi

echo "
📊 Servicii active:
- DOXA AI: http://localhost:3333
- DOXA Platform: http://localhost:5001
- DOXA Pilgrimage: http://localhost:3000

📌 Pentru a verifica starea serviciilor, rulați: bash run_doxa_info.sh
"

exit 0