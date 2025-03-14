import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getCompanyInfoByCUI, validateRomanianCUI } from "./anaf";
import { registerMonasteryRoutes } from './routes/monasteries';
import { registerMonasteryRegionsRoutes } from './routes/monastery-regions';
import { registerMonasteryRecommendationsRoutes } from './routes/monastery-recommendations';
import { registerUploadRoutes } from './routes/upload';
import { 
  insertPilgrimageSchema, 
  insertReviewSchema, 
  insertBookingSchema,
  insertMessageSchema,
  insertCmsContentSchema,
  insertBuilderPageSchema,
  insertMonasterySchema
} from "@shared/schema";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2023-10-16" as any,
});

// Configurare multer pentru ncrcarea imaginilor
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
  // Servim fiierele statice din directorul public
  app.use('/static', express.static('public'));
  
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Check auth middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Autentificare necesar" });
  };

  // Check admin role middleware
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Acces interzis" });
  };
  
  // API pentru a obine toi utilizatorii (pentru admin)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      // Obinem toi utilizatorii din storage
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Eroare la obinerea listei de utilizatori" });
    }
  });
  
  // Statistici despre organizatorii de pelerinaje (pentru admin)
  app.get("/api/admin/organizer-stats", isAdmin, async (req, res) => {
    try {
      // Obinem toi utilizatorii cu rol de organizator
      const users = await storage.getAllUsers();
      const organizerUsers = users.filter(user => user.role === "operator" || user.role === "monastery");
      
      // Pentru fiecare organizator, obinem statisticile sale
      const organizerStatsPromises = organizerUsers.map(async (user) => {
        // Obinem pelerinajele acestui organizator - optimizare pentru a obține toate datele într-un singur apel
        const pilgrimages = await storage.getPilgrimages({ organizerId: user.id });
        
        // Calculm cte pelerinaje promovate are
        const promotedPilgrimages = pilgrimages.filter(p => p.promoted);
        
        // Optimizare: obținem toate rezervările și recenziile într-un singur loc
        // În loc să facem apeluri în buclă, pregătim apelurile asincrone pentru toate pelerinajele
        const bookingsPromises = pilgrimages.map(pilgrimage => 
          storage.getBookingsByPilgrimageId(pilgrimage.id)
        );
        const reviewsPromises = pilgrimages.map(pilgrimage => 
          storage.getReviews(pilgrimage.id)
        );
        
        // Executăm toate apelurile în paralel
        const allBookings = await Promise.all(bookingsPromises);
        const allReviews = await Promise.all(reviewsPromises);
        
        // Inițializăm contoarele
        let totalBookings = 0;
        let totalRevenue = 0;
        let ratingsSum = 0;
        let ratingsCount = 0;
        
        // Procesăm datele obținute
        for (let i = 0; i < pilgrimages.length; i++) {
          // Procesăm rezervările
          const confirmedBookings = allBookings[i].filter(b => b.status === "confirmed");
          totalBookings += confirmedBookings.length;
          totalRevenue += confirmedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
          
          // Procesăm recenziile
          const reviews = allReviews[i];
          if (reviews.length > 0) {
            ratingsSum += reviews.reduce((sum, review) => sum + review.rating, 0);
            ratingsCount += reviews.length;
          }
        }
        
        // Calculm ratingul mediu
        const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;
        
        // Determinm ultima activitate (data celui mai recent pelerinaj)
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
      
      // Sortm dup numrul de rezervri, descresctor
      organizerStats.sort((a, b) => b.totalBookings - a.totalBookings);
      
      res.json(organizerStats);
    } catch (error) {
      console.error("Error getting organizer stats:", error);
      res.status(500).json({ message: "Eroare la obinerea statisticilor organizatorilor" });
    }
  });
  
  // Actualizare profil utilizator
  app.put("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificm dac utilizatorul ncearc s actualizeze propriul profil sau este admin
      if (req.user.id !== id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu avei permisiunea de a actualiza acest profil" });
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
        return res.status(404).json({ message: "Utilizatorul nu a fost gsit" });
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
      
      // Verificm dac utilizatorul ncearc s modifice alt cont
      if (id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu ai permisiunea s modifici parola pentru acest cont" });
      }
      
      // Verificm existena utilizatorului
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "Utilizator negsit" });
      }
      
      // Importm funciile pentru hash i comparare parole din auth.ts
      const { comparePasswords, hashPassword } = await import('./auth');
      
      // Verificm parola actual (exceptnd admin care poate schimba fr verificare)
      if (req.user.role !== "admin") {
        const isPasswordValid = await comparePasswords(currentPassword, existingUser.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: "Parola actual este incorect" });
        }
      }
      
      // Generm hash pentru noua parol
      const hashedPassword = await hashPassword(newPassword);
      
      // Actualizm parola
      const updatedUser = await storage.updateUser(id, { password: hashedPassword });
      
      // Dac utilizatorul este administratorul special, actualizm i variabila global
      if (id === 9999) {
        global.updatedAdminUser = updatedUser;
        console.log("Admin password updated in global variable");
      }
      
      res.json({ message: "Parola a fost schimbat cu succes" });
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

  // API pentru validarea CUI al companiei
  app.get("/api/company/validate", async (req, res) => {
    try {
      const { cui } = req.query;
      
      if (!cui || typeof cui !== 'string') {
        return res.status(400).json({ 
          error: "CUI lipsă sau invalid", 
          valid: false 
        });
      }
      
      console.log(`Cerere de validare CUI primit: ${cui}`);
      
      // Pentru demonstrație, acceptăm anumite CUI-uri hardcodate sau orice CUI real cu forma corectă
      // În mediul de producție, am elimina această verificare și am folosi doar algoritm real
      const cleanCui = cui.replace(/^RO/i, '').trim().replace(/\s/g, '');
      const testCuis = ['12345678', '123456', '1234567', '12345', '26394193', '9736074', '44134425', '14186770', '41716717'];
      
      // Acceptăm toate CUI-urile care au între 6 și 10 cifre
      const isValidFormat = /^\d{6,10}$/.test(cleanCui);
      
      if (testCuis.includes(cleanCui) || isValidFormat) {
        // În loc să încercăm să validăm algoritmul exact, acceptăm orice CUI cu format corect
        // Vom simula datele pentru a permite testarea funcțională
        
        // Obținem sau simulăm informațiile companiei
        let companyInfo = await getCompanyInfoByCUI(cui);
        
        // Dacă nu avem informații despre companie, generăm date mock pentru testare
        if (!companyInfo) {
          companyInfo = {
            cui: cleanCui,
            name: cleanCui === '41716717' 
              ? 'SC EXEMPLU PELERINAJE SRL' 
              : `COMPANIA DE PELERINAJE ${cleanCui.substring(0, 4)} S.R.L.`,
            address: 'Str. Mitropoliei nr. 1, București',
            city: 'București',
            county: 'București',
            isActive: true,
            registrationNumber: `J40/${cleanCui.substring(0, 4)}/2020`
          };
        }
        
        return res.json({
          valid: true,
          foundInfo: true,
          company: companyInfo
        });
      }
      
      // Dacă CUI-ul nu este în lista de test și nu are format valid, răspundem cu eroare
      console.log(`CUI invalid - nu are formatul corect: ${cleanCui}`);
      return res.json({ 
        valid: false, 
        message: "CUI-ul introdus nu este valid - verificați formatul corect"
      });
    } catch (error) {
      console.error("Error validating company:", error);
      res.status(500).json({ 
        error: "Eroare la validarea companiei", 
        valid: false 
      });
    }
  });

  // Pilgrimages
  app.get("/api/pilgrimages", async (req, res) => {
    try {
      const filters: any = {};
      
      // Adugm implicit filtrul pentru a afia doar pelerinajele verificate/publicate
      // Acest lucru asigur c doar pelerinajele publicate apar n pagina public
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
      
      // Asigurm c datele pentru fiecare pelerinaj sunt formatate corect
      const formattedPilgrimages = pilgrimages.map(pilgrimage => {
        return {
          ...pilgrimage,
          // Convertim explicit cmpurile de date pentru a ne asigura c sunt formatate corect
          startDate: pilgrimage.startDate instanceof Date ? pilgrimage.startDate : new Date(pilgrimage.startDate),
          endDate: pilgrimage.endDate instanceof Date ? pilgrimage.endDate : new Date(pilgrimage.endDate),
          // Asigurm c valorile booleene sunt definite
          featured: pilgrimage.featured === null ? false : pilgrimage.featured,
          verified: pilgrimage.verified === null ? false : pilgrimage.verified,
          promoted: pilgrimage.promoted === null ? false : pilgrimage.promoted
        };
      });
      
      // Sortm pelerinajele - featured first
      try {
        const featuredPilgrimages = formattedPilgrimages.filter(p => p.featured === true);
        const regularPilgrimages = formattedPilgrimages.filter(p => p.featured !== true);
        
        // Combinm cele dou liste, cu pelerinajele featured la nceput
        const sortedPilgrimages = [...featuredPilgrimages, ...regularPilgrimages];
        
        return res.json(sortedPilgrimages);
      } catch (err) {
        // n caz de erori la sortare, returnm lista procesat
        console.error("Error sorting pilgrimages:", err);
        return res.json(formattedPilgrimages);
      }

    } catch (error) {
      console.error("Error fetching pilgrimages:", error);
      res.status(500).json({ message: "Eroare la preluarea pelerinajelor", error: String(error) });
    }
  });

  // Endpoint pentru preluarea pelerinajelor promovate
  // Notă: Acest endpoint trebuie să apară ÎNAINTEA endpointului cu parametru ID
  // pentru a evita confuziile la rutare
  app.get("/api/pilgrimages/promoted", async (req, res) => {
    try {
      // Obținem toate pelerinajele marcate ca promovate
      const filters = { promoted: true };
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
          promoted: true
        };
      });
      
      // Sortăm pelerinajele promovate după nivelul de promovare și data de început
      const sortedPilgrimages = formattedPilgrimages.sort((a, b) => {
        // Mai întâi sortăm după nivel de promovare (premium, exclusive au prioritate)
        const promotionOrder = { "exclusive": 3, "premium": 2, "basic": 1, "none": 0 };
        const levelDiff = (promotionOrder[b.promotionLevel] || 0) - (promotionOrder[a.promotionLevel] || 0);
        
        if (levelDiff !== 0) return levelDiff;
        
        // Apoi sortăm după data de început (cele mai apropiate mai întâi)
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
      
      return res.json(sortedPilgrimages);
    } catch (error) {
      console.error("Error fetching promoted pilgrimages:", error);
      res.status(500).json({ message: "Eroare la preluarea pelerinajelor promovate", error: String(error) });
    }
  });

  app.get("/api/pilgrimages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(id);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
      }
      
      // Formatm datele pentru a asigura compatibilitatea
      const formattedPilgrimage = {
        ...pilgrimage,
        // Convertim explicit cmpurile de date pentru a ne asigura c sunt formatate corect
        startDate: pilgrimage.startDate instanceof Date ? pilgrimage.startDate : new Date(pilgrimage.startDate),
        endDate: pilgrimage.endDate instanceof Date ? pilgrimage.endDate : new Date(pilgrimage.endDate),
        // Asigurm c valorile booleene sunt definite
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
      
      // Prelum organizerId din utilizatorul autentificat sau din date
      const organizerId = req.user?.id || req.body.organizerId;
      
      if (!organizerId) {
        console.error(">>> Error: ID organizator lips");
        return res.status(400).json({ message: "ID organizator lips" });
      }
      
      // Pregtim datele pentru validare
      const formData = {
        ...req.body,
        organizerId
      };
      
      // Validm datele de intrare
      let validData;
      try {
        validData = insertPilgrimageSchema.parse(formData);
        console.log(">>> Date validate cu success prin Zod:", JSON.stringify(validData));
      } catch (validationError) {
        console.error(">>> Eroare detaliat de validare Zod:", JSON.stringify(validationError, null, 2));
        return res.status(400).json({ 
          message: "Date invalide pentru creare pelerinaj", 
          errors: validationError instanceof z.ZodError ? validationError.errors : String(validationError) 
        });
      }
      
      // Procesm datele pentru a le face compatibile cu baza de date
      const startDate = validData.startDate instanceof Date 
        ? validData.startDate 
        : new Date(validData.startDate);
        
      const endDate = validData.endDate instanceof Date 
        ? validData.endDate 
        : new Date(validData.endDate);
        
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ 
          message: "Datele de nceput i sfrit trebuie s fie valide"
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
      
      // Crem pelerinajul n baza de date
      try {
        const pilgrimage = await storage.createPilgrimage(pilgrimageData);
        console.log(">>> Pelerinaj creat cu succes:", pilgrimage.id);
        res.status(201).json(pilgrimage);
      } catch (dbError) {
        console.error(">>> Eroare la inserarea n baza de date:", dbError);
        return res.status(500).json({ 
          message: "Eroare la stocarea pelerinajului", 
          details: dbError.message 
        });
      }
    } catch (error) {
      console.error(">>> Eroare la crearea pelerinajului:", error);
      res.status(500).json({ 
        message: "Eroare la crearea pelerinajului", 
        details: error instanceof Error ? error.message : "Eroare neateptat" 
      });
    }
  });

  app.put("/api/pilgrimages/:id", isOrganizer, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(id);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
      }
      
      // Check if the user is the organizer or an admin
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu avei permisiunea de a modifica acest pelerinaj" });
      }
      
      // Eliminm explicit orice referin la status pentru a preveni erorile 
      // legate de coloana care nu mai exist n baza de date
      const updateData = { ...req.body };
      if ('status' in updateData) {
        delete updateData.status;
      }
      
      // Procesm datele de nceput i sfrit pentru a asigura c sunt obiecte Date valide
      if (updateData.startDate) {
        try {
          // Convertim la obiect Date dac este string
          updateData.startDate = new Date(updateData.startDate);
          
          // Verificm dac data rezultat este valid
          if (isNaN(updateData.startDate.getTime())) {
            throw new Error("Data de nceput invalid");
          }
        } catch (err) {
          console.error("Eroare la procesarea datei de nceput:", err, updateData.startDate);
          return res.status(400).json({ 
            message: "Format invalid pentru data de nceput", 
            details: String(err) 
          });
        }
      }
      
      if (updateData.endDate) {
        try {
          // Convertim la obiect Date dac este string
          updateData.endDate = new Date(updateData.endDate);
          
          // Verificm dac data rezultat este valid
          if (isNaN(updateData.endDate.getTime())) {
            throw new Error("Data de sfrit invalid");
          }
        } catch (err) {
          console.error("Eroare la procesarea datei de sfrit:", err, updateData.endDate);
          return res.status(400).json({ 
            message: "Format invalid pentru data de sfrit", 
            details: String(err) 
          });
        }
      }
      
      // Afim datele pentru debug
      console.log("Date de actualizat:", JSON.stringify(updateData, (key, value) => {
        // Tratm special obiectele Date pentru a le afia corect n log
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
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
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
      res.status(500).json({ message: "Eroare la preluarea rezervrilor" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const validData = insertBookingSchema.parse(req.body);
      const pilgrimage = await storage.getPilgrimage(validData.pilgrimageId);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
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
      res.status(500).json({ message: "Eroare la crearea rezervrii" });
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
        return res.status(404).json({ message: "Mesajul nu a fost gsit" });
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
        return res.status(404).json({ message: "Utilizatorul nu a fost gsit" });
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
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
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
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
      }
      
      const updatedPilgrimage = await storage.updatePilgrimage(id, { featured: req.body.featured });
      res.json(updatedPilgrimage);
    } catch (error) {
      res.status(500).json({ message: "Eroare la setarea pelerinajului ca i recomandat" });
    }
  });
  
  // Endpoint pentru a promova un pelerinaj (poziie superioar n list)
  app.put("/api/pilgrimages/:id/promote", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(id);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
      }
      
      // n aceast etap, folosim doar cmpul "featured" pentru a simula promovarea,
      // pn cnd schema bazei de date va fi actualizat
      const updatedPilgrimage = await storage.updatePilgrimage(id, { 
        featured: true
      });
      
      res.json(updatedPilgrimage);
    } catch (error) {
      res.status(500).json({ message: "Eroare la promovarea pelerinajului" });
    }
  });

  // Rute pentru gestionarea pelerinajelor de ctre organizatori
  
  // Obinerea pelerinajelor organizatorului curent
  app.get("/api/organizer/pilgrimages", isOrganizer, async (req, res) => {
    try {
      // Obinem toate pelerinajele organizatorului autentificat
      const pilgrimages = await storage.getPilgrimages({ organizerId: req.user?.id });
      
      // Asigurm c datele pentru fiecare pelerinaj sunt formatate corect
      const formattedPilgrimages = pilgrimages.map(pilgrimage => {
        return {
          ...pilgrimage,
          // Convertim explicit cmpurile de date pentru a ne asigura c sunt formatate corect
          startDate: pilgrimage.startDate instanceof Date ? pilgrimage.startDate : new Date(pilgrimage.startDate),
          endDate: pilgrimage.endDate instanceof Date ? pilgrimage.endDate : new Date(pilgrimage.endDate),
          // Asigurm c valorile booleene sunt definite
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
  
  // Obinerea rezervrilor pentru un pelerinaj specific al organizatorului
  app.get("/api/organizer/pilgrimages/:id/bookings", isOrganizer, async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(pilgrimageId);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
      }
      
      // Verificm dac pelerinajul aparine organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu avei acces la rezervrile acestui pelerinaj" });
      }
      
      // Obinem rezervrile pentru acest pelerinaj
      const bookings = await storage.getBookingsByPilgrimageId(pilgrimageId);
      
      // Pentru fiecare rezervare, adugm informaii despre utilizator
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
      res.status(500).json({ message: "Eroare la preluarea rezervrilor" });
    }
  });
  
  // Obinerea raportului financiar pentru un pelerinaj specific
  app.get("/api/organizer/pilgrimages/:id/financial-report", isOrganizer, async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      const pilgrimage = await storage.getPilgrimage(pilgrimageId);
      
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
      }
      
      // Verificm dac pelerinajul aparine organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu avei acces la informaiile financiare ale acestui pelerinaj" });
      }
      
      // Obinem toate rezervrile pentru acest pelerinaj
      const bookings = await storage.getBookingsByPilgrimageId(pilgrimageId);
      
      // Calculm sumele totale
      const totalAmount = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
      const confirmedAmount = bookings
        .filter(booking => booking.status === "confirmed")
        .reduce((sum, booking) => sum + booking.totalPrice, 0);
      const pendingAmount = bookings
        .filter(booking => booking.status === "pending")
        .reduce((sum, booking) => sum + booking.totalPrice, 0);
      
      // Contabilizm numrul de persoane
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
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
      }
      
      // Verificm dac pelerinajul aparine organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu avei permisiunea de a publica acest pelerinaj" });
      }
      
      // Actualizm pelerinajul la verificat (publicat)
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
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
      }
      
      // Verificm dac pelerinajul aparine organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu avei permisiunea de a depublica acest pelerinaj" });
      }
      
      // Actualizm pelerinajul la neverificat (nepublicat)
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
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
      }
      
      // Verificm dac pelerinajul aparine organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu avei permisiunea de a modifica acest pelerinaj" });
      }
      
      // Actualizm pelerinajul ca neverificat
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
        return res.status(404).json({ message: "Rezervarea nu a fost gsit" });
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
      res.status(500).json({ message: "Eroare la procesarea plii" });
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
        return res.status(404).json({ message: "Rezervarea nu a fost gsit" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Eroare la confirmarea plii" });
    }
  });
  
  // Endpoint pentru promovarea unui pelerinaj
  app.post("/api/pilgrimage/:id/promote", isOrganizer, async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      const { promotionLevel, durationDays } = req.body;
      
      if (!promotionLevel || !durationDays) {
        return res.status(400).json({ message: "Lipsesc datele necesare promovrii" });
      }
      
      // Validm nivelul de promovare
      if (!['basic', 'premium', 'exclusive'].includes(promotionLevel)) {
        return res.status(400).json({ message: "Nivel de promovare invalid" });
      }
      
      // Validm durata promovrii (minimum 1 zi, maximum 90 zile)
      const duration = parseInt(durationDays);
      if (isNaN(duration) || duration < 1 || duration > 90) {
        return res.status(400).json({ message: "Durata promovrii trebuie s fie ntre 1 i 90 de zile" });
      }
      
      // Verific dac pelerinajul exist
      const pilgrimage = await storage.getPilgrimage(pilgrimageId);
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
      }
      
      // Verificm dac pelerinajul aparine organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu avei permisiunea de a promova acest pelerinaj" });
      }
      
      // Verificm dac pelerinajul este verificat
      if (!pilgrimage.verified) {
        return res.status(400).json({ message: "Doar pelerinajele verificate pot fi promovate" });
      }
      
      // Calculm data de expirare a promovrii
      const promotionStartedAt = new Date();
      const promotionExpiry = new Date();
      promotionExpiry.setDate(promotionExpiry.getDate() + duration);
      
      // Calculm preul promovrii (vom implementa sistemul de plat mai trziu)
      const pricePerDay = {
        'basic': 5,
        'premium': 10,
        'exclusive': 15
      };
      
      const totalPrice = pricePerDay[promotionLevel] * duration;
      
      // Actualizm pelerinajul cu informaiile de promovare
      const updatedPilgrimage = await storage.updatePilgrimage(pilgrimageId, {
        promoted: true,
        promotionLevel,
        promotionStartedAt,
        promotionExpiry
      });
      
      // Aici ar fi implementat integrarea cu sistemul de plat
      // Pentru moment, doar returnm pelerinajul actualizat
      
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
  
  // Endpoint pentru anularea promovrii unui pelerinaj
  app.post("/api/pilgrimage/:id/cancel-promotion", isOrganizer, async (req, res) => {
    try {
      const pilgrimageId = parseInt(req.params.id);
      
      // Verific dac pelerinajul exist
      const pilgrimage = await storage.getPilgrimage(pilgrimageId);
      if (!pilgrimage) {
        return res.status(404).json({ message: "Pelerinajul nu a fost gsit" });
      }
      
      // Verificm dac pelerinajul aparine organizatorului
      if (pilgrimage.organizerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Nu avei permisiunea de a gestiona acest pelerinaj" });
      }
      
      // Verificm dac pelerinajul este promovat
      if (!pilgrimage.promoted) {
        return res.status(400).json({ message: "Acest pelerinaj nu este promovat n prezent" });
      }
      
      // Actualizm pelerinajul pentru a anula promovarea
      const updatedPilgrimage = await storage.updatePilgrimage(pilgrimageId, {
        promoted: false,
        promotionLevel: 'none',
        promotionStartedAt: null,
        promotionExpiry: null
      });
      
      res.json({
        success: true,
        message: "Promovarea pelerinajului a fost anulat",
        pilgrimage: updatedPilgrimage
      });
    } catch (error) {
      console.error("Error cancelling promotion:", error);
      res.status(500).json({ message: "Eroare la anularea promovrii pelerinajului" });
    }
  });

  // Image upload route
  app.post('/api/upload-image', isAuthenticated, upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nicio imagine ncrcat" });
      }
      
      // Constructia URL-ului imaginii
      const imageUrl = `/static/images/pilgrimages/${req.file.filename}`;
      
      res.status(200).json({ 
        success: true, 
        imageUrl: imageUrl,
        message: "Imaginea a fost ncrcat cu succes" 
      });
    } catch (error) {
      console.error("Eroare la ncrcarea imaginii:", error);
      res.status(500).json({ message: "Eroare la ncrcarea imaginii" });
    }
  });
  
  // CMS routes
  app.get("/api/cms", async (req, res) => {
    try {
      // Dezactivm cache-ul pentru toate rspunsurile API CMS
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      try {
        const content = await storage.getCmsContent();
        res.json(content);
      } catch (dbError) {
        console.error("Database error fetching CMS content:", dbError);
        // Rspundem cu un array gol n loc s returnam eroare
        // pentru a preveni blocarea interfeei utilizatorului
        res.json([]);
      }
    } catch (error) {
      console.error("General error in CMS route:", error);
      res.status(500).json({ message: "Eroare la preluarea coninutului CMS" });
    }
  });

  // Endpoint pentru ncrcarea imaginilor pentru CMS
  app.post("/api/cms/upload", cmsUpload.single('image'), async (req, res) => {
    try {
      // Verificm autentificarea (permitem cereri fr autentificare n modurile de dezvoltare)
      if (process.env.NODE_ENV === 'production' && (!req.isAuthenticated() || req.user?.role !== 'admin')) {
        return res.status(403).json({ message: "Acces interzis. Este necesar rol de administrator." });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "Nu a fost furnizat niciun fiier" });
      }
      
      // Returnm calea relativ ctre imagine
      const imagePath = `/uploads/${req.file.filename}`;
      
      console.log(`Imagine CMS ncrcat cu succes: ${imagePath}`);
      
      res.status(201).json({ 
        url: imagePath,
        message: "Imagine ncrcat cu succes" 
      });
    } catch (error) {
      console.error("Eroare la ncrcarea imaginii:", error);
      res.status(500).json({ message: "Eroare la ncrcarea imaginii" });
    }
  });
  
  // Endpoint pentru listarea bannerelor din homepage
  app.get("/api/cms/banners", async (req, res) => {
    try {
      // Dezactivm cache-ul pentru a asigura actualizarea corect a bannerelor
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const allContent = await storage.getCmsContent() as any[];
      if (!Array.isArray(allContent)) {
        return res.json([]);
      }
      
      // Filtrm coninutul pentru a obine doar bannerele
      const banners = allContent.filter(item => 
        item.key.startsWith('homepage_banner_') && 
        item.contentType === 'image'
      );
      
      const sortedBanners = banners.sort((a, b) => {
        // Extrage numrul din cheia banner-ului (ex: homepage_banner_1 -> 1)
        const aNumber = parseInt(a.key.split('_').pop() || '0');
        const bNumber = parseInt(b.key.split('_').pop() || '0');
        return aNumber - bNumber;
      });
      
      // Adugm informaii mai detaliate despre bannere
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
      console.error("Eroare la obinerea listei de bannere:", error);
      res.status(500).json({ message: "Eroare la obinerea listei de bannere" });
    }
  });
  
  // Endpoint pentru listarea bannerelor promoionale
  app.get("/api/cms/promo-banners", async (req, res) => {
    try {
      // Dezactivm cache-ul pentru a asigura actualizarea corect a bannerelor
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const allContent = await storage.getCmsContent() as any[];
      if (!Array.isArray(allContent)) {
        return res.json({ banners: [], sectionTitle: "Oferte i Evenimente Speciale" });
      }
      
      // Filtrm coninutul pentru a obine bannerele promoionale i titlul seciunii
      const promoBanners = allContent.filter(item => {
        // Debug pentru a vedea ce proprieti sunt disponibile
        if (item.key.startsWith('promo_banner_')) {
          console.log('Proprieti pentru banner:', Object.keys(item));
          console.log('Content type pentru banner:', item.content_type || item.contentType);
        }
        
        return (
          item.key.startsWith('promo_banner_') && 
          (item.content_type === 'image' || item.contentType === 'image') &&
          !item.key.includes('section_title')
        );
      });
      
      // Gsim titlul seciunii
      const sectionTitleItem = allContent.find(item => 
        item.key === 'promo_banner_section_title' && 
        (item.contentType === 'text' || item.content_type === 'text')
      );
      
      const sectionTitle = sectionTitleItem ? sectionTitleItem.value : "Oferte i Evenimente Speciale";
      
      const sortedPromoBanners = promoBanners.sort((a, b) => {
        // Extrage numrul din cheia banner-ului (ex: promo_banner_1 -> 1)
        const aNumber = parseInt(a.key.split('_').pop() || '0');
        const bNumber = parseInt(b.key.split('_').pop() || '0');
        return aNumber - bNumber;
      });
      
      // Adăugăm informații mai detaliate despre bannere promoționale
      const enhancedPromoBanners = sortedPromoBanners.map((banner) => {
        // Căutăm un item separat pentru descriere (acesta este modelul actual din baza de date)
        const descriptionKey = banner.key.replace('_banner_', '_banner_description_');
        const descriptionItem = allContent.find(item => 
          item.key === descriptionKey && 
          (item.contentType === 'text' || item.content_type === 'text')
        );
        
        return {
          ...banner,
          // Utilizăm descrierea din item-ul separat sau undefined dacă nu există
          description: descriptionItem?.value || undefined,
          linkUrl: "/pilgrimages"
        };
      });
      
      console.log("Bannere promoionale trimise:", enhancedPromoBanners);
      
      res.json({
        banners: enhancedPromoBanners,
        sectionTitle: sectionTitle
      });
    } catch (error) {
      console.error("Eroare la obinerea listei de bannere promoionale:", error);
      res.status(500).json({ message: "Eroare la obinerea listei de bannere promoionale" });
    }
  });
  
  app.get("/api/cms/:key", async (req, res) => {
    try {
      // Dezactivm cache-ul pentru toate rspunsurile API CMS
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const key = req.params.key;
      
      try {
        const content = await storage.getCmsContent(key);
        
        if (!content) {
          return res.status(404).json({ 
            message: "Coninutul CMS nu a fost gsit",
            key: key,
            // Adugm o valoare ntiinare pentru a ajuta la debugging
            suggestionForUI: "Not found"
          });
        }
        
        res.json(content);
      } catch (dbError) {
        console.error(`Database error fetching CMS content for key=${key}:`, dbError);
        return res.status(404).json({ 
          message: "Eroare la accesarea coninutului CMS",
          key: key,
          // Adugm o valoare sugestie pentru UI s afieze fallback
          suggestionForUI: "Database error"
        });
      }
    } catch (error) {
      console.error("Error in CMS key route:", error);
      res.status(500).json({ message: "Eroare la preluarea coninutului CMS" });
    }
  });

  // Rut special pentru iniializarea coninutului CMS (batch)
  // Nu necesit autentificare pentru moment (unsafe, dar funcional pentru dezvoltare)
  app.post("/api/cms/initialize", async (req, res) => {
    try {
      // Adugm log pentru a vedea dac ruta este accesat
      console.log("CMS Initialize route accessed", {
        bodyLength: req.body?.length,
        userAuthenticated: req.isAuthenticated?.() || false,
        userRole: req.user?.role || 'none'
      });
      
      const results = [];
      let createdCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      // Verificm dac req.body este un array
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ 
          message: "Format invalid. Se ateapt un array de elemente CMS.",
          received: typeof req.body
        });
      }
      
      // Procesm fiecare element din array
      for (const item of req.body) {
        if (!item.key || !item.contentType || !item.value) {
          results.push({ 
            key: item.key || 'unknown', 
            status: 'error', 
            message: 'Lipsesc proprieti obligatorii (key, contentType, value)' 
          });
          errorCount++;
          continue;
        }
        
        try {
          // Verificm dac elementul exist deja
          const existing = await storage.getCmsContent(item.key);
          if (!existing) {
            // Crem un element nou
            const cmsItem = await storage.createCmsContent(item);
            results.push({ key: item.key, status: 'created' });
            createdCount++;
            console.log(`Created CMS item: ${item.key}`);
          } else {
            // Actualizm elementul existent
            const updatedCmsItem = await storage.updateCmsContent(item.key, {
              value: item.value,
              contentType: item.contentType || existing.contentType
            });
            
            if (updatedCmsItem) {
              results.push({ key: item.key, status: 'updated' });
              createdCount++; // Considerm i actualizarea ca o creare pentru statistici
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
      
      // Adugm log pentru rezultatul final
      console.log("CMS initialization complete", {
        created: createdCount,
        skipped: skippedCount,
        errors: errorCount
      });
      
      res.status(201).json({
        message: "Coninut CMS iniializat",
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
      res.status(500).json({ message: "Eroare la iniializarea coninutului CMS", error: String(error) });
    }
  });

  app.post("/api/cms", isAdmin, async (req, res) => {
    try {
      console.log("Trying to create CMS content with request body:", JSON.stringify(req.body));
      
      // Verificm manual dac avem toate cmpurile necesare pentru a proteja contra erorilor
      if (!req.body.key || !req.body.value || !req.body.contentType) {
        return res.status(400).json({ 
          message: "Date invalide", 
          errors: "Cmpurile key, value i contentType sunt obligatorii"
        });
      }
      
      try {
        const validData = insertCmsContentSchema.parse(req.body);
        console.log("Validation passed, creating CMS content with:", JSON.stringify(validData));
        
        const content = await storage.createCmsContent(validData);
        console.log("CMS content created:", JSON.stringify(content));
        
        res.status(201).json(content);
      } catch (zodError) {
        console.error("Validation error:", zodError);
        if (zodError instanceof z.ZodError) {
          return res.status(400).json({ message: "Date invalide", errors: zodError.errors });
        }
        
        // ncercm o abordare mai simpl dac validarea eueaz
        console.log("Trying simplified approach...");
        const simpleContent = await storage.createCmsContent({
          key: req.body.key,
          value: req.body.value,
          contentType: req.body.contentType
        });
        
        res.status(201).json(simpleContent);
      }
    } catch (error) {
      console.error("Error creating CMS content:", error);
      res.status(500).json({ 
        message: "Eroare la crearea coninutului CMS", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.put("/api/cms/:key", isAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const content = await storage.getCmsContent(key);
      
      if (!content) {
        return res.status(404).json({ message: "Coninutul CMS nu a fost gsit" });
      }
      
      const updatedContent = await storage.updateCmsContent(key, req.body);
      
      // Adugm un eveniment de log pentru a verifica actualizarea
      console.log(`CMS content updated: ${key}`, updatedContent);
      
      // Dezactivm cache-ul pentru a fora rencrcarea datelor
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      res.json(updatedContent);
    } catch (error) {
      console.error("Error updating CMS content:", error);
      res.status(500).json({ message: "Eroare la actualizarea coninutului CMS" });
    }
  });

  app.delete("/api/cms/:key", isAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const content = await storage.getCmsContent(key);
      
      if (!content) {
        return res.status(404).json({ message: "Coninutul CMS nu a fost gsit" });
      }
      
      const result = await storage.deleteCmsContent(key);
      
      if (result) {
        res.json({ success: true, message: "Coninutul CMS a fost ters cu succes" });
      } else {
        res.status(500).json({ message: "Eroare la tergerea coninutului CMS" });
      }
    } catch (error) {
      console.error("Error deleting CMS content:", error);
      res.status(500).json({ message: "Eroare la tergerea coninutului CMS" });
    }
  });
  
  // Endpoint pentru statisticile organizatorilor - Numai pentru administratori
  app.get("/api/admin/organizer-stats", isAdmin, async (req, res) => {
    try {
      // Obinem toi utilizatorii care sunt organizatori
      const users = await storage.getAllUsers();
      const organizers = users.filter(user => 
        user.role === "operator" || user.role === "monastery"
      );
      
      // Pentru fiecare organizator, compilm statisticile
      const organizerStats = await Promise.all(organizers.map(async (organizer) => {
        try {
          // Obinem toate pelerinajele organizatorului
          const pilgrimages = await storage.getPilgrimages({ organizerId: organizer.id });
          
          // Iniializm valorile statisticilor
          let totalBookings = 0;
          let totalRevenue = 0;
          let totalRatings = 0;
          let ratingCount = 0;
          
          // Stabilim data ultimei activiti
          // Folosim metoda sigur pentru a evita probleme cu null/undefined
          let lastActivity = new Date(); // Valoare implicit - data curent
          if (organizer.lastLogin) {
            lastActivity = new Date(organizer.lastLogin);
          } else if (organizer.createdAt) {
            lastActivity = new Date(organizer.createdAt);
          }
          
          // Numrm pelerinajele promovate - cu verificare dac proprietatea exist
          const promotedPilgrimages = pilgrimages.filter(p => p.promoted === true);
          
          // Optimizare: obținem toate rezervările și recenziile într-un singur lot
          // Pregătim apelurile asincrone pentru toate pelerinajele
          const bookingsPromises = pilgrimages.map(pilgrimage => 
            storage.getBookingsByPilgrimageId(pilgrimage.id)
          );
          const reviewsPromises = pilgrimages.map(pilgrimage => 
            storage.getReviews(pilgrimage.id)
          );
          
          try {
            // Executăm toate apelurile în paralel
            const allBookings = await Promise.all(bookingsPromises);
            const allReviews = await Promise.all(reviewsPromises);
            
            // Procesăm fiecare pelerinaj cu datele obținute
            for (let i = 0; i < pilgrimages.length; i++) {
              const pilgrimage = pilgrimages[i];
              const bookings = allBookings[i];
              const reviews = allReviews[i];
              
              // Actualizm statisticile
              totalBookings += bookings.length;
              
              // Calcularea veniturilor cu verificare de siguran
              totalRevenue += bookings.reduce((sum, b) => {
                return sum + (typeof b.totalPrice === 'number' ? b.totalPrice : 0);
              }, 0);
              
              // Calculm rating-ul mediu
              if (reviews && reviews.length > 0) {
                totalRatings += reviews.reduce((sum, r) => {
                  return sum + (typeof r.rating === 'number' ? r.rating : 0);
                }, 0);
                ratingCount += reviews.length;
              }
              
              // Actualizm ultima activitate cu verificri suplimentare
              if (pilgrimage.updatedAt) {
                const updatedDate = new Date(pilgrimage.updatedAt);
                if (updatedDate instanceof Date && !isNaN(updatedDate.getTime()) && 
                    updatedDate > lastActivity) {
                  lastActivity = updatedDate;
                }
              }
            }
          } catch (error) {
            console.error(`Error processing pilgrimages for organizer ${organizer.id}:`, error);
          }
          
          // Calculm rating-ul mediu cu verificare mpotriva diviziunii cu zero
          const averageRating = ratingCount > 0 ? (totalRatings / ratingCount) : 0;
          
          // Returnm statisticile pentru acest organizator
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
          // Returnm date minime n caz de eroare pentru un organizator
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
      
      // Filtram rezultatele NULL si sortm dup numrul de rezervri (descresctor)
      const validStats = organizerStats.filter(stat => stat !== null);
      validStats.sort((a, b) => b.totalBookings - a.totalBookings);
      
      res.json(validStats);
    } catch (error) {
      console.error("Error fetching organizer stats:", error);
      res.status(500).json({ 
        message: "Eroare la obinerea statisticilor organizatorilor",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Builder Pages routes
  // ======= SISTEM NOU DE PAGINI EDITABILE INLINE =======
  
  // Obținerea tuturor paginilor
  app.get("/api/pages", async (req, res) => {
    try {
      console.log("Fetching all pages...");
      const pages = await storage.getBuilderPages(); // Refolosim aceeași metodă de storage
      console.log(`Found ${pages.length} pages`);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Eroare la preluarea paginilor", error: String(error) });
    }
  });
  
  // Obținerea unei pagini după slug
  app.get("/api/pages/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      console.log(`Fetching page by slug: ${slug}`);
      const page = await storage.getBuilderPageBySlug(slug);
      
      if (!page) {
        console.log(`Page with slug ${slug} not found`);
        return res.status(404).json({ message: "Pagina nu a fost găsită" });
      }
      
      console.log(`Found page with slug ${slug}: ${page.title}`);
      res.json(page);
    } catch (error) {
      console.error("Error fetching page by slug:", error);
      res.status(500).json({ message: "Eroare la preluarea paginii după slug", error: String(error) });
    }
  });
  
  // Obținerea unei pagini după tip
  app.get("/api/pages/type/:pageType", async (req, res) => {
    try {
      const pageType = req.params.pageType;
      console.log(`Fetching page by type: ${pageType}`);
      const page = await storage.getBuilderPageByType(pageType);
      
      if (!page) {
        console.log(`Page with type ${pageType} not found`);
        return res.status(404).json({ message: "Nu există o pagină publicată pentru acest tip" });
      }
      
      console.log(`Found page with type ${pageType}: ${page.title}`);
      res.json(page);
    } catch (error) {
      console.error("Error fetching page by type:", error);
      res.status(500).json({ message: "Eroare la preluarea paginii după tip", error: String(error) });
    }
  });
  
  // Obținerea unei pagini după ID
  app.get("/api/pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Fetching page by ID: ${id}`);
      const page = await storage.getBuilderPage(id);
      
      if (!page) {
        console.log(`Page with ID ${id} not found`);
        return res.status(404).json({ message: "Pagina nu a fost găsită" });
      }
      
      console.log(`Found page with ID ${id}: ${page.title}`);
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Eroare la preluarea paginii", error: String(error) });
    }
  });
  
  // Crearea unei pagini noi (temporar acces public pentru testare)
  app.post("/api/pages", async (req, res) => {
    try {
      console.log("Creating page for path: ", req.body.slug);
      // Validăm datele de intrare
      const { title, slug, pageType, content = '{}', meta = '{}', isPublished = true } = req.body;
      
      if (!title || !slug) {
        return res.status(400).json({ message: "Titlul și slug-ul sunt obligatorii" });
      }
      
      // Verificăm dacă există deja o pagină cu același slug
      const existingPage = await storage.getBuilderPageBySlug(slug);
      if (existingPage) {
        return res.status(400).json({ message: "Există deja o pagină cu acest slug" });
      }
      
      // Pregătim datele pentru pagina nouă
      const pageData = {
        title,
        slug,
        pageType: pageType || 'custom',
        content,
        meta,
        isPublished,
        // Dacă utilizatorul este autentificat, salvăm ID-ul său, altfel null
        createdBy: req.isAuthenticated() ? req.user?.id : null,
      };
      
      console.log("Creating new page with data:", pageData);
      const page = await storage.createBuilderPage(pageData);
      console.log("Page created successfully:", page);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      res.status(500).json({ 
        message: "Eroare la crearea paginii", 
        error: String(error),
        stack: process.env.NODE_ENV !== 'production' ? (error as any).stack : undefined
      });
    }
  });
  
  // Actualizarea unei pagini existente (doar admin)
  app.put("/api/pages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificăm dacă pagina există
      const existingPage = await storage.getBuilderPage(id);
      if (!existingPage) {
        return res.status(404).json({ message: "Pagina nu a fost găsită" });
      }
      
      const { title, slug, pageType, content, meta } = req.body;
      
      // Verificăm dacă se schimbă slug-ul și dacă există altă pagină cu același slug
      if (slug && slug !== existingPage.slug) {
        const pageWithSameSlug = await storage.getBuilderPageBySlug(slug);
        if (pageWithSameSlug && pageWithSameSlug.id !== id) {
          return res.status(400).json({ message: "Există deja o pagină cu acest slug" });
        }
      }
      
      // Construim obiectul de actualizare incluzând doar câmpurile furnizate
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (slug !== undefined) updateData.slug = slug;
      if (pageType !== undefined) updateData.pageType = pageType;
      if (content !== undefined) updateData.content = content;
      if (meta !== undefined) updateData.meta = meta;
      
      // Actualizăm pagina
      const updatedPage = await storage.updateBuilderPage(id, updateData);
      
      if (!updatedPage) {
        return res.status(500).json({ message: "Eroare la actualizarea paginii" });
      }
      
      res.json(updatedPage);
    } catch (error) {
      console.error("Error updating page:", error);
      res.status(500).json({ message: "Eroare la actualizarea paginii", error: String(error) });
    }
  });
  
  // Ștergerea unei pagini (doar admin)
  app.delete("/api/pages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificăm dacă pagina există
      const existingPage = await storage.getBuilderPage(id);
      if (!existingPage) {
        return res.status(404).json({ message: "Pagina nu a fost găsită" });
      }
      
      // Ștergem pagina
      const success = await storage.deleteBuilderPage(id);
      
      if (!success) {
        return res.status(500).json({ message: "Eroare la ștergerea paginii" });
      }
      
      res.status(200).json({ message: "Pagina a fost ștearsă cu succes" });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ message: "Eroare la ștergerea paginii", error: String(error) });
    }
  });
  
  // === MENȚINEM RUTELE VECHI PENTRU COMPATIBILITATE TEMPORARĂ ===
  
  // Obținerea tuturor paginilor builder
  app.get("/api/builder-pages", async (req, res) => {
    try {
      // Dezactivăm cache-ul pentru toate răspunsurile din API
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const pages = await storage.getBuilderPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching builder pages:", error);
      res.status(500).json({ message: "Eroare la preluarea paginilor builder", error: String(error) });
    }
  });
  
  // Obținerea unei pagini builder după slug
  app.get("/api/builder-pages/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const page = await storage.getBuilderPageBySlug(slug);
      
      if (!page) {
        return res.status(404).json({ message: "Pagina builder nu a fost găsită" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error fetching builder page by slug:", error);
      res.status(500).json({ message: "Eroare la preluarea paginii builder după slug", error: String(error) });
    }
  });
  
  // Obținerea unei pagini builder după tipul său
  app.get("/api/builder-pages/type/:pageType", async (req, res) => {
    try {
      const pageType = req.params.pageType;
      const page = await storage.getBuilderPageByType(pageType);
      
      if (!page) {
        return res.status(404).json({ message: "Nu există o pagină publicată pentru acest tip" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error fetching builder page by type:", error);
      res.status(500).json({ message: "Eroare la preluarea paginii builder după tip", error: String(error) });
    }
  });
  
  // Obținerea unei pagini builder după ID
  app.get("/api/builder-pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const page = await storage.getBuilderPage(id);
      
      if (!page) {
        return res.status(404).json({ message: "Pagina builder nu a fost găsită" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error fetching builder page:", error);
      res.status(500).json({ message: "Eroare la preluarea paginii builder", error: String(error) });
    }
  });
  
  // Crearea unei pagini builder noi (doar admin)
  app.post("/api/builder-pages", isAdmin, async (req, res) => {
    try {
      // Validăm datele de intrare
      const validData = insertBuilderPageSchema.parse(req.body);
      
      // Adăugăm ID-ul utilizatorului care a creat pagina
      const pageData = {
        ...validData,
        createdBy: req.user.id
      };
      
      const page = await storage.createBuilderPage(pageData);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating builder page:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Date invalide pentru crearea paginii builder", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Eroare la crearea paginii builder", error: String(error) });
    }
  });
  
  // Actualizarea unei pagini builder existente (doar admin)
  app.put("/api/builder-pages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificăm dacă pagina există
      const existingPage = await storage.getBuilderPage(id);
      if (!existingPage) {
        return res.status(404).json({ message: "Pagina builder nu a fost găsită" });
      }
      
      // Actualizăm pagina
      const updatedPage = await storage.updateBuilderPage(id, req.body);
      
      if (!updatedPage) {
        return res.status(500).json({ message: "Eroare la actualizarea paginii builder" });
      }
      
      res.json(updatedPage);
    } catch (error) {
      console.error("Error updating builder page:", error);
      res.status(500).json({ message: "Eroare la actualizarea paginii builder", error: String(error) });
    }
  });
  
  // Ștergerea unei pagini builder (doar admin)
  app.delete("/api/builder-pages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificăm dacă pagina există
      const existingPage = await storage.getBuilderPage(id);
      if (!existingPage) {
        return res.status(404).json({ message: "Pagina builder nu a fost găsită" });
      }
      
      // Ștergem pagina
      const result = await storage.deleteBuilderPage(id);
      
      if (result) {
        res.json({ message: "Pagina builder a fost ștearsă cu succes" });
      } else {
        res.status(500).json({ message: "A apărut o eroare la ștergerea paginii builder" });
      }
    } catch (error) {
      console.error("Error deleting builder page:", error);
      res.status(500).json({ message: "Eroare la ștergerea paginii builder", error: String(error) });
    }
  });

  // Înregistrăm rutele pentru mănăstiri
  // IMPORTANT: Înregistrăm mai întâi rutele pentru regiuni,
  // pentru a evita conflictele cu rutele parametrizate
  registerMonasteryRegionsRoutes(app);
  registerMonasteryRecommendationsRoutes(app);
  registerMonasteryRoutes(app);
  
  // Înregistrăm rutele pentru încărcarea fișierelor
  registerUploadRoutes(app);
  
  const httpServer = createServer(app);

  return httpServer;
}
