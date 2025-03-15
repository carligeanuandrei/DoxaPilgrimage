#!/bin/bash

# Script pentru configurarea și pregătirea proiectului DOXA
# Rulați acest script o singură dată atunci când clonați proiectul

echo "======================================================"
echo "     Pregătirea mediului pentru platforma DOXA        "
echo "======================================================"
echo ""

# Setează permisiunile de execuție pentru scripturile shell
echo "🔧 Setare permisiuni de execuție..."
chmod +x start-doxa.sh
chmod +x run_doxa_info.sh
chmod +x setup-doxa.sh

# Verificăm dacă directoarele necesare există
echo "🔧 Verificare structură directoare..."
if [ ! -d "./doxa-ai" ]; then
  echo "📁 Creare director doxa-ai..."
  mkdir -p ./doxa-ai
fi

# Informații finale
echo ""
echo "✅ Configurare finalizată cu succes!"
echo ""
echo "Pentru a rula platforma DOXA, folosiți una din comenzile:"
echo "- node start-doxa.js       (Pornește toate serviciile)"
echo "- bash start-doxa.sh       (Pornește toate serviciile folosind bash)"
echo "- node doxa-platform-run.js (Pornește doar platforma principală)"
echo "- node doxa-ai-run.js      (Pornește doar asistentul AI)"
echo ""
echo "În mediul Replit, serviciile vor fi disponibile la:"
echo "- Platforma DOXA: http://localhost:5001"
echo "- Asistentul DOXA AI: http://localhost:3333"
echo "======================================================"