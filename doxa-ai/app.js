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
    
    // Procesează întrebarea utilizatorului și returnează un răspuns
    function processUserQuery(query) {
        query = query.toLowerCase();
        
        // Verifică pentru întrebări despre mănăstiri
        for (const monastery in monasteryData) {
            if (query.includes(monastery.toLowerCase()) || 
                query.includes("mănăstirea " + monastery.split(" ")[1].toLowerCase())) {
                const data = monasteryData[monastery];
                return `<strong>${monastery}</strong><br>
                    Regiune: ${data.region}<br>
                    Hram: ${data.patron} (${data.feastDay})<br>
                    Fondată în anul: ${data.founded}<br>
                    Locație: ${data.location}<br>
                    ${data.description}`;
            }
        }
        
        // Verifică pentru întrebări generale despre mănăstiri
        if (query.includes("mănăstiri") || query.includes("manastiri")) {
            let response = "Iată câteva dintre cele mai importante mănăstiri ortodoxe din România:<br><ul>";
            for (const monastery in monasteryData) {
                response += `<li><strong>${monastery}</strong> (${monasteryData[monastery].region}) - ${monasteryData[monastery].description}</li>`;
            }
            response += "</ul>";
            return response;
        }
        
        // Verifică pentru întrebări despre sărbători ortodoxe
        if (query.includes("sărbători") || query.includes("sarbatori") || query.includes("sărbătoare") || query.includes("sarbatoare")) {
            let response = "Iată principalele sărbători ortodoxe:<br><ul>";
            for (const feast in orthodoxFeasts) {
                response += `<li><strong>${feast}</strong> - ${orthodoxFeasts[feast].date}<br>${orthodoxFeasts[feast].description}</li>`;
            }
            response += "</ul>";
            return response;
        }
        
        // Verifică pentru întrebări despre posturi
        if (query.includes("post") || query.includes("posturi")) {
            let response = "Iată perioadele de post din Biserica Ortodoxă:<br><ul>";
            for (const fastingPeriod in fastingPeriods) {
                response += `<li><strong>${fastingPeriod}</strong><br>
                    Perioada: ${fastingPeriods[fastingPeriod].period}<br>
                    Durată: ${fastingPeriods[fastingPeriod].duration}<br>
                    ${fastingPeriods[fastingPeriod].description}</li>`;
            }
            response += "</ul>";
            return response;
        }
        
        // Verifică pentru întrebări despre rețete de post
        if (query.includes("rețete") || query.includes("retete") || query.includes("mâncare") || query.includes("mancare")) {
            let response = "Iată câteva rețete de post tradiționale:<br><ul>";
            for (const recipe in fastingRecipes) {
                response += `<li><strong>${recipe}</strong><br>
                    Ingrediente: ${fastingRecipes[recipe].ingredients.join(", ")}<br>
                    Preparare: ${fastingRecipes[recipe].preparation}</li>`;
            }
            response += "</ul>";
            return response;
        }
        
        // Verifică pentru întrebări despre trasee de pelerinaj
        if (query.includes("pelerinaj") || query.includes("traseu") || query.includes("trasee")) {
            let response = "Vă recomand următoarele trasee de pelerinaj:<br><ul>";
            for (const route in pilgrimageRoutes) {
                response += `<li><strong>${route}</strong> (${pilgrimageRoutes[route].days} zile)<br>
                    Mănăstiri vizitate: ${pilgrimageRoutes[route].monasteries.join(", ")}<br>
                    ${pilgrimageRoutes[route].description}</li>`;
            }
            response += "</ul>";
            return response;
        }
        
        // Răspunsuri pentru întrebări generale
        if (query.includes("salut") || query.includes("bună") || query.includes("buna") || query.includes("hello")) {
            return "Bună ziua! Sunt asistentul virtual DOXA, specializat în informații despre pelerinaje ortodoxe, mănăstiri și tradiții. Cu ce vă pot ajuta astăzi?";
        }
        
        if (query.includes("mulțumesc") || query.includes("multumesc") || query.includes("mersi")) {
            return "Cu plăcere! Dacă mai aveți întrebări despre pelerinaje, mănăstiri sau tradiții ortodoxe, sunt aici să vă ajut.";
        }
        
        if (query.includes("ce poți") || query.includes("ce poti") || query.includes("ce știi") || query.includes("ce stii") || query.includes("funcții") || query.includes("ajuta")) {
            return "Vă pot oferi informații despre:<br>• Mănăstiri ortodoxe din România<br>• Sărbători ortodoxe<br>• Perioade de post<br>• Rețete de post<br>• Trasee de pelerinaj recomandate<br>Încercați să mă întrebați despre acestea!";
        }
        
        // Răspuns implicit pentru întrebări necunoscute
        return "Îmi pare rău, dar nu am suficiente informații pentru a răspunde la această întrebare. Puteți să mă întrebați despre mănăstiri ortodoxe, sărbători religioase, perioade de post, rețete de post sau trasee de pelerinaj.";
    }
    
    // Funcție pentru a procesa mesajul utilizatorului
    function handleUserMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;
        
        // Adaugă mesajul utilizatorului în chat
        addMessage(userMessage, 'user');
        userInput.value = '';
        
        // Afișează indicatorul de încărcare
        const loadingIndicator = showLoadingIndicator();
        
        // Simulează timpul de procesare
        setTimeout(() => {
            // Elimină indicatorul de încărcare
            loadingIndicator.remove();
            
            // Procesează întrebarea și adaugă răspunsul
            const aiResponse = processUserQuery(userMessage);
            addMessage(aiResponse, 'ai');
        }, 1000);
    }
    
    // Event listeners
    sendButton.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });
});