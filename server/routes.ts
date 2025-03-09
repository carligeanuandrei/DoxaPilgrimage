import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertPilgrimageSchema, 
  insertReviewSchema, 
  insertBookingSchema,
  insertMessageSchema
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
      
      const pilgrimages = await storage.getPilgrimages(filters);
      res.json(pilgrimages);
    } catch (error) {
      res.status(500).json({ message: "Eroare la preluarea pelerinajelor" });
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

  const httpServer = createServer(app);

  return httpServer;
}
