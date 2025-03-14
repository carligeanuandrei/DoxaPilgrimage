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

export async function registerPilgrimageAssistantRoutes(app: Express) {
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
        model: "gpt-4",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Context despre pelerinajele disponibile:\n${pilgrimageInfo}\n\nÎntrebarea pelerinului: ${message}` }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const aiResponse = completion.choices[0]?.message?.content || 'Ne pare rău, nu am putut genera o recomandare în acest moment.';

      res.json({ response: aiResponse });
    } catch (error) {
      console.error('Eroare în procesarea cererii către asistentul AI:', error);
      res.status(500).json({ 
        error: 'A apărut o eroare în procesarea cererii. Vă rugăm să încercați din nou.' 
      });
    }
  });
}