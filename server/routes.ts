import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  insertPilgrimageSchema, 
  insertReviewSchema, 
  insertBookingSchema,
  insertMessageSchema,
  insertCmsContentSchema
} from "@shared/schema";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2023-10-16" as any,
});

// Configurare multer pentru încărcarea imaginilor
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'public/images/pilgrimages';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

// Configurare storage pentru CMS imagini
const cmsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'public/uploads';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'cms-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit to 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  }
});

const cmsUpload = multer({ 
  storage: cmsStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit to 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp|svg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Servim fișierele statice din directorul public
  app.use('/static', express.static('public'));
  
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
  
  // Statistici despre organizatorii de pelerinaje (pentru admin)
  app.get("/api/admin/organizer-stats", isAdmin, async (req, res) => {
    try {
      // Obținem toți utilizatorii cu rol de organizator
      const users = await storage.getAllUsers();
      const organizerUsers = users.filter(user => user.role === "operator" || user.role === "monastery");
      
      // Pentru fiecare organizator, obținem statisticile sale
      const organizerStatsPromises = organizerUsers.map(async (user) => {
        // Obținem pelerinajele acestui organizator
        const pilgrimages = await storage.getPilgrimages({ organizerId: user.id });
        
        // Calculăm câte pelerinaje promovate are
        const promotedPilgrimages = pilgrimages.filter(p => p.promoted);
        
        // Obținem toate rezervările pentru pelerinajele acestui organizator
        let totalBookings = 0;
        let totalRevenue = 0;
        let ratingsSum = 0;
        let ratingsCount = 0;
        
        for (const pilgrimage of pilgrimages) {
          // Obținem rezervările pentru acest pelerinaj
          const bookings = await storage.getBookingsByPilgrimageId(pilgrimage.id);
          
          // Adăugăm rezervările confirmate
          const confirmedBookings = bookings.filter(b => b.status === "confirmed");
          totalBookings += confirmedBookings.length;
          
          // Calculăm veniturile totale
          totalRevenue += confirmedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
          
          // Obținem recenziile pentru acest pelerinaj
          const reviews = await storage.getReviews(pilgrimage.id);
          if (reviews.length > 0) {
            ratingsSum += reviews.reduce((sum, review) => sum + review.rating, 0);
            ratingsCount += reviews.length;
          }
        }
        
        // Calculăm ratingul mediu
        const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;
        
        // Determinăm ultima activitate (data celui mai recent pelerinaj)
        const lastActivityDate = pilgrimages.length > 0 
          ? new Date(Math.max(...pilgrimages.map(p => new Date(p.createdAt).getTime())))
          : new Date(user.createdAt);
        
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          pilgrimagesCount: pilgrimages.length,
          promotedPilgrimagesCount: promotedPilgrimages.length,
          totalBookings,
          totalRevenue,
          averageRating,
          lastActivity: lastActivityDate.toISOString(),
          profileImage: user.profileImage
        };
      });
      
      const organizerStats = await Promise.all(organizerStatsPromises);
      
      // Sortăm după numărul de rezervări, descrescător
      organizerStats.sort((a, b) => b.totalBookings - a.totalBookings);
      
      res.json(organizerStats);
    } catch (error) {
      console.error("Error getting organizer stats:", error);
      res.status(500).json({ message: "Eroare la obținerea statisticilor organizatorilor" });
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
  
  // Modificarea parolei utilizatorului
  app.put("/api/users/:id/change-password", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { currentPassword, newPassword } = req.body;
      
      // Verificăm dacă utilizatorul încearcă să modifice alt cont
      if (id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu ai permisiunea să modifici parola pentru acest cont" });
      }
      
      // Verificăm existența utilizatorului
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "Utilizator negăsit" });
      }
      
      // Importăm funcțiile pentru hash și comparare parole din auth.ts
      const { comparePasswords, hashPassword } = await import('./auth');
      
      // Verificăm parola actuală (exceptând admin care poate schimba fără verificare)
      if (req.user.role !== "admin") {
        const isPasswordValid = await comparePasswords(currentPassword, existingUser.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: "Parola actuală este incorectă" });
        }
      }
      
      // Generăm hash pentru noua parolă
      const hashedPassword = await hashPassword(newPassword);
      
      // Actualizăm parola
      const updatedUser = await storage.updateUser(id, { password: hashedPassword });
      
      // Dacă utilizatorul este administratorul special, actualizăm și variabila globală
      if (id === 9999) {
        global.updatedAdminUser = updatedUser;
        console.log("Admin password updated in global variable");
      }
      
      res.json({ message: "Parola a fost schimbată cu succes" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Eroare la schimbarea parolei" });
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
      
      // Adăugăm implicit filtrul pentru a afișa doar pelerinajele verificate/publicate
      // Acest lucru asigură că doar pelerinajele publicate apar în pagina publică
      filters.verified = true;
      
      // Extract filters from query params
      if (req.query.location) filters.location = req.query.location as string;
      if (req.query.month) filters.month = req.query.month as string;
      if (req.query.saint) filters.saint = req.query.saint as string;
      if (req.query.transportation) filters.transportation = req.query.transportation as string;
      if (req.query.guide) filters.guide = req.query.guide as string;
      if (req.query.featured) filters.featured = req.query.featured === 'true';
      
      console.log("Trying to fetch pilgrimages with filters:", filters);
      const pilgrimages = await storage.getPilgrimages(filters);
      
      // Asigurăm că datele pentru fiecare pelerinaj sunt formatate corect
      const formattedPilgrimages = pilgrimages.map(pilgrimage => {
        return {
          ...pilgrimage,
          // Convertim explicit câmpurile de date pentru a ne asigura că sunt formatate corect
          startDate: pilgrimage.startDate instanceof Date ? pilgrimage.startDate : new Date(pilgrimage.startDate),
          endDate: pilgrimage.endDate instanceof Date ? pilgrimage.endDate : new Date(pilgrimage.endDate),
          // Asigurăm că valorile booleene sunt definite
          featured: pilgrimage.featured === null ? false : pilgrimage.featured,
          verified: pilgrimage.verified === null ? false : pilgrimage.verified,
          promoted: pilgrimage.promoted === null ? false : pilgrimage.promoted
        };
      });
      
      // Sortăm pelerinajele - featured first
      try {
        const featuredPilgrimages = formattedPilgrimages.filter(p => p.featured === true);
        const regularPilgrimages = formattedPilgrimages.filter(p => p.featured !== true);
        
        // Combinăm cele două liste, cu pelerinajele featured la început
        const sortedPilgrimages = [...featuredPilgrimages, ...regularPilgrimages];
        
        return res.json(sortedPilgrimages);
      } catch (err) {
        // În caz de erori la sortare, returnăm lista procesată
        console.error("Error sorting pilgrimages:", err);
        return res.json(formattedPilgrimages);
      }

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
      
      // Formatăm datele pentru a asigura compatibilitatea
      const formattedPilgrimage = {
        ...pilgrimage,
        // Convertim explicit câmpurile de date pentru a ne asigura că sunt formatate corect
        startDate: pilgrimage.startDate instanceof Date ? pilgrimage.startDate : new Date(pilgrimage.startDate),
        endDate: pilgrimage.endDate instanceof Date ? pilgrimage.endDate : new Date(pilgrimage.endDate),
        // Asigurăm că valorile booleene sunt definite
        featured: pilgrimage.featured === null ? false : pilgrimage.featured,
        verified: pilgrimage.verified === null ? false : pilgrimage.verified,
        promoted: pilgrimage.promoted === null ? false : pilgrimage.promoted
      };
      
      res.json(formattedPilgrimage);
    } catch (error) {
      console.error("Error fetching pilgrimage details:", error);
      res.status(500).json({ message: "Eroare la preluarea detaliilor pelerinajului", error: String(error) });
    }
  });

  app.post("/api/pilgrimages", isOrganizer, async (req, res) => {
    try {
      console.log(">>> Date primite pentru crearea pelerinajului:", JSON.stringify(req.body, null, 2));
      
      // Preluăm organizerId din utilizatorul autentificat sau din date
      const organizerId = req.user?.id || req.body.organizerId;
      
      if (!organizerId) {
        console.error(">>> Error: ID organizator lipsă");
        return res.status(400).json({ message: "ID organizator lipsă" });
      }
      
      // Pregătim datele pentru validare
      const formData = {
        ...req.body,
        organizerId
      };
      
      // Validăm datele de intrare
      let validData;
      try {
        validData = insertPilgrimageSchema.parse(formData);
        console.log(">>> Date validate cu success prin Zod:", JSON.stringify(validData));
      } catch (validationError) {
        console.error(">>> Eroare detaliată de validare Zod:", JSON.stringify(validationError, null, 2));
        return res.status(400).json({ 
          message: "Date invalide pentru creare pelerinaj", 
          errors: validationError instanceof z.ZodError ? validationError.errors : String(validationError) 
        });
      }
      
      // Procesăm datele pentru a le face compatibile cu baza de date
      const startDate = validData.startDate instanceof Date 
        ? validData.startDate 
        : new Date(validData.startDate);
        
      const endDate = validData.endDate instanceof Date 
        ? validData.endDate 
        : new Date(validData.endDate);
        
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ 
          message: "Datele de început și sfârșit trebuie să fie valide"
        });
      }
      
      // Creem obiectul final pentru baza de date
      const pilgrimageData = {
        title: validData.title,
        description: validData.description,
        location: validData.location,
        month: validData.month,
        startDate, 
        endDate,
        price: Number(validData.price),
        currency: validData.currency || "EUR",
        transportation: validData.transportation,
        guide: validData.guide,
        saint: validData.saint || "",
        duration: Number(validData.duration),
        includedServices: validData.includedServices || [],
        images: validData.images || [],
        organizerId,
        availableSpots: Number(validData.availableSpots)
      };
      
      console.log(">>> Date finale pentru creare pelerinaj:", JSON.stringify(pilgrimageData, null, 2));
      
      // Creăm pelerinajul în baza de date
      try {
        const pilgrimage = await storage.createPilgrimage(pilgrimageData);
        console.log(">>> Pelerinaj creat cu succes:", pilgrimage.id);
        res.status(201).json(pilgrimage);
      } catch (dbError) {
        console.error(">>> Eroare la inserarea în baza de date:", dbError);
        return res.status(500).json({ 
          message: "Eroare la stocarea pelerinajului", 
          details: dbError.message 
        });
      }
    } catch (error) {
      console.error(">>> Eroare la crearea pelerinajului:", error);
      res.status(500).json({ 
        message: "Eroare la crearea pelerinajului", 
        details: error instanceof Error ? error.message : "Eroare neașteptată" 
      });
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
      
      // Eliminăm explicit orice referință la status pentru a preveni erorile 
      // legate de coloana care nu mai există în baza de date
      const updateData = { ...req.body };
      if ('status' in updateData) {
        delete updateData.status;
      }
      
      // Procesăm datele de început și sfârșit pentru a asigura că sunt obiecte Date valide
      if (updateData.startDate) {
        try {
          // Convertim la obiect Date dacă este string
          updateData.startDate = new Date(updateData.startDate);
          
          // Verificăm dacă data rezultată este validă
          if (isNaN(updateData.startDate.getTime())) {
            throw new Error("Data de început invalidă");
          }
        } catch (err) {
          console.error("Eroare la procesarea datei de început:", err, updateData.startDate);
          return res.status(400).json({ 
            message: "Format invalid pentru data de început", 
            details: String(err) 
          });
        }
      }
      
      if (updateData.endDate) {
        try {
          // Convertim la obiect Date dacă este string
          updateData.endDate = new Date(updateData.endDate);
          
          // Verificăm dacă data rezultată este validă
          if (isNaN(updateData.endDate.getTime())) {
            throw new Error("Data de sfârșit invalidă");
          }
        } catch (err) {
          console.error("Eroare la procesarea datei de sfârșit:", err, updateData.endDate);
          return res.status(400).json({ 
            message: "Format invalid pentru data de sfârșit", 
            details: String(err) 
          });
        }
      }
      
      // Afișăm datele pentru debug
      console.log("Date de actualizat:", JSON.stringify(updateData, (key, value) => {
        // Tratăm special obiectele Date pentru a le afișa corect în log
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      }, 2));
      
      const updatedPilgrimage = await storage.updatePilgrimage(id, updateData);
      res.json(updatedPilgrimage);
    } catch (error) {
      console.error("Eroare la actualizarea pelerinajului:", error);
      res.status(500).json({ 
        message: "Eroare la actualizarea pelerinajului", 
        details: error.message 
      });
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

  // Endpoint pentru a marca un pelerinaj ca "featured" (recomandat)
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
  
  // Endpoint pentru a promova un pelerinaj (poziție superioară în listă)
  app.put("/api/pilgrimages/:id/promote", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(id);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      // În această etapă, folosim doar câmpul "featured" pentru a simula promovarea,
      // până când schema bazei de date va fi actualizată
      const updatedPilgrimage = await storage.updatePilgrimage(id, { 
        featured: true
      });
      
      res.json(updatedPilgrimage);
    } catch (error) {
      res.status(500).json({ message: "Eroare la promovarea pelerinajului" });
    }
  });

  // Rute pentru gestionarea pelerinajelor de către organizatori
  
  // Obținerea pelerinajelor organizatorului curent
  app.get("/api/organizer/pilgrimages", isOrganizer, async (req, res) => {
    try {
      // Obținem toate pelerinajele organizatorului autentificat
      const pilgrimages = await storage.getPilgrimages({ organizerId: req.user?.id });
      
      // Asigurăm că datele pentru fiecare pelerinaj sunt formatate corect
      const formattedPilgrimages = pilgrimages.map(pilgrimage => {
        return {
          ...pilgrimage,
          // Convertim explicit câmpurile de date pentru a ne asigura că sunt formatate corect
          startDate: pilgrimage.startDate instanceof Date ? pilgrimage.startDate : new Date(pilgrimage.startDate),
          endDate: pilgrimage.endDate instanceof Date ? pilgrimage.endDate : new Date(pilgrimage.endDate),
          // Asigurăm că valorile booleene sunt definite
          featured: pilgrimage.featured === null ? false : pilgrimage.featured,
          verified: pilgrimage.verified === null ? false : pilgrimage.verified,
          promoted: pilgrimage.promoted === null ? false : pilgrimage.promoted
        };
      });
      
      res.json(formattedPilgrimages);
    } catch (error) {
      console.error("Error fetching organizer pilgrimages:", error);
      res.status(500).json({ message: "Eroare la preluarea pelerinajelor", error: String(error) });
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
      
      // Actualizăm pelerinajul la verificat (publicat)
      const updatedPilgrimage = await storage.updatePilgrimage(pilgrimageId, { 
        verified: true
      });
      
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
      
      // Actualizăm pelerinajul la neverificat (nepublicat)
      const updatedPilgrimage = await storage.updatePilgrimage(pilgrimageId, { 
        verified: false
      });
      
      res.json(updatedPilgrimage);
    } catch (error) {
      console.error("Error unpublishing pilgrimage:", error);
      res.status(500).json({ message: "Eroare la depublicarea pelerinajului" });
    }
  });
  
  // Marcarea unui pelerinaj ca draft
  app.post("/api/organizer/pilgrimages/:id/draft", isOrganizer, async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(pilgrimageId);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      // Verificăm dacă pelerinajul aparține organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu aveți permisiunea de a modifica acest pelerinaj" });
      }
      
      // Actualizăm pelerinajul ca neverificat
      const updatedPilgrimage = await storage.updatePilgrimage(pilgrimageId, { 
        verified: false
      });
      
      res.json(updatedPilgrimage);
    } catch (error) {
      console.error("Error marking pilgrimage as draft:", error);
      res.status(500).json({ message: "Eroare la marcarea pelerinajului ca draft" });
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
  
  // Endpoint pentru promovarea unui pelerinaj
  app.post("/api/pilgrimage/:id/promote", isOrganizer, async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      const { promotionLevel, durationDays } = req.body;
      
      if (!promotionLevel || !durationDays) {
        return res.status(400).json({ message: "Lipsesc datele necesare promovării" });
      }
      
      // Validăm nivelul de promovare
      if (!['basic', 'premium', 'exclusive'].includes(promotionLevel)) {
        return res.status(400).json({ message: "Nivel de promovare invalid" });
      }
      
      // Validăm durata promovării (minimum 1 zi, maximum 90 zile)
      const duration = parseInt(durationDays);
      if (isNaN(duration) || duration < 1 || duration > 90) {
        return res.status(400).json({ message: "Durata promovării trebuie să fie între 1 și 90 de zile" });
      }
      
      // Verifică dacă pelerinajul există
      const pilgrimage = await storage.getPilgrimage(pilgrimageId);
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      // Verificăm dacă pelerinajul aparține organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu aveți permisiunea de a promova acest pelerinaj" });
      }
      
      // Verificăm dacă pelerinajul este verificat
      if (!pilgrimage.verified) {
        return res.status(400).json({ message: "Doar pelerinajele verificate pot fi promovate" });
      }
      
      // Calculăm data de expirare a promovării
      const promotionStartedAt = new Date();
      const promotionExpiry = new Date();
      promotionExpiry.setDate(promotionExpiry.getDate() + duration);
      
      // Calculăm prețul promovării (vom implementa sistemul de plată mai târziu)
      const pricePerDay = {
        'basic': 5,
        'premium': 10,
        'exclusive': 15
      };
      
      const totalPrice = pricePerDay[promotionLevel] * duration;
      
      // Actualizăm pelerinajul cu informațiile de promovare
      const updatedPilgrimage = await storage.updatePilgrimage(pilgrimageId, {
        promoted: true,
        promotionLevel,
        promotionStartedAt,
        promotionExpiry
      });
      
      // Aici ar fi implementată integrarea cu sistemul de plată
      // Pentru moment, doar returnăm pelerinajul actualizat
      
      res.json({
        success: true,
        message: `Pelerinajul a fost promovat cu succes pentru ${duration} zile`,
        pilgrimage: updatedPilgrimage,
        promotionDetails: {
          level: promotionLevel,
          startDate: promotionStartedAt,
          endDate: promotionExpiry,
          durationDays: duration,
          totalPrice: totalPrice,
          currency: 'EUR'
        }
      });
    } catch (error) {
      console.error("Error promoting pilgrimage:", error);
      res.status(500).json({ message: "Eroare la promovarea pelerinajului" });
    }
  });
  
  // Endpoint pentru anularea promovării unui pelerinaj
  app.post("/api/pilgrimage/:id/cancel-promotion", isOrganizer, async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      
      // Verifică dacă pelerinajul există
      const pilgrimage = await storage.getPilgrimage(pilgrimageId);
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost găsit" });
      }
      
      // Verificăm dacă pelerinajul aparține organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu aveți permisiunea de a gestiona acest pelerinaj" });
      }
      
      // Verificăm dacă pelerinajul este promovat
      if (!pilgrimage.promoted) {
        return res.status(400).json({ message: "Acest pelerinaj nu este promovat în prezent" });
      }
      
      // Actualizăm pelerinajul pentru a anula promovarea
      const updatedPilgrimage = await storage.updatePilgrimage(pilgrimageId, {
        promoted: false,
        promotionLevel: 'none',
        promotionStartedAt: null,
        promotionExpiry: null
      });
      
      res.json({
        success: true,
        message: "Promovarea pelerinajului a fost anulată",
        pilgrimage: updatedPilgrimage
      });
    } catch (error) {
      console.error("Error cancelling promotion:", error);
      res.status(500).json({ message: "Eroare la anularea promovării pelerinajului" });
    }
  });

  // Image upload route
  app.post('/api/upload-image', isAuthenticated, upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nicio imagine încărcată" });
      }
      
      // Constructia URL-ului imaginii
      const imageUrl = `/static/images/pilgrimages/${req.file.filename}`;
      
      res.status(200).json({ 
        success: true, 
        imageUrl: imageUrl,
        message: "Imaginea a fost încărcată cu succes" 
      });
    } catch (error) {
      console.error("Eroare la încărcarea imaginii:", error);
      res.status(500).json({ message: "Eroare la încărcarea imaginii" });
    }
  });
  
  // CMS routes
  app.get("/api/cms", async (req, res) => {
    try {
      // Dezactivăm cache-ul pentru toate răspunsurile API CMS
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      try {
        const content = await storage.getCmsContent();
        res.json(content);
      } catch (dbError) {
        console.error("Database error fetching CMS content:", dbError);
        // Răspundem cu un array gol în loc să returnam eroare
        // pentru a preveni blocarea interfeței utilizatorului
        res.json([]);
      }
    } catch (error) {
      console.error("General error in CMS route:", error);
      res.status(500).json({ message: "Eroare la preluarea conținutului CMS" });
    }
  });

  // Endpoint pentru încărcarea imaginilor pentru CMS
  app.post("/api/cms/upload", cmsUpload.single('image'), async (req, res) => {
    try {
      // Verificăm autentificarea (permitem cereri fără autentificare în modurile de dezvoltare)
      if (process.env.NODE_ENV === 'production' && (!req.isAuthenticated() || req.user?.role !== 'admin')) {
        return res.status(403).json({ message: "Acces interzis. Este necesar rol de administrator." });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "Nu a fost furnizat niciun fișier" });
      }
      
      // Returnăm calea relativă către imagine
      const imagePath = `/uploads/${req.file.filename}`;
      
      console.log(`Imagine CMS încărcată cu succes: ${imagePath}`);
      
      res.status(201).json({ 
        url: imagePath,
        message: "Imagine încărcată cu succes" 
      });
    } catch (error) {
      console.error("Eroare la încărcarea imaginii:", error);
      res.status(500).json({ message: "Eroare la încărcarea imaginii" });
    }
  });
  
  // Endpoint pentru listarea bannerelor din homepage
  app.get("/api/cms/banners", async (req, res) => {
    try {
      // Dezactivăm cache-ul pentru a asigura actualizarea corectă a bannerelor
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const allContent = await storage.getCmsContent() as any[];
      if (!Array.isArray(allContent)) {
        return res.json([]);
      }
      
      // Filtrăm conținutul pentru a obține doar bannerele
      const banners = allContent.filter(item => 
        item.key.startsWith('homepage_banner_') && 
        item.contentType === 'image'
      );
      
      const sortedBanners = banners.sort((a, b) => {
        // Extrage numărul din cheia banner-ului (ex: homepage_banner_1 -> 1)
        const aNumber = parseInt(a.key.split('_').pop() || '0');
        const bNumber = parseInt(b.key.split('_').pop() || '0');
        return aNumber - bNumber;
      });
      
      // Adăugăm informații mai detaliate despre bannere
      const enhancedBanners = sortedBanners.map(banner => {
        return {
          ...banner,
          title: banner.description || `Banner ${banner.id}`,
          subtitle: `Banner #${banner.id}`,
          linkUrl: "/pilgrimages"
        };
      });
      
      res.json(enhancedBanners);
    } catch (error) {
      console.error("Eroare la obținerea listei de bannere:", error);
      res.status(500).json({ message: "Eroare la obținerea listei de bannere" });
    }
  });
  
  app.get("/api/cms/:key", async (req, res) => {
    try {
      // Dezactivăm cache-ul pentru toate răspunsurile API CMS
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const key = req.params.key;
      
      try {
        const content = await storage.getCmsContent(key);
        
        if (!content) {
          return res.status(404).json({ 
            message: "Conținutul CMS nu a fost găsit",
            key: key,
            // Adăugăm o valoare înștiințare pentru a ajuta la debugging
            suggestionForUI: "Not found"
          });
        }
        
        res.json(content);
      } catch (dbError) {
        console.error(`Database error fetching CMS content for key=${key}:`, dbError);
        return res.status(404).json({ 
          message: "Eroare la accesarea conținutului CMS",
          key: key,
          // Adăugăm o valoare sugestie pentru UI să afișeze fallback
          suggestionForUI: "Database error"
        });
      }
    } catch (error) {
      console.error("Error in CMS key route:", error);
      res.status(500).json({ message: "Eroare la preluarea conținutului CMS" });
    }
  });

  // Rută specială pentru inițializarea conținutului CMS (batch)
  // Nu necesită autentificare pentru moment (unsafe, dar funcțional pentru dezvoltare)
  app.post("/api/cms/initialize", async (req, res) => {
    try {
      // Adăugăm log pentru a vedea dacă ruta este accesată
      console.log("CMS Initialize route accessed", {
        bodyLength: req.body?.length,
        userAuthenticated: req.isAuthenticated?.() || false,
        userRole: req.user?.role || 'none'
      });
      
      const results = [];
      let createdCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      // Verificăm dacă req.body este un array
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ 
          message: "Format invalid. Se așteaptă un array de elemente CMS.",
          received: typeof req.body
        });
      }
      
      // Procesăm fiecare element din array
      for (const item of req.body) {
        if (!item.key || !item.contentType || !item.value) {
          results.push({ 
            key: item.key || 'unknown', 
            status: 'error', 
            message: 'Lipsesc proprietăți obligatorii (key, contentType, value)' 
          });
          errorCount++;
          continue;
        }
        
        try {
          // Verificăm dacă elementul există deja
          const existing = await storage.getCmsContent(item.key);
          if (!existing) {
            // Creăm un element nou
            const cmsItem = await storage.createCmsContent(item);
            results.push({ key: item.key, status: 'created' });
            createdCount++;
            console.log(`Created CMS item: ${item.key}`);
          } else {
            // Actualizăm elementul existent
            const updatedCmsItem = await storage.updateCmsContent(item.key, {
              value: item.value,
              contentType: item.contentType || existing.contentType
            });
            
            if (updatedCmsItem) {
              results.push({ key: item.key, status: 'updated' });
              createdCount++; // Considerăm și actualizarea ca o creare pentru statistici
              console.log(`Updated CMS item: ${item.key}`);
            } else {
              results.push({ key: item.key, status: 'update_failed' });
              errorCount++;
              console.error(`Failed to update CMS item: ${item.key}`);
            }
          }
        } catch (error) {
          console.error(`Error processing ${item.key}:`, error);
          results.push({ key: item.key, status: 'error', message: String(error) });
          errorCount++;
        }
      }
      
      // Adăugăm log pentru rezultatul final
      console.log("CMS initialization complete", {
        created: createdCount,
        skipped: skippedCount,
        errors: errorCount
      });
      
      res.status(201).json({
        message: "Conținut CMS inițializat",
        stats: {
          total: req.body.length,
          created: createdCount,
          skipped: skippedCount,
          errors: errorCount
        },
        results
      });
    } catch (error) {
      console.error("Error initializing CMS content:", error);
      res.status(500).json({ message: "Eroare la inițializarea conținutului CMS", error: String(error) });
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
  
  // Endpoint pentru statisticile organizatorilor - Numai pentru administratori
  app.get("/api/admin/organizer-stats", isAdmin, async (req, res) => {
    try {
      // Obținem toți utilizatorii care sunt organizatori
      const users = await storage.getAllUsers();
      const organizers = users.filter(user => 
        user.role === "operator" || user.role === "monastery"
      );
      
      // Pentru fiecare organizator, compilăm statisticile
      const organizerStats = await Promise.all(organizers.map(async (organizer) => {
        try {
          // Obținem toate pelerinajele organizatorului
          const pilgrimages = await storage.getPilgrimages({ organizerId: organizer.id });
          
          // Inițializăm valorile statisticilor
          let totalBookings = 0;
          let totalRevenue = 0;
          let totalRatings = 0;
          let ratingCount = 0;
          
          // Stabilim data ultimei activități
          // Folosim metoda sigură pentru a evita probleme cu null/undefined
          let lastActivity = new Date(); // Valoare implicită - data curentă
          if (organizer.lastLogin) {
            lastActivity = new Date(organizer.lastLogin);
          } else if (organizer.createdAt) {
            lastActivity = new Date(organizer.createdAt);
          }
          
          // Numărăm pelerinajele promovate - cu verificare dacă proprietatea există
          const promotedPilgrimages = pilgrimages.filter(p => p.promoted === true);
          
          // Procesăm fiecare pelerinaj pentru a calcula statisticile
          for (const pilgrimage of pilgrimages) {
            try {
              // Obținem rezervările pentru acest pelerinaj
              const bookings = await storage.getBookingsByPilgrimageId(pilgrimage.id);
              
              // Obținem recenziile pentru acest pelerinaj
              const reviews = await storage.getReviews(pilgrimage.id);
              
              // Actualizăm statisticile
              totalBookings += bookings.length;
              
              // Calcularea veniturilor cu verificare de siguranță
              totalRevenue += bookings.reduce((sum, b) => {
                return sum + (typeof b.totalPrice === 'number' ? b.totalPrice : 0);
              }, 0);
              
              // Calculăm rating-ul mediu
              if (reviews && reviews.length > 0) {
                totalRatings += reviews.reduce((sum, r) => {
                  return sum + (typeof r.rating === 'number' ? r.rating : 0);
                }, 0);
                ratingCount += reviews.length;
              }
              
              // Actualizăm ultima activitate cu verificări suplimentare
              if (pilgrimage.updatedAt) {
                const updatedDate = new Date(pilgrimage.updatedAt);
                if (updatedDate instanceof Date && !isNaN(updatedDate.getTime()) && 
                    updatedDate > lastActivity) {
                  lastActivity = updatedDate;
                }
              }
            } catch (error) {
              console.error(`Error processing pilgrimage ${pilgrimage.id}:`, error);
              // Continuăm cu următorul pelerinaj în caz de eroare
              continue;
            }
          }
          
          // Calculăm rating-ul mediu cu verificare împotriva diviziunii cu zero
          const averageRating = ratingCount > 0 ? (totalRatings / ratingCount) : 0;
          
          // Returnăm statisticile pentru acest organizator
          return {
            id: organizer.id,
            username: organizer.username || "N/A",
            email: organizer.email || "N/A",
            firstName: organizer.firstName || "",
            lastName: organizer.lastName || "",
            pilgrimagesCount: pilgrimages.length,
            promotedPilgrimagesCount: promotedPilgrimages.length,
            totalBookings,
            totalRevenue,
            averageRating,
            lastActivity: lastActivity.toISOString(),
            profileImage: organizer.profileImage || null
          };
        } catch (error) {
          console.error(`Error processing organizer ${organizer.id}:`, error);
          // Returnăm date minime în caz de eroare pentru un organizator
          return {
            id: organizer.id,
            username: organizer.username || "N/A",
            email: organizer.email || "N/A",
            firstName: organizer.firstName || "",
            lastName: organizer.lastName || "",
            pilgrimagesCount: 0,
            promotedPilgrimagesCount: 0,
            totalBookings: 0,
            totalRevenue: 0,
            averageRating: 0,
            lastActivity: new Date().toISOString(),
            profileImage: null
          };
        }
      }));
      
      // Filtram rezultatele NULL si sortăm după numărul de rezervări (descrescător)
      const validStats = organizerStats.filter(stat => stat !== null);
      validStats.sort((a, b) => b.totalBookings - a.totalBookings);
      
      res.json(validStats);
    } catch (error) {
      console.error("Error fetching organizer stats:", error);
      res.status(500).json({ 
        message: "Eroare la obținerea statisticilor organizatorilor",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
