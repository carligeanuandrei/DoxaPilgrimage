#!/bin/bash

# Script pentru afișarea informațiilor despre serviciile DOXA

cat << "EOF"
╔════════════════════════════════════════════════════╗
║                                                    ║
║  DOXA Platform & DOXA AI - Informații Servicii    ║
║                                                    ║
╚════════════════════════════════════════════════════╝

Informații despre serviciile DOXA și cum să le porniți:

1. Pentru a porni asistentul DOXA AI:
   - În panoul de workflow-uri din Replit, apăsați butonul "Run" 
     pentru workflow-ul "Run DOXA"
   - Sau executați manual comanda: node doxa-ai-run.js

2. Pentru a porni platforma principală DOXA:
   - Executați manual comanda: node doxa-platform-run.js
   - Aceasta va porni serverul pe portul 5001

3. Pentru a porni aplicația DOXA Pilgrimage:
   - Executați manual comanda: node start-doxa-pilgrimage.js
   - Aceasta va porni aplicația pe portul 3000

4. Pentru a porni toate serviciile simultan:
   - Executați comanda: bash start-doxa.sh
   - Sau executați: node start-doxa-services.js

URL-uri importante:
- DOXA AI: http://localhost:3333 sau https://[replit-id].replit.dev/doxaai
- DOXA Platform: http://localhost:5001 sau https://[replit-id].replit.dev
- DOXA Pilgrimage: http://localhost:3000 sau https://[replit-id].replit.dev

EOF

echo -e "\n📊 Verificare servicii active...\n"

# Verifică dacă serviciul DOXA AI rulează
if curl -s http://localhost:3333/status >/dev/null 2>&1; then
  echo "✅ DOXA AI: Rulează (port 3333)"
else
  echo "❌ DOXA AI: Oprit (port 3333)"
fi

# Verifică dacă serviciul DOXA Platform rulează
if curl -s http://localhost:5001/status >/dev/null 2>&1; then
  echo "✅ DOXA Platform: Rulează (port 5001)"
else
  echo "❌ DOXA Platform: Oprit (port 5001)"
fi

# Verifică dacă serviciul DOXA Pilgrimage rulează
if curl -s http://localhost:3000 >/dev/null 2>&1; then
  echo "✅ DOXA Pilgrimage: Rulează (port 3000)"
else
  echo "❌ DOXA Pilgrimage: Oprit (port 3000)"
fi

echo -e "\nPentru a porni toate serviciile, executați: bash start-doxa.sh"