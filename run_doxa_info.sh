#!/bin/bash

# Script pentru afișarea informațiilor despre serviciile DOXA

cat << "EOF"
╔════════════════════════════════════════════════════╗
║                                                    ║
║  DOXA Platform - Informații Servicii              ║
║                                                    ║
╚════════════════════════════════════════════════════╝

Informații despre serviciile DOXA și cum să le porniți:

1. Pentru a porni platforma principală DOXA folosind workflows:
   - Utilizați butonul "Run" din meniul Workflows și selectați "DOXA Platform"
   - Aceasta va porni serverul pe portul 5001

2. Pentru a porni aplicația DOXA Pilgrimage folosind workflows:
   - Utilizați butonul "Run" din meniul Workflows și selectați "DOXA Pilgrimage"
   - Aceasta va porni aplicația pe portul 3000

3. Pentru a porni toate serviciile simultan:
   - Utilizați butonul "Run" din meniul Workflows și selectați "DOXA Services"
   - Sau executați comanda: bash start-doxa.sh

URL-uri importante:
- DOXA Platform: https://[replit-id].replit.dev
- DOXA Pilgrimage: https://[replit-id]-3000.replit.dev

Fișiere de log:
- DOXA Platform: doxa_platform.log
- DOXA Pilgrimage: doxa_pilgrimage.log

EOF

echo -e "\n📊 Verificare servicii active...\n"

# Verifică dacă serviciul DOXA Platform rulează
if curl -s http://localhost:5001/status >/dev/null 2>&1; then
  echo "✅ DOXA Platform: Rulează (port 5001)"
  
  # Afișăm ultimele 3 linii din log
  if [ -f doxa_platform.log ]; then
    echo "   📝 Ultimele evenimente log:"
    tail -n 3 doxa_platform.log | sed 's/^/     /'
  fi
else
  echo "❌ DOXA Platform: Oprit (port 5001)"
fi

# Verifică dacă serviciul DOXA Pilgrimage rulează
if curl -s http://localhost:3000 >/dev/null 2>&1; then
  echo "✅ DOXA Pilgrimage: Rulează (port 3000)"
  
  # Afișăm ultimele 3 linii din log
  if [ -f doxa_pilgrimage.log ]; then
    echo "   📝 Ultimele evenimente log:"
    tail -n 3 doxa_pilgrimage.log | sed 's/^/     /'
  fi
else
  echo "❌ DOXA Pilgrimage: Oprit (port 3000)"
fi

echo -e "\n💡 Sfaturi:"
echo "  - Pentru a porni serviciile, folosiți meniul Workflows din Replit"
echo "  - Pentru a vedea log-urile complete: cat doxa_platform.log sau cat doxa_pilgrimage.log"
echo "  - Pentru a reseta serviciile: utilizați butonul Stop din Replit și apoi reporniți"