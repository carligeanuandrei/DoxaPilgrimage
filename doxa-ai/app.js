document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    // Date predefinite despre mănăstiri ortodoxe românești
    const monasteryData = {
        "Mănăstirea Putna": {
            region: "Bucovina",
            description: "Ctitorie a lui Ștefan cel Mare, construită între 1466-1469, găzduiește mormântul marelui voievod.",
            patron: "Adormirea Maicii Domnului",
            feastDay: "15 august",
            location: "Putna, Județul Suceava",
            founded: 1466
        },
        "Mănăstirea Voroneț": {
            region: "Bucovina",
            description: "Cunoscută pentru albastrul său unic, a fost construită de Ștefan cel Mare în 1488 în doar 3 luni și 21 de zile.",
            patron: "Sfântul Gheorghe",
            feastDay: "23 aprilie",
            location: "Voroneț, Județul Suceava",
            founded: 1488
        },
        "Mănăstirea Sihăstria": {
            region: "Moldova",
            description: "Centru important de spiritualitate ortodoxă, unde a activat Părintele Cleopa Ilie.",
            patron: "Nașterea Sfântului Ioan Botezătorul",
            feastDay: "24 iunie",
            location: "Comuna Vânători-Neamț, Județul Neamț",
            founded: 1655
        },
        "Mănăstirea Neamț": {
            region: "Moldova",
            description: "Una dintre cele mai vechi și mai importante mănăstiri din România, centru cultural și spiritual.",
            patron: "Înălțarea Domnului",
            feastDay: "40 de zile după Paști",
            location: "Vânători-Neamț, Județul Neamț",
            founded: 1407
        },
        "Mănăstirea Prislop": {
            region: "Transilvania",
            description: "Mănăstire care a fost condusă de Părintele Arsenie Boca, un important duhovnic ortodox.",
            patron: "Sfântul Ioan Evanghelistul",
            feastDay: "8 mai",
            location: "Silvașu de Sus, Județul Hunedoara",
            founded: 1564
        }
    };
    
    // Date despre sărbători ortodoxe principale
    const orthodoxFeasts = {
        "Nașterea Domnului (Crăciunul)": {
            date: "25 decembrie",
            description: "Sărbătoarea Nașterii Domnului nostru Iisus Hristos."
        },
        "Botezul Domnului (Boboteaza)": {
            date: "6 ianuarie",
            description: "Sărbătoarea Botezului Domnului în Iordan de către Sfântul Ioan Botezătorul."
        },
        "Învierea Domnului (Sfintele Paști)": {
            date: "Data variabilă, prima duminică după prima lună plină de după echinocțiul de primăvară",
            description: "Cea mai importantă sărbătoare creștină, comemorând Învierea lui Iisus Hristos."
        },
        "Adormirea Maicii Domnului": {
            date: "15 august",
            description: "Sărbătoarea adormirii și ridicării la cer cu trupul a Fecioarei Maria."
        },
        "Înălțarea Domnului": {
            date: "40 de zile după Paști",
            description: "Sărbătoarea Înălțării Domnului Iisus Hristos la cer."
        },
        "Pogorârea Sfântului Duh (Rusaliile)": {
            date: "50 de zile după Paști",
            description: "Sărbătoarea Pogorârii Sfântului Duh peste Apostoli."
        }
    };
    
    // Date despre perioadele de post
    const fastingPeriods = {
        "Postul Nașterii Domnului (Postul Crăciunului)": {
            period: "15 noiembrie - 24 decembrie",
            duration: "40 de zile",
            description: "Post care pregătește credincioșii pentru sărbătoarea Nașterii Domnului."
        },
        "Postul Mare (Postul Sfintelor Paști)": {
            period: "Variabil, 40 de zile înainte de Paști",
            duration: "40 de zile plus Săptămâna Mare",
            description: "Cel mai lung și mai aspru post din Biserica Ortodoxă, pregătire pentru Învierea Domnului."
        },
        "Postul Sfinților Apostoli Petru și Pavel": {
            period: "Variabil, începe la o săptămână după Rusalii",
            duration: "Variabil, între 1 și 28 de zile",
            description: "Post în cinstea Sfinților Apostoli Petru și Pavel."
        },
        "Postul Adormirii Maicii Domnului": {
            period: "1-14 august",
            duration: "14 zile",
            description: "Post închinat Maicii Domnului, înainte de sărbătoarea Adormirii sale."
        }
    };
    
    // Rețete de post predefinite
    const fastingRecipes = {
        "Sarmale de post": {
            ingredients: ["1 varză murată", "2 cepe", "1 morcov", "1 pahar de orez", "ciuperci", "condimente"],
            preparation: "Se călește ceapa și morcovul, se adaugă orezul și ciupercile, apoi se înfășoară în foi de varză și se fierb."
        },
        "Ciorbă de legume": {
            ingredients: ["cartofi", "morcovi", "pătrunjel", "țelină", "ceapă", "roșii", "ardei", "leuștean"],
            preparation: "Se fierb legumele tăiate cubulețe, se adaugă pasta de roșii și verdeața tocată."
        },
        "Fasole bătută": {
            ingredients: ["fasole uscată", "ceapă", "usturoi", "ulei", "sare", "piper"],
            preparation: "Fasolea fiartă se pasează, se adaugă ceapa călită și usturoiul pisat."
        }
    };
    
    // Informații despre trasee de pelerinaj
    const pilgrimageRoutes = {
        "Pelerinaj în Moldova": {
            days: 5,
            monasteries: ["Mănăstirea Neamț", "Mănăstirea Sihăstria", "Mănăstirea Secu", "Mănăstirea Agapia", "Mănăstirea Văratec"],
            description: "Traseu circular prin mănăstirile din județul Neamț."
        },
        "Pelerinaj în Bucovina": {
            days: 4,
            monasteries: ["Mănăstirea Voroneț", "Mănăstirea Moldovița", "Mănăstirea Sucevița", "Mănăstirea Putna"],
            description: "Vizitarea mănăstirilor pictate, patrimoniu UNESCO."
        },
        "Pelerinaj la mănăstirile din Transilvania": {
            days: 6,
            monasteries: ["Mănăstirea Prislop", "Mănăstirea Sâmbăta de Sus", "Mănăstirea Râmeț", "Mănăstirea Nicula"],
            description: "Pelerinaj la cele mai importante mănăstiri din Transilvania."
        }
    };
    
    // Funcție pentru a adăuga un mesaj în chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message p-3 max-w-3/4 ml-auto' : 'ai-message p-3 max-w-3/4';
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Funcție pentru a afișa indicatorul de încărcare
    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'ai-message p-3 max-w-3/4 loading-indicator';
        loadingDiv.innerHTML = `
            <div class="loading-dots flex space-x-1">
                <span class="w-2 h-2 bg-gray-500 rounded-full"></span>
                <span class="w-2 h-2 bg-gray-500 rounded-full"></span>
                <span class="w-2 h-2 bg-gray-500 rounded-full"></span>
            </div>
        `;
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return loadingDiv;
    }
    
    // Procesează întrebarea utilizatorului și returnează un răspuns folosind API-ul
    async function processUserQuery(query) {
        try {
            // Folosim API-ul local pentru a procesa întrebarea
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: query })
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.message;
            } else {
                return "A apărut o problemă în procesarea întrebării dumneavoastră. Vă rugăm să încercați din nou.";
            }
        } catch (error) {
            console.error("Eroare la comunicarea cu serverul:", error);
            
            // Răspuns offline pentru cazul în care serverul nu este disponibil
            query = query.toLowerCase();
            
            // Verifică pentru întrebări generale despre mănăstiri
            if (query.includes("mănăstiri") || query.includes("manastiri")) {
                return "DOXA cuprinde informații despre 637 de mănăstiri din România, incluzând detalii despre istorie, program de vizitare și hram.";
            }
            
            // Verifică pentru întrebări despre pelerinaje
            if (query.includes("pelerinaj") || query.includes("traseu") || query.includes("trasee")) {
                return "Puteți planifica pelerinaje la diferite mănăstiri din România folosind platforma noastră. Vă recomandăm să verificați evenimentele religioase pentru a alege perioada optimă.";
            }
            
            // Verifică pentru întrebări despre post
            if (query.includes("post") || query.includes("posturi")) {
                return "Perioadele principale de post în tradiția ortodoxă sunt: Postul Paștelui (cel mai lung și strict), Postul Crăciunului, Postul Sfinților Apostoli Petru și Pavel și Postul Adormirii Maicii Domnului.";
            }
            
            // Verifică pentru întrebări despre calendar
            if (query.includes("calendar") || query.includes("sărbători") || query.includes("sarbatori")) {
                return "Calendarul ortodox include principalele sărbători religioase precum Paștele, Rusaliile, Adormirea Maicii Domnului (15 august) și Nașterea Domnului (25 decembrie).";
            }
            
            // Răspunsuri pentru întrebări generale despre ajutor
            if (query.includes("ajutor") || query.includes("ce poți") || query.includes("ce știi")) {
                return "Vă pot oferi informații despre mănăstiri, pelerinaje, tradiții ortodoxe, rețete de post și sărbători religioase. Întrebați-mă orice legat de aceste subiecte!";
            }
            
            // Răspuns implicit pentru întrebări necunoscute
            return "Mulțumesc pentru întrebarea dumneavoastră despre patrimoniul spiritual ortodox. Pentru informații mai detaliate, vă recomand să consultați secțiunile specializate ale platformei DOXA.";
        }
    }
    
    // Funcție pentru a procesa mesajul utilizatorului
    async function handleUserMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;
        
        // Adaugă mesajul utilizatorului în chat
        addMessage(userMessage, 'user');
        userInput.value = '';
        
        // Afișează indicatorul de încărcare
        const loadingIndicator = showLoadingIndicator();
        
        try {
            // Procesează întrebarea și obține răspunsul
            const aiResponse = await processUserQuery(userMessage);
            
            // Elimină indicatorul de încărcare
            loadingIndicator.remove();
            
            // Adaugă răspunsul asistentului în chat
            addMessage(aiResponse, 'ai');
        } catch (error) {
            console.error("Eroare în procesarea mesajului:", error);
            
            // Elimină indicatorul de încărcare
            loadingIndicator.remove();
            
            // Adaugă un mesaj de eroare în chat
            addMessage("A apărut o eroare în procesarea întrebării. Vă rugăm să încercați din nou.", 'ai');
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });
});