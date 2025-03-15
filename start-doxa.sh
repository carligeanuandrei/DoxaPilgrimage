#!/bin/bash

# Script pentru pornirea serviciilor DOXA
# Versiune actualizată pentru mediul Replit

# Definim fișierele de log
PLATFORM_LOG="doxa_platform.log"
PILGRIMAGE_LOG="doxa_pilgrimage.log"

# Reset fișiere log
echo "--- DOXA Platform Log ($(date)) ---" > $PLATFORM_LOG
echo "--- DOXA Pilgrimage Log ($(date)) ---" > $PILGRIMAGE_LOG

echo "
╔════════════════════════════════════════════════════╗
║                                                    ║
║  Pornire servicii DOXA Platform                   ║
║                                                    ║
╚════════════════════════════════════════════════════╝
"

echo "🚀 Pornire servicii DOXA..."
echo "📝 Acest script va porni serviciile în background și va monitoriza starea lor"

# Verificăm dacă serviciile sunt deja active
PLATFORM_RUNNING=0
PILGRIMAGE_RUNNING=0

if curl -s http://localhost:5001/status >/dev/null 2>&1; then
  echo "ℹ️ DOXA Platform rulează deja pe portul 5001"
  PLATFORM_RUNNING=1
fi

# Verificăm serviciul Pilgrimage (pe portul 3000 - port standard pentru dev)
if curl -s http://localhost:3000 >/dev/null 2>&1; then
  echo "ℹ️ DOXA Pilgrimage rulează deja pe portul 3000"
  PILGRIMAGE_RUNNING=1
fi

# Funcție pentru a afișa un spinner în timp ce așteptăm
show_spinner() {
  local pid=$1
  local message=$2
  local delay=0.1
  local spinstr='|/-\'
  local temp
  
  printf "%s " "$message"
  
  while [ "$(ps a | awk '{print $1}' | grep -w $pid)" ]; do
    temp=${spinstr#?}
    printf "[%c]  " "$spinstr"
    spinstr=$temp${spinstr%"$temp"}
    sleep $delay
    printf "\b\b\b\b\b"
  done
  
  printf "    \b\b\b\b"
}

# Pornim serviciul de platformă dacă nu rulează deja
if [ $PLATFORM_RUNNING -eq 0 ]; then
  echo "🌐 Pornire DOXA Platform..."
  node doxa-platform-run.js >> $PLATFORM_LOG 2>&1 &
  PLATFORM_PID=$!
  echo "✅ DOXA Platform pornit cu PID: $PLATFORM_PID"
  echo "   Logs salvate în $PLATFORM_LOG"
fi

# Pornim serviciul Pilgrimage dacă nu rulează deja
if [ $PILGRIMAGE_RUNNING -eq 0 ]; then
  echo "🌐 Pornire DOXA Pilgrimage..."
  node start-doxa-pilgrimage.js >> $PILGRIMAGE_LOG 2>&1 &
  PILGRIMAGE_PID=$!
  echo "✅ DOXA Pilgrimage pornit cu PID: $PILGRIMAGE_PID"
  echo "   Logs salvate în $PILGRIMAGE_LOG"
fi

# Așteptăm câteva secunde să se inițializeze serviciile
echo -n "⏳ Se așteaptă inițializarea serviciilor... "
sleep 5
echo "gata!"

# Verificăm din nou starea serviciilor pentru a confirma că rulează
echo -e "\n📊 Verificarea stării serviciilor...\n"

if curl -s http://localhost:5001/status >/dev/null 2>&1; then
  echo "✅ DOXA Platform: Rulează (port 5001)"
  # Afișăm ultimele câteva linii din log
  echo "   📝 Ultimele evenimente log:"
  tail -n 3 $PLATFORM_LOG | sed 's/^/     /'
else
  echo "❌ DOXA Platform: Nu s-a putut porni pe portul 5001"
  # Afișăm orice erori din log
  echo "   ⚠️ Verificați $PLATFORM_LOG pentru detalii"
  grep -i "error\|exception\|fatal" $PLATFORM_LOG | tail -n 3 | sed 's/^/     /'
fi

if curl -s http://localhost:3000 >/dev/null 2>&1; then
  echo "✅ DOXA Pilgrimage: Rulează (port 3000)"
  # Afișăm ultimele câteva linii din log
  echo "   📝 Ultimele evenimente log:"
  tail -n 3 $PILGRIMAGE_LOG | sed 's/^/     /'
else
  echo "❌ DOXA Pilgrimage: Nu s-a putut porni pe portul 3000"
  # Afișăm orice erori din log
  echo "   ⚠️ Verificați $PILGRIMAGE_LOG pentru detalii"
  grep -i "error\|exception\|fatal" $PILGRIMAGE_LOG | tail -n 3 | sed 's/^/     /'
fi

echo "
📊 Informații servicii:
- DOXA Platform: http://localhost:5001
- DOXA Pilgrimage: http://localhost:3000

🌐 URL-uri Replit:
- DOXA Platform: https://[replit-id].replit.dev
- DOXA Pilgrimage: https://[replit-id]-3000.replit.dev

📌 Pentru a verifica starea serviciilor în orice moment, rulați: bash run_doxa_info.sh
📋 Verificați continuu logurile cu: tail -f $PLATFORM_LOG sau tail -f $PILGRIMAGE_LOG
"

exit 0