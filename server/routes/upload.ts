import { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { isAdmin } from "../auth";

// Configurare multer pentru stocarea fișierelor
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'monasteries');
    
    // Verifică dacă directorul există, dacă nu, îl creează
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generează un nume de fișier unic bazat pe timestamp și uuid
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const extname = path.extname(file.originalname).toLowerCase();
    cb(null, `monastery-${uniqueSuffix}${extname}`);
  }
});

// Filtrare pentru a accepta doar imagini
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp', 'image/svg+xml'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fișier neacceptat. Sunt permise doar imaginile: JPG, PNG, GIF, WEBP, SVG.'));
  }
};

// Configurare upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limită de 5MB
  }
});

/**
 * Înregistrează rutele pentru încărcarea fișierelor
 */
export function registerUploadRoutes(app: Express) {
  /**
   * POST /api/upload
   * Endpoint pentru încărcarea unei imagini
   * Returnează URL-ul către imaginea încărcată
   */
  app.post('/api/upload', (req: Request, res: Response) => {
    // Verificare autentificare și drepturi
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Nu sunteți autentificat' });
    }

    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Nu aveți permisiunile necesare' });
    }

    // Procesare upload cu multer
    upload.single('image')(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Fișierul este prea mare. Limita este de 5MB.' });
        }
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Niciun fișier încărcat' });
      }

      // Construiește URL-ul relativ către fișierul încărcat
      const fileUrl = `/uploads/monasteries/${req.file.filename}`;
      
      // Returnează URL-ul
      res.json({ url: fileUrl });
    });
  });
}