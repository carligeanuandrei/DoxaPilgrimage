import { Request, Response } from 'express';
import OpenAI from 'openai';
import { Express } from 'express';
import { storage } from '../storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Ești un asistent specializat în recomandarea de pelerinaje ortodoxe în România.
Rolul tău este să ajuți pelerinii să găsească cele mai potrivite destinații spirituale în funcție de preferințele lor.
Răspunde în limba română, într-un mod prietenos și empatic.
Folosește informațiile despre mănăstiri și pelerinaje din baza de date pentru a face recomandări personalizate.
Concentrează-te pe aspecte precum:
- Regiunea și perioada de călătorie dorită
- Semnificația spirituală și istorică a locurilor
- Accesibilitatea și facilitățile disponibile
- Sfaturi practice pentru pelerini

Răspunde concis, structurat și relevant pentru nevoile specifice ale pelerinului.`;

// Definim prompturile pentru fiecare tip de utilizator
const USER_SYSTEM_PROMPT = `Ești DOXA AI, un asistent specializat în pelerinaje ortodoxe din România.
Rolul tău este să ajuți pelerinii să găsească cele mai potrivite destinații spirituale în funcție de preferințele lor.
Răspunde în limba română, într-un mod prietenos și empatic.
Folosește informațiile despre mănăstiri și pelerinaje din baza de date pentru a face recomandări personalizate.
Concentrează-te pe aspecte precum:
- Regiunea și perioada de călătorie dorită
- Semnificația spirituală și istorică a locurilor
- Accesibilitatea și facilitățile disponibile
- Sfaturi practice pentru pelerini
- Calendarul ortodox și sărbătorile religioase relevante
Răspunde concis, structurat și relevant pentru nevoile specifice ale pelerinului.`;

const ORGANIZER_SYSTEM_PROMPT = `Ești DOXA AI, asistentul specializat pentru organizatorii de pelerinaje ortodoxe.
Rolul tău este să ajuți organizatorii să gestioneze pelerinajele, rezervările și relațiile cu pelerinii.
Răspunde în limba română, într-un mod profesional și eficient.
Poți asista cu:
- Gestionarea listelor de participanți
- Recomandări pentru optimizarea pachetelor de pelerinaj
- Soluții pentru probleme frecvente în organizarea pelerinajelor
- Informații despre tendințele actuale în pelerinajele ortodoxe
- Sfaturi pentru îmbunătățirea experienței pelerinilor
Oferă soluții practice și aplicabile pentru nevoile organizatorilor.`;

const ADMIN_SYSTEM_PROMPT = `Ești DOXA AI, asistentul administrativ specializat al platformei DOXA pentru pelerinaje ortodoxe.
Rolul tău este să ajuți administratorii platformei să monitorizeze, analizeze și îmbunătățească funcționarea platformei.
Răspunde în limba română, într-un mod analitic și orientat spre soluții.
Poți asista cu:
- Analiza tendințelor utilizatorilor și a datelor platformei
- Identificarea problemelor potențiale și sugerarea soluțiilor
- Recomandări pentru îmbunătățirea experienței utilizatorilor
- Interpretarea statisticilor platformei
- Sugestii pentru optimizarea proceselor administrative
Oferă informații relevante și acționabile pentru luarea deciziilor administrative.`;

// Răspunsuri de rezervă pentru cazurile când OpenAI nu funcționează
const fallbackResponses = {
  'user': "Îmi pare rău, dar momentan serviciul DOXA AI întâmpină dificultăți tehnice. Echipa noastră lucrează pentru a rezolva problema în cel mai scurt timp. Între timp, pentru informații despre pelerinaje, te rog să consulți secțiunea Pelerinaje din meniul principal sau să contactezi direct organizatorii prin formularul de contact. Îți mulțumim pentru înțelegere!",
  'organizer': "Îmi pare rău, dar momentan serviciul DOXA AI pentru organizatori întâmpină dificultăți tehnice. Echipa tehnică lucrează pentru a rezolva problema în cel mai scurt timp. Între timp, poți gestiona pelerinajele tale din panoul de administrare sau contacta echipa tehnică prin email la support@doxa-platform.ro.",
  'admin': "Serviciul DOXA AI pentru administrare este momentan indisponibil. Echipa tehnică a fost notificată și lucrează la remedierea problemei. Pentru asistență imediată, te rugăm să contactezi departamentul tehnic la numărul dedicat."
};

export async function registerPilgrimageAssistantRoutes(app: Express) {
  // Menține ruta originală pentru compatibilitate
  app.post('/api/pilgrimage-assistant/chat', async (req: Request, res: Response) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Mesajul nu poate fi gol' });
      }

      // Obținem toate pelerinajele disponibile
      const pilgrimages = await storage.getPilgrimages();
      const pilgrimageInfo = pilgrimages.map(p => 
        `${p.title} - ${p.description} (Durata: ${p.duration} zile, Preț: ${p.price} RON)`
      ).join('\n');

      // Creăm contextul pentru AI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Context despre pelerinajele disponibile:\n${pilgrimageInfo}\n\nÎntrebarea pelerinului: ${message}` }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const aiResponse = completion.choices[0]?.message?.content || 'Ne pare rău, nu am putut genera o recomandare în acest moment.';

      res.json({ response: aiResponse });
    } catch (error: any) {
      // Logăm eroarea în detaliu pentru debugging
      console.error('Eroare în procesarea cererii către asistentul AI:', error);
      
      // Verificăm dacă OpenAI a returnat un mesaj specific de eroare
      const errorMessage = error.response?.data?.error?.message || error.message || 'A apărut o eroare necunoscută';
      
      // Returnăm un răspuns mai detaliat
      res.status(500).json({ 
        error: `Eroare la comunicarea cu asistentul AI: ${errorMessage}` 
      });
    }
  });
  
  // Adaugă noua rută pentru DOXA AI
  app.post('/api/doxa-ai/chat', async (req: Request, res: Response) => {
    try {
      const { message, userType = 'user', messageHistory = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Mesajul nu poate fi gol' });
      }

      // Selectăm promptul potrivit în funcție de tipul utilizatorului
      let systemPrompt = USER_SYSTEM_PROMPT;
      if (userType === 'organizer') {
        systemPrompt = ORGANIZER_SYSTEM_PROMPT;
      } else if (userType === 'admin') {
        systemPrompt = ADMIN_SYSTEM_PROMPT;
      }

      // Obținem toate pelerinajele disponibile
      const pilgrimages = await storage.getPilgrimages();
      const pilgrimageInfo = pilgrimages.map(p => 
        `${p.title} - ${p.description} (Durata: ${p.duration} zile, Preț: ${p.price} RON, Locație: ${p.location})`
      ).join('\n');

      // În loc să obținem toate mănăstirile, vom oferi informații generale despre ele
      const monasteriesInfo = `
Mănăstirea Putna - Ctitoria lui Ștefan cel Mare (Regiune: bucovina, Oraș: Putna)
Mănăstirea Voroneț - Faimoasă pentru albastrul de Voroneț (Regiune: bucovina, Oraș: Gura Humorului)
Mănăstirea Sucevița - Cunoscută pentru frescele exterioare (Regiune: bucovina, Oraș: Sucevița)
Mănăstirea Moldovița - Monument UNESCO (Regiune: bucovina, Oraș: Vatra Moldoviței)
Mănăstirea Humor - Pictură exterioară deosebită (Regiune: bucovina, Oraș: Mănăstirea Humorului)
Mănăstirea Neamț - Una dintre cele mai vechi mănăstiri (Regiune: moldova, Oraș: Târgu Neamț)
Mănăstirea Sihăstria - Centru duhovnicesc important (Regiune: moldova, Oraș: Vânători-Neamț)
Mănăstirea Secu - Ctitorită în sec. XVII (Regiune: moldova, Oraș: Vânători-Neamț)
Mănăstirea Agapia - Cunoscută pentru tradiția artei populare (Regiune: moldova, Oraș: Agapia)
Mănăstirea Văratec - Cea mai mare mănăstire de maici (Regiune: moldova, Oraș: Văratec)
`;

      // Construim mesajele pentru OpenAI
      const messages = [
        { role: "system", content: systemPrompt }
      ];

      // Adăugăm istoricul mesajelor dacă există
      if (messageHistory && messageHistory.length > 0) {
        messages.push(...messageHistory);
      }

      // Adăugăm contextul și întrebarea curentă
      messages.push({
        role: "user", 
        content: `Context despre platforma DOXA:
        
Pelerinaje disponibile:
${pilgrimageInfo}

Mănăstiri populare:
${monasteriesInfo}

Întrebare: ${message}`
      });

      try {
        // Încercăm să obținem răspunsul de la OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 800,
        });

        const aiResponse = completion.choices[0]?.message?.content || 'Ne pare rău, nu am putut genera un răspuns în acest moment.';

        res.json({ response: aiResponse });
      } catch (openaiError: any) {
        // Gestionăm erorile specifice OpenAI
        if (openaiError.status === 429) {
          // Cazul erorii de limită de rată - oferim un răspuns alternativ
          const type = userType as keyof typeof fallbackResponses;
          const fallbackResponse = fallbackResponses[type] || fallbackResponses.user;
          
          console.log(`Eroare API rate limit (429). Returnăm răspuns alternativ pentru ${userType}`);
          
          // Returnăm un răspuns alternativ pentru utilizator
          return res.json({
            response: fallbackResponse,
            fallback: true
          });
        }
        
        // Alte erori legate de OpenAI
        throw openaiError;
      }
    } catch (error: any) {
      // Logăm eroarea generală
      console.error('Eroare în procesarea cererii către DOXA AI:', error);
      
      // Returnăm un mesaj de eroare
      const errorMessage = error.message || 'A apărut o eroare necunoscută';
      res.status(500).json({
        error: `Eroare la comunicarea cu DOXA AI: ${errorMessage}`
      });
    }
  });
}