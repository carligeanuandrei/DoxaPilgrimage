import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { sendVerificationEmail, sendWelcomeEmail } from "./email";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "doxa-pilgrimage-secret-key-change-in-production";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Strategie pentru autentificarea administratorului
  passport.use('admin', 
    new LocalStrategy(async (username, password, done) => {
      try {
        // Verificare cu credențiale hardcodate pentru admin
        if (username === 'avatour' && password === 'parola123') {
          // Creăm un utilizator admin virtual
          const adminUser: SelectUser = {
            id: 9999, // ID special pentru admin
            username: 'avatour',
            password: 'protected',
            email: 'admin@doxa.ro',
            firstName: 'Admin',
            lastName: 'Doxa',
            phone: null,
            role: 'admin',
            verified: true,
            verificationToken: null,
            tokenExpiry: null,
            resetToken: null,
            resetTokenExpiry: null,
            twoFactorCode: null,
            twoFactorExpiry: null,
            bio: null,
            profileImage: null,
            createdAt: new Date()
          };
          return done(null, adminUser);
        }
        
        return done(null, false, { message: "Credențiale de admin incorecte" });
      } catch (error) {
        return done(error);
      }
    })
  );

  // Strategie normală pentru utilizatori
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Credențiale incorecte" });
        } else if (!user.verified && user.role !== "admin") {
          return done(null, false, { message: "Contul nu a fost verificat. Verificați-vă emailul pentru a activa contul." });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      // Verificăm dacă ID-ul este cel de admin special (9999)
      if (id === 9999) {
        try {
          // Citim datele salvate ale administratorului din fișier
          const fs = require('fs');
          const path = require('path');
          const adminFilePath = path.join(process.cwd(), '.adminstorage', 'data.json');
          
          // Verificăm dacă fișierul există și încercăm să-l citim
          if (fs.existsSync(adminFilePath)) {
            const fileData = fs.readFileSync(adminFilePath, 'utf8');
            const adminData = JSON.parse(fileData);
            done(null, adminData);
            return;
          }
        } catch (error) {
          console.error('Eroare la citirea datelor salvate ale administratorului:', error);
          // În caz de eroare, continuăm cu datele hardcodate
        }
      
        // Folosim datele hardcodate ca fallback
        const adminUser: SelectUser = {
          id: 9999,
          username: 'avatour',
          password: 'protected',
          email: 'admin@doxa.ro',
          firstName: 'Admin',
          lastName: 'Doxa',
          phone: null,
          role: 'admin',
          verified: true,
          verificationToken: null,
          tokenExpiry: null,
          resetToken: null,
          resetTokenExpiry: null,
          twoFactorCode: null,
          twoFactorExpiry: null,
          bio: null,
          profileImage: null,
          createdAt: new Date()
        };
        done(null, adminUser);
      } else {
        // Pentru utilizatorii normali, îi luăm din baza de date
        const user = await storage.getUser(id);
        done(null, user);
      }
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Numele de utilizator există deja" });
      }

      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Adresa de email este deja folosită" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Generează token pentru verificarea emailului
      const verificationToken = await storage.createVerificationToken(user.id, user.email);
      
      // Trimite email de verificare
      const emailPreviewUrl = await sendVerificationEmail(user, verificationToken);
      
      // Pentru development, logăm URL-ul de preview al email-ului
      if (process.env.NODE_ENV !== "production" && emailPreviewUrl) {
        console.log("Email verification preview URL:", emailPreviewUrl);
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          ...user,
          message: "Un email de verificare a fost trimis la adresa ta de email."
        });
      });
    } catch (error) {
      next(error);
    }
  });

  // Rută pentru login normal
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: any, info: { message: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Credențiale incorecte" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });
  
  // Rută pentru login admin
  app.post("/api/admin/login", (req, res, next) => {
    passport.authenticate("admin", (err: Error, user: any, info: { message: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Credențiale de admin incorecte" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Rută pentru verificarea emailului
  app.get("/api/verify-email", async (req, res) => {
    try {
      const token = req.query.token as string;
      
      if (!token) {
        return res.status(400).json({ message: "Token lipsă" });
      }
      
      const verified = await storage.verifyUserEmail(token);
      
      if (verified) {
        // Găsim utilizatorul cu acest token
        const user = await storage.getUserByVerificationToken(token);
        
        if (user) {
          // Trimitem email de confirmare (bun venit)
          await sendWelcomeEmail(user);
          
          // Logăm utilizatorul automat
          req.login(user, (err) => {
            if (err) throw err;
            return res.redirect('/#verified=success');
          });
        } else {
          return res.redirect('/#verified=already');
        }
      } else {
        return res.redirect('/#verified=failed');
      }
    } catch (error) {
      console.error("Eroare la verificarea emailului:", error);
      res.status(500).json({ message: "Eroare la verificarea emailului" });
    }
  });

  // Rută pentru a solicita resetarea parolei
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email obligatoriu" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (user) {
        // Generăm token pentru resetarea parolei
        const token = await storage.createPasswordResetToken(user.id, email);
        
        // Trimitem emailul de resetare
        const emailPreviewUrl = await sendPasswordResetEmail(user, token);
        
        // Pentru development, logăm URL-ul de preview al email-ului
        if (process.env.NODE_ENV !== "production" && emailPreviewUrl) {
          console.log("Password reset email preview URL:", emailPreviewUrl);
        }
      }
      
      // Pentru securitate, întotdeauna confirmăm că am trimis mailul
      // chiar dacă utilizatorul nu există
      res.json({ 
        message: "Dacă adresa de email există în baza noastră de date, vei primi instrucțiuni pentru resetarea parolei." 
      });
    } catch (error) {
      console.error("Eroare la solicitarea resetării parolei:", error);
      res.status(500).json({ message: "Eroare la solicitarea resetării parolei" });
    }
  });

  // Rută pentru resetarea parolei
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token și parolă obligatorii" });
      }
      
      const success = await storage.resetPasswordWithToken(token, await hashPassword(password));
      
      if (success) {
        res.json({ message: "Parola a fost schimbată cu succes." });
      } else {
        res.status(400).json({ message: "Token invalid sau expirat." });
      }
    } catch (error) {
      console.error("Eroare la resetarea parolei:", error);
      res.status(500).json({ message: "Eroare la resetarea parolei" });
    }
  });
}
