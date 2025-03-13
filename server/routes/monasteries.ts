import { Express } from 'express';
import { storage } from '../storage';
import { monasteries } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';

// Handler pentru rutele legate de mănăstiri
export function registerMonasteryRoutes(app: Express) {
  // Rută pentru a crea intrările CMS necesare pentru mănăstiri
  app.get('/api/init-monastery-cms', async (req, res) => {
    try {
      // Verificăm dacă intrările CMS pentru mănăstiri există
      const footerLinkMonasteries = await storage.getCmsContent("footer_link_monasteries");
      const footerLinkMonasteriesUrl = await storage.getCmsContent("footer_link_monasteries_url");
      
      // Dacă nu există, le creăm
      if (!footerLinkMonasteries) {
        await storage.createCmsContent({
          key: "footer_link_monasteries",
          contentType: "text",
          value: "Mănăstiri",
          description: "Textul pentru link-ul către pagina de mănăstiri din footer"
        });
      }
      
      if (!footerLinkMonasteriesUrl) {
        await storage.createCmsContent({
          key: "footer_link_monasteries_url",
          contentType: "text",
          value: "/monasteries",
          description: "URL pentru link-ul către pagina de mănăstiri din footer"
        });
      }
      
      res.json({ message: "Intrările CMS pentru mănăstiri au fost create cu succes" });
    } catch (error) {
      console.error("Eroare la crearea intrărilor CMS pentru mănăstiri:", error);
      res.status(500).json({ message: "Eroare la crearea intrărilor CMS pentru mănăstiri" });
    }
  });
  // GET /api/monasteries - Obține toate mănăstirile
  app.get('/api/monasteries', async (req, res) => {
    try {
      console.log('Applying filters for monasteries:', req.query);
      
      // Construim condițiile pentru filtrare
      const conditions = [];
      
      if (req.query.region) {
        conditions.push(eq(monasteries.region, req.query.region as string));
      }
      
      if (req.query.type) {
        conditions.push(eq(monasteries.type, req.query.type as string));
      }
      
      if (req.query.verification) {
        conditions.push(eq(monasteries.verification, req.query.verification as string));
      }
      
      // Obținem mănăstirile din baza de date
      let monasteriesList;
      
      if (conditions.length > 0) {
        monasteriesList = await db.select().from(monasteries).where(and(...conditions));
      } else {
        monasteriesList = await db.select().from(monasteries);
      }
      
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