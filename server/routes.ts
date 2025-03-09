import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertPilgrimageSchema, 
  insertReviewSchema, 
  insertBookingSchema,
  insertMessageSchema,
  insertCmsContentSchema
} from "@shared/schema";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Check auth middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Autentificare necesară" });
  };

  // Check admin role middleware
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Acces interzis" });
  };
  
  // API pentru a obține toți utilizatorii (pentru admin)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      // Obținem toți utilizatorii din storage
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Eroare la obținerea listei de utilizatori" });
    }
  });
  
  // Actualizare profil utilizator
  app.put("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificăm dacă utilizatorul încearcă să actualizeze propriul profil sau este admin
      if (req.user.id !== id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu aveți permisiunea de a actualiza acest profil" });
      }
      
      const updateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone || null,
        profileImage: req.body.profileImage || null,
        bio: req.body.bio || null
      };
      
      const updatedUser = await storage.updateUser(id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Eroare la actualizarea profilului utilizatorului" });
    }
  });

  // Check organizer role middleware
  const isOrganizer = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && (req.user.role === "operator" || req.user.role === "monastery" || req.user.role === "admin")) {
      return next();
    }
    res.status(403).json({ message: "Acces interzis" });
  };

  // Pilgrimages
  app.get("/api/pilgrimages", async (req, res) => {
    try {
      const filters: any = {};
      
      // Extract filters from query params
      if (req.query.location) filters.location = req.query.location as string;
      if (req.query.month) filters.month = req.query.month as string;
      if (req.query.saint) filters.saint = req.query.saint as string;
      if (req.query.transportation) filters.transportation = req.query.transportation as string;
      if (req.query.guide) filters.guide = req.query.guide as string;
      
      console.log("Trying to fetch pilgrimages with filters:", filters);
      const pilgrimages = await storage.getPilgrimages(filters);
      res.json(pilgrimages);
    } catch (error) {
      console.error("Error fetching pilgrimages:", error);
      res.status(500).json({ message: "Eroare la preluarea pelerinajelor", error: String(error) });
    }
  });

  app.get("/api/pilgrimages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(id);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      res.json(pilgrimage);
    } catch (error) {
      res.status(500).json({ message: "Eroare la preluarea detaliilor pelerinajului" });
    }
  });

  app.post("/api/pilgrimages", isOrganizer, async (req, res) => {
    try {
      const validData = insertPilgrimageSchema.parse(req.body);
      const pilgrimage = await storage.createPilgrimage({
        ...validData,
        organizerId: req.user.id
      });
      
      res.status(201).json(pilgrimage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Date invalide", errors: error.errors });
      }
      res.status(500).json({ message: "Eroare la crearea pelerinajului" });
    }
  });

  app.put("/api/pilgrimages/:id", isOrganizer, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(id);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      // Check if the user is the organizer or an admin
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu aveți permisiunea de a modifica acest pelerinaj" });
      }
      
      const updatedPilgrimage = await storage.updatePilgrimage(id, req.body);
      res.json(updatedPilgrimage);
    } catch (error) {
      res.status(500).json({ message: "Eroare la actualizarea pelerinajului" });
    }
  });

  // Reviews
  app.get("/api/pilgrimages/:id/reviews", async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      const reviews = await storage.getReviews(pilgrimageId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Eroare la preluarea recenziilor" });
    }
  });

  app.post("/api/pilgrimages/:id/reviews", isAuthenticated, async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(pilgrimageId);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      const validData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview({
        ...validData,
        pilgrimageId,
        userId: req.user.id
      });
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Date invalide", errors: error.errors });
      }
      res.status(500).json({ message: "Eroare la crearea recenziei" });
    }
  });

  // Bookings
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getBookings(req.user.id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Eroare la preluarea rezervărilor" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const validData = insertBookingSchema.parse(req.body);
      const pilgrimage = await storage.getPilgrimage(validData.pilgrimageId);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      if (pilgrimage.availableSpots < validData.persons) {
        return res.status(400).json({ message: "Nu sunt suficiente locuri disponibile" });
      }
      
      const booking = await storage.createBooking({
        ...validData,
        userId: req.user.id,
        totalPrice: pilgrimage.price * validData.persons
      });
      
      // Update available spots
      await storage.updatePilgrimage(pilgrimage.id, {
        availableSpots: pilgrimage.availableSpots - validData.persons
      });
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Date invalide", errors: error.errors });
      }
      res.status(500).json({ message: "Eroare la crearea rezervării" });
    }
  });

  // Messages
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getMessages(req.user.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Eroare la preluarea mesajelor" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const validData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage({
        ...validData,
        fromUserId: req.user.id
      });
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Date invalide", errors: error.errors });
      }
      res.status(500).json({ message: "Eroare la trimiterea mesajului" });
    }
  });

  app.put("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.markMessageAsRead(id);
      
      if (!message) {
        return res.status(404).json({ message: "Mesajul nu a fost găsit" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Eroare la marcarea mesajului ca citit" });
    }
  });

  // Admin routes
  app.put("/api/users/:id/verify", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
      }
      
      const updatedUser = await storage.updateUser(id, { verified: true });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Eroare la verificarea utilizatorului" });
    }
  });

  app.put("/api/pilgrimages/:id/verify", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(id);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      const updatedPilgrimage = await storage.updatePilgrimage(id, { verified: true });
      res.json(updatedPilgrimage);
    } catch (error) {
      res.status(500).json({ message: "Eroare la verificarea pelerinajului" });
    }
  });

  app.put("/api/pilgrimages/:id/feature", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(id);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      const updatedPilgrimage = await storage.updatePilgrimage(id, { featured: req.body.featured });
      res.json(updatedPilgrimage);
    } catch (error) {
      res.status(500).json({ message: "Eroare la setarea pelerinajului ca și recomandat" });
    }
  });

  // Rute pentru gestionarea pelerinajelor de către organizatori
  
  // Obținerea pelerinajelor organizatorului curent
  app.get("/api/organizer/pilgrimages", isOrganizer, async (req, res) => {
    try {
      // Obținem toate pelerinajele organizatorului autentificat
      const pilgrimages = await storage.getPilgrimages({ organizerId: req.user.id });
      res.json(pilgrimages);
    } catch (error) {
      console.error("Error fetching organizer pilgrimages:", error);
      res.status(500).json({ message: "Eroare la preluarea pelerinajelor" });
    }
  });
  
  // Obținerea rezervărilor pentru un pelerinaj specific al organizatorului
  app.get("/api/organizer/pilgrimages/:id/bookings", isOrganizer, async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(pilgrimageId);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      // Verificăm dacă pelerinajul aparține organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu aveți acces la rezervările acestui pelerinaj" });
      }
      
      // Obținem rezervările pentru acest pelerinaj
      const bookings = await storage.getBookingsByPilgrimageId(pilgrimageId);
      
      // Pentru fiecare rezervare, adăugăm informații despre utilizator
      const bookingsWithUsers = await Promise.all(
        bookings.map(async (booking) => {
          const user = await storage.getUser(booking.userId);
          return {
            ...booking,
            user: user ? {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone
            } : null
          };
        })
      );
      
      res.json(bookingsWithUsers);
    } catch (error) {
      console.error("Error fetching pilgrimage bookings:", error);
      res.status(500).json({ message: "Eroare la preluarea rezervărilor" });
    }
  });
  
  // Obținerea raportului financiar pentru un pelerinaj specific
  app.get("/api/organizer/pilgrimages/:id/financial-report", isOrganizer, async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(pilgrimageId);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      // Verificăm dacă pelerinajul aparține organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu aveți acces la informațiile financiare ale acestui pelerinaj" });
      }
      
      // Obținem toate rezervările pentru acest pelerinaj
      const bookings = await storage.getBookingsByPilgrimageId(pilgrimageId);
      
      // Calculăm sumele totale
      const totalAmount = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
      const confirmedAmount = bookings
        .filter(booking => booking.status === "confirmed")
        .reduce((sum, booking) => sum + booking.totalPrice, 0);
      const pendingAmount = bookings
        .filter(booking => booking.status === "pending")
        .reduce((sum, booking) => sum + booking.totalPrice, 0);
      
      // Contabilizăm numărul de persoane
      const totalPersons = bookings.reduce((sum, booking) => sum + booking.persons, 0);
      const confirmedPersons = bookings
        .filter(booking => booking.status === "confirmed")
        .reduce((sum, booking) => sum + booking.persons, 0);
      
      res.json({
        pilgrimage: {
          id: pilgrimage.id,
          title: pilgrimage.title,
          price: pilgrimage.price,
          availableSpots: pilgrimage.availableSpots
        },
        bookings: {
          total: bookings.length,
          confirmed: bookings.filter(booking => booking.status === "confirmed").length,
          pending: bookings.filter(booking => booking.status === "pending").length,
          cancelled: bookings.filter(booking => booking.status === "cancelled").length
        },
        financial: {
          totalAmount,
          confirmedAmount,
          pendingAmount,
          currency: pilgrimage.currency
        },
        persons: {
          total: totalPersons,
          confirmed: confirmedPersons,
          spotsFilled: totalPersons,
          spotsRemaining: pilgrimage.availableSpots - totalPersons
        }
      });
    } catch (error) {
      console.error("Error generating financial report:", error);
      res.status(500).json({ message: "Eroare la generarea raportului financiar" });
    }
  });
  
  // Publicarea unui pelerinaj
  app.post("/api/organizer/pilgrimages/:id/publish", isOrganizer, async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(pilgrimageId);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      // Verificăm dacă pelerinajul aparține organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu aveți permisiunea de a publica acest pelerinaj" });
      }
      
      // Actualizăm statusul pelerinajului la verificat (publicat)
      const updatedPilgrimage = await storage.updatePilgrimage(pilgrimageId, { verified: true });
      
      res.json(updatedPilgrimage);
    } catch (error) {
      console.error("Error publishing pilgrimage:", error);
      res.status(500).json({ message: "Eroare la publicarea pelerinajului" });
    }
  });
  
  // Depublicarea unui pelerinaj
  app.post("/api/organizer/pilgrimages/:id/unpublish", isOrganizer, async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(pilgrimageId);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      // Verificăm dacă pelerinajul aparține organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu aveți permisiunea de a depublica acest pelerinaj" });
      }
      
      // Actualizăm statusul pelerinajului la neverificat (nepublicat)
      const updatedPilgrimage = await storage.updatePilgrimage(pilgrimageId, { verified: false });
      
      res.json(updatedPilgrimage);
    } catch (error) {
      console.error("Error unpublishing pilgrimage:", error);
      res.status(500).json({ message: "Eroare la depublicarea pelerinajului" });
    }
  });

  // Payment endpoint
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { bookingId } = req.body;
      const booking = await storage.getBookings(req.user.id)
        .then(bookings => bookings.find(b => b.id === bookingId));
      
      if (!booking) {
        return res.status(404).json({ message: "Rezervarea nu a fost găsită" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalPrice * 100), // Convert to cents
        currency: "eur",
        metadata: {
          bookingId: booking.id.toString(),
          userId: req.user.id.toString()
        }
      });
      
      await storage.updateBooking(booking.id, {
        paymentId: paymentIntent.id
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ message: "Eroare la procesarea plății" });
    }
  });

  app.post("/api/confirm-payment", isAuthenticated, async (req, res) => {
    try {
      const { bookingId, paymentId } = req.body;
      
      // In a real app, you would verify the payment with Stripe here
      
      const booking = await storage.updateBooking(parseInt(bookingId), {
        paymentStatus: "paid",
        status: "confirmed"
      });
      
      if (!booking) {
        return res.status(404).json({ message: "Rezervarea nu a fost găsită" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Eroare la confirmarea plății" });
    }
  });

  // CMS routes
  app.get("/api/cms", async (req, res) => {
    try {
      // Dezactivăm cache-ul pentru toate răspunsurile API CMS
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const content = await storage.getCmsContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching CMS content:", error);
      res.status(500).json({ message: "Eroare la preluarea conținutului CMS" });
    }
  });

  app.get("/api/cms/:key", async (req, res) => {
    try {
      // Dezactivăm cache-ul pentru toate răspunsurile API CMS
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const key = req.params.key;
      const content = await storage.getCmsContent(key);
      
      if (!content) {
        return res.status(404).json({ message: "Conținutul CMS nu a fost găsit" });
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching CMS content:", error);
      res.status(500).json({ message: "Eroare la preluarea conținutului CMS" });
    }
  });

  app.post("/api/cms", isAdmin, async (req, res) => {
    try {
      const validData = insertCmsContentSchema.parse(req.body);
      const content = await storage.createCmsContent(validData);
      
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Date invalide", errors: error.errors });
      }
      console.error("Error creating CMS content:", error);
      res.status(500).json({ message: "Eroare la crearea conținutului CMS" });
    }
  });

  app.put("/api/cms/:key", isAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const content = await storage.getCmsContent(key);
      
      if (!content) {
        return res.status(404).json({ message: "Conținutul CMS nu a fost găsit" });
      }
      
      const updatedContent = await storage.updateCmsContent(key, req.body);
      
      // Adăugăm un eveniment de log pentru a verifica actualizarea
      console.log(`CMS content updated: ${key}`, updatedContent);
      
      // Dezactivăm cache-ul pentru a forța reîncărcarea datelor
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      res.json(updatedContent);
    } catch (error) {
      console.error("Error updating CMS content:", error);
      res.status(500).json({ message: "Eroare la actualizarea conținutului CMS" });
    }
  });

  app.delete("/api/cms/:key", isAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const content = await storage.getCmsContent(key);
      
      if (!content) {
        return res.status(404).json({ message: "Conținutul CMS nu a fost găsit" });
      }
      
      const result = await storage.deleteCmsContent(key);
      
      if (result) {
        res.json({ success: true, message: "Conținutul CMS a fost șters cu succes" });
      } else {
        res.status(500).json({ message: "Eroare la ștergerea conținutului CMS" });
      }
    } catch (error) {
      console.error("Error deleting CMS content:", error);
      res.status(500).json({ message: "Eroare la ștergerea conținutului CMS" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
