
import { Express, Request, Response } from "express";
import { storage } from "../storage";

export async function registerDoxaAIRoutes(app: Express) {
  // Endpoint pentru chat-ul cu DOXA AI
  app.post("/api/doxa-ai/chat", async (req: Request, res: Response) => {
    try {
      const { message, userType = 'user', messageHistory = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Mesajul lipsește" });
      }

      console.log(`Cerere DOXA AI primită: mesaj="${message}", tip utilizator="${userType || 'necunoscut'}"`);
      
      // Răspunsuri predefinite bazate pe cuvinte cheie 
      // (Simulăm un AI până la implementarea completă cu OpenAI)
      let reply = '';
      
      if (message.toLowerCase().includes('pelerinaj') || message.toLowerCase().includes('manastir')) {
        const pilgrimages = await storage.getPilgrimages({ verified: true });
        
        if (pilgrimages.length > 0) {
          reply = `Am găsit ${pilgrimages.length} pelerinaje disponibile. Cel mai popular este "${pilgrimages[0].title}" cu o durată de ${pilgrimages[0].duration} zile și preț de ${pilgrimages[0].price} ${pilgrimages[0].currency}.`;
        } else {
          reply = "În prezent nu avem pelerinaje disponibile, dar te încurajăm să verifici din nou în curând!";
        }
      } else if (message.toLowerCase().includes('preț') || message.toLowerCase().includes('cost')) {
        reply = "Prețurile pentru pelerinaje variază în funcție de durată, locație și serviciile incluse. Oferim opțiuni pentru toate bugetele, de la 200 EUR până la 1500 EUR pentru călătorii internaționale.";
      } else if (message.toLowerCase().includes('transport') || message.toLowerCase().includes('călătorie')) {
        reply = "Majoritatea pelerinajelor includ transport cu autocar de lux sau, pentru destinații îndepărtate, transport aerian. Toate detaliile sunt specificate pe pagina fiecărui pelerinaj.";
      } else if (message.toLowerCase().includes('cazare')) {
        reply = "Cazarea în timpul pelerinajelor este de obicei la case monahale sau hoteluri în apropierea mănăstirilor, asigurând o experiență autentică și confortabilă.";
      } else if (message.toLowerCase().includes('rezervare') || message.toLowerCase().includes('booking')) {
        reply = "Pentru a rezerva un loc la pelerinaj, trebuie să creezi un cont pe platformă, să selectezi pelerinajul dorit și să completezi formularul de rezervare. Plata se poate face online sau prin transfer bancar.";
      } else if (userType === 'organizer' && (message.toLowerCase().includes('adăuga') || message.toLowerCase().includes('creare'))) {
        reply = "Pentru a adăuga un nou pelerinaj, accesează secțiunea 'Pelerinajele mele' din panoul de control, apoi apasă pe butonul 'Adaugă pelerinaj nou'. Completează toate câmpurile obligatorii și apasă 'Salvează'.";
      } else if (userType === 'admin' && (message.toLowerCase().includes('statistici') || message.toLowerCase().includes('raport'))) {
        reply = "Rapoartele și statisticile detaliate sunt disponibile în secțiunea 'Analiză' din panoul administrativ. Poți vizualiza numărul de utilizatori, pelerinaje, rezervări și veniturile totale în intervale personalizabile.";
      } else {
        reply = "Bine ai venit la DOXA AI! Sunt aici să te ajut cu informații despre pelerinaje ortodoxe. Poți întreba despre destinații, prețuri, transport, sau orice altceva legat de pelerinaje.";
      }
      
      // Simulăm o mică întârziere pentru a face interacțiunea mai naturală
      setTimeout(() => {
        res.json({ reply });
      }, 500);
    } catch (error) {
      console.error("Eroare în DOXA AI:", error);
      res.status(500).json({ 
        error: "Eroare la procesarea cererii", 
        details: error instanceof Error ? error.message : "Eroare necunoscută" 
      });
    }
  });
}
