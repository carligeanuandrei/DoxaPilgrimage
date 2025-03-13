import { Express } from 'express';
import { storage } from '../storage';
import { monasteries } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from '../db';

// Handler pentru rutele legate de mănăstiri
export function registerMonasteryRoutes(app: Express) {
  // GET /api/monasteries - Obține toate mănăstirile
  app.get('/api/monasteries', async (req, res) => {
    try {
      // Aplicăm filtre dacă sunt specificate
      const filters: any = {};
      
      if (req.query.region) filters.region = req.query.region as string;
      if (req.query.type) filters.type = req.query.type as string;
      if (req.query.verification) filters.verification = req.query.verification as string;
      
      console.log('Applying filters for monasteries:', filters);
      
      // Obținem mănăstirile din baza de date
      const monasteriesList = await db.query.monasteries.findMany({
        where: filters
      });
      
      // Formatăm datele pentru a ne asigura că sunt complete
      const formattedMonasteries = monasteriesList.map(monastery => {
        return {
          ...monastery,
          // Convertim explicit câmpurile de date pentru a ne asigura că sunt formatate corect
          patronSaintDate: monastery.patronSaintDate instanceof Date 
            ? monastery.patronSaintDate 
            : monastery.patronSaintDate ? new Date(monastery.patronSaintDate) : null,
          // Asigurăm că valorile pentru arrays sunt definite
          images: monastery.images || [],
          relics: monastery.relics || [],
          iconDescriptions: monastery.iconDescriptions || []
        };
      });
      
      res.json(formattedMonasteries);
    } catch (error) {
      console.error('Error fetching monasteries:', error);
      res.status(500).json({ 
        message: 'Eroare la preluarea mănăstirilor', 
        error: String(error) 
      });
    }
  });

  // GET /api/monasteries/:slug - Obține detalii despre o mănăstire
  app.get('/api/monasteries/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Căutăm mănăstirea după slug
      const monastery = await db.query.monasteries.findFirst({
        where: eq(monasteries.slug, slug)
      });
      
      if (!monastery) {
        return res.status(404).json({ message: 'Mănăstirea nu a fost găsită' });
      }
      
      // Formatăm datele pentru a ne asigura că sunt complete
      const formattedMonastery = {
        ...monastery,
        // Convertim explicit câmpurile de date pentru a ne asigura că sunt formatate corect
        patronSaintDate: monastery.patronSaintDate instanceof Date 
          ? monastery.patronSaintDate 
          : monastery.patronSaintDate ? new Date(monastery.patronSaintDate) : null,
        // Asigurăm că valorile pentru arrays sunt definite
        images: monastery.images || [],
        relics: monastery.relics || [],
        iconDescriptions: monastery.iconDescriptions || []
      };
      
      res.json(formattedMonastery);
    } catch (error) {
      console.error('Error fetching monastery details:', error);
      res.status(500).json({ 
        message: 'Eroare la preluarea detaliilor mănăstirii', 
        error: String(error) 
      });
    }
  });
}