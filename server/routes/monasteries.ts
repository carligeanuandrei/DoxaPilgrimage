import { Express, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { monasteries, cmsContent, insertMonasterySchema } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { isAdmin } from '../auth';
import { z } from 'zod';

/**
 * Middleware pentru a verifica dacă utilizatorul este administrator
 */
function checkAdminAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Autentificare necesară' });
  }
  
  if (!isAdmin(req)) {
    return res.status(403).json({ message: 'Acces interzis - necesită drepturi de administrator' });
  }
  
  next();
}

// Handler pentru rutele legate de mănăstiri
export function registerMonasteryRoutes(app: Express) {
  // Rută pentru a crea intrările CMS necesare pentru mănăstiri
  app.get('/api/init-monastery-cms', async (req, res) => {
    try {
      console.log("Inițializare conținut CMS pentru mănăstiri...");
      
      // Verificăm dacă intrările CMS pentru mănăstiri există
      try {
        const footerLinkMonasteries = await storage.getCmsContent("footer_link_monasteries");
        console.log("Verificare footer_link_monasteries:", footerLinkMonasteries ? "Există" : "Nu există");
        
        // Dacă nu există, îl creăm
        if (!footerLinkMonasteries) {
          console.log("Creăm footer_link_monasteries...");
          const result = await db.insert(cmsContent).values({
            key: "footer_link_monasteries",
            content_type: "text",
            value: "Mănăstiri"
          }).returning();
          console.log("footer_link_monasteries creat:", result);
        }
      } catch (e) {
        console.error("Eroare la verificarea/crearea footer_link_monasteries:", e);
      }
      
      try {
        const footerLinkMonasteriesUrl = await storage.getCmsContent("footer_link_monasteries_url");
        console.log("Verificare footer_link_monasteries_url:", footerLinkMonasteriesUrl ? "Există" : "Nu există");
        
        // Dacă nu există, îl creăm
        if (!footerLinkMonasteriesUrl) {
          console.log("Creăm footer_link_monasteries_url...");
          const result = await db.insert(cmsContent).values({
            key: "footer_link_monasteries_url",
            content_type: "text",
            value: "/monasteries"
          }).returning();
          console.log("footer_link_monasteries_url creat:", result);
        }
      } catch (e) {
        console.error("Eroare la verificarea/crearea footer_link_monasteries_url:", e);
      }
      
      res.json({ message: "Procesul de inițializare a conținutului CMS pentru mănăstiri s-a încheiat" });
    } catch (error) {
      console.error("Eroare la inițializarea conținutului CMS pentru mănăstiri:", error);
      res.status(500).json({ 
        message: "Eroare la inițializarea conținutului CMS pentru mănăstiri", 
        error: String(error) 
      });
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
  
  /**
   * Endpoint-uri pentru administrarea mănăstirilor (ADMIN ONLY)
   */
  
  // GET /api/admin/monasteries - Obține toate mănăstirile pentru panoul de administrare
  app.get('/api/admin/monasteries', checkAdminAccess, async (req, res) => {
    try {
      const allMonasteries = await db.select().from(monasteries).orderBy(desc(monasteries.createdAt));
      
      // Formatăm datele pentru a ne asigura că sunt complete
      const formattedMonasteries = allMonasteries.map(monastery => {
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
      console.error('Error fetching monasteries for admin:', error);
      res.status(500).json({ 
        message: 'Eroare la preluarea mănăstirilor pentru administrare', 
        error: String(error) 
      });
    }
  });
  
  // GET /api/admin/monasteries/:id - Obține detalii despre o mănăstire pentru editare
  app.get('/api/admin/monasteries/:id', checkAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const monasteryId = parseInt(id, 10);
      
      if (isNaN(monasteryId)) {
        return res.status(400).json({ message: 'ID mănăstire invalid' });
      }
      
      const monastery = await db.query.monasteries.findFirst({
        where: eq(monasteries.id, monasteryId)
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
      console.error('Error fetching monastery details for edit:', error);
      res.status(500).json({ 
        message: 'Eroare la preluarea detaliilor mănăstirii pentru editare', 
        error: String(error) 
      });
    }
  });
  
  // PUT /api/admin/monasteries/:id - Actualizează informațiile unei mănăstiri
  app.put('/api/admin/monasteries/:id', checkAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const monasteryId = parseInt(id, 10);
      
      if (isNaN(monasteryId)) {
        return res.status(400).json({ message: 'ID mănăstire invalid' });
      }
      
      // Validăm datele primite
      const updateSchema = insertMonasterySchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Datele trimise nu sunt valide', 
          errors: validationResult.error.errors 
        });
      }
      
      // Verificăm dacă mănăstirea există
      const existingMonastery = await db.query.monasteries.findFirst({
        where: eq(monasteries.id, monasteryId)
      });
      
      if (!existingMonastery) {
        return res.status(404).json({ message: 'Mănăstirea nu a fost găsită' });
      }
      
      // Prelucrăm datele înainte de actualizare pentru a gestiona formatul datei
      let dataToUpdate = { ...validationResult.data };
      
      // Verificăm și procesăm patronSaintDate
      if ('patronSaintDate' in dataToUpdate) {
        // Verificăm dacă este string gol sau null - setăm explicit la null
        if (!dataToUpdate.patronSaintDate || dataToUpdate.patronSaintDate === '') {
          dataToUpdate.patronSaintDate = null;
        } 
        // Dacă este string, încercăm să-l convertim la Date
        else if (typeof dataToUpdate.patronSaintDate === 'string') {
          try {
            const date = new Date(dataToUpdate.patronSaintDate);
            if (!isNaN(date.getTime())) {
              dataToUpdate.patronSaintDate = date;
            } else {
              // Dacă nu e validă, o setăm la null
              dataToUpdate.patronSaintDate = null;
            }
          } catch (error) {
            // În caz de eroare, setăm la null
            dataToUpdate.patronSaintDate = null;
          }
        }
      }
      
      // Verificăm și procesăm array-ul de imagini
      if ('images' in dataToUpdate) {
        // Verificăm dacă images există și este un string (în loc de array)
        if (dataToUpdate.images && typeof dataToUpdate.images === 'string') {
          try {
            // Încercăm să parsăm string-ul ca JSON pentru a obține array-ul
            dataToUpdate.images = JSON.parse(dataToUpdate.images);
          } catch (error) {
            // În caz de eroare la parsare, folosim un array gol
            console.error('Eroare la parsarea array-ului de imagini:', error);
            dataToUpdate.images = [];
          }
        } else if (!dataToUpdate.images) {
          // Dacă images este null/undefined, îl setăm la array gol
          dataToUpdate.images = [];
        }
      }
      
      // Actualizăm mănăstirea în baza de date
      await db.update(monasteries)
        .set({
          ...dataToUpdate,
          updatedAt: new Date()
        })
        .where(eq(monasteries.id, monasteryId));
      
      // Obținem mănăstirea actualizată
      const updatedMonastery = await db.query.monasteries.findFirst({
        where: eq(monasteries.id, monasteryId)
      });
      
      res.json(updatedMonastery);
    } catch (error) {
      console.error('Error updating monastery:', error);
      res.status(500).json({ 
        message: 'Eroare la actualizarea mănăstirii', 
        error: String(error) 
      });
    }
  });
  
  // DELETE /api/admin/monasteries/:id - Șterge o mănăstire
  app.delete('/api/admin/monasteries/:id', checkAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const monasteryId = parseInt(id, 10);
      
      if (isNaN(monasteryId)) {
        return res.status(400).json({ message: 'ID mănăstire invalid' });
      }
      
      // Verificăm dacă mănăstirea există
      const existingMonastery = await db.query.monasteries.findFirst({
        where: eq(monasteries.id, monasteryId)
      });
      
      if (!existingMonastery) {
        return res.status(404).json({ message: 'Mănăstirea nu a fost găsită' });
      }
      
      // Ștergem mănăstirea din baza de date
      await db.delete(monasteries)
        .where(eq(monasteries.id, monasteryId));
      
      res.json({ message: 'Mănăstirea a fost ștearsă cu succes' });
    } catch (error) {
      console.error('Error deleting monastery:', error);
      res.status(500).json({ 
        message: 'Eroare la ștergerea mănăstirii', 
        error: String(error) 
      });
    }
  });
}