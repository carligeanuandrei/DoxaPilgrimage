import { Express, Request, Response } from 'express';
import { eq, SQL, sql } from 'drizzle-orm';
import { storage } from '../storage';
import { FastingRecipe, InsertFastingRecipe, InsertRecipeComment, insertFastingRecipeSchema, insertRecipeCommentSchema } from '../../shared/schema';
import { isAdmin } from '../auth';
import { z } from 'zod';
import slugify from 'slugify';

/**
 * Înregistrează rutele pentru Rețetele de Post
 * @param app Aplicația Express
 */
export function registerFastingRecipesRoutes(app: Express) {
  /**
   * GET /api/fasting-recipes
   * Returnează toate rețetele de post, cu posibilitatea filtrării
   */
  app.get('/api/fasting-recipes', async (req: Request, res: Response) => {
    try {
      const { recipeType, category, difficulty, day, monasteryId, featured } = req.query;
      
      // Construim filtrele pe baza query params
      const filters: Partial<FastingRecipe> = {};
      
      if (recipeType) {
        filters.recipeType = recipeType as any;
      }
      
      if (category) {
        filters.category = category as any;
      }
      
      if (difficulty) {
        filters.difficulty = difficulty as any;
      }
      
      if (monasteryId) {
        filters.monasteryId = Number(monasteryId);
      }
      
      if (featured === 'true') {
        filters.isFeatured = true;
      }
      
      if (day) {
        // Pentru filtrare după zi, folosim o metodă separată
        const dayOfWeek = day as string;
        const recipes = await storage.getRecipesForDay(dayOfWeek);
        return res.json(recipes);
      }
      
      const recipes = await storage.getRecipes(filters);
      res.json(recipes);
    } catch (error) {
      console.error('Error fetching fasting recipes:', error);
      res.status(500).json({ error: 'A apărut o eroare la obținerea rețetelor' });
    }
  });
  
  /**
   * GET /api/fasting-recipes/featured
   * Returnează rețetele de post promovate/recomandate
   */
  app.get('/api/fasting-recipes/featured', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const recipes = await storage.getFeaturedRecipes(limit);
      res.json(recipes);
    } catch (error) {
      console.error('Error fetching featured recipes:', error);
      res.status(500).json({ error: 'A apărut o eroare la obținerea rețetelor promovate' });
    }
  });
  
  /**
   * GET /api/fasting-recipes/type/:type
   * Returnează rețetele de post de un anumit tip
   */
  app.get('/api/fasting-recipes/type/:type', async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const recipes = await storage.getRecipesByType(type);
      res.json(recipes);
    } catch (error) {
      console.error('Error fetching recipes by type:', error);
      res.status(500).json({ error: 'A apărut o eroare la obținerea rețetelor' });
    }
  });
  
  /**
   * GET /api/fasting-recipes/category/:category
   * Returnează rețetele de post dintr-o anumită categorie
   */
  app.get('/api/fasting-recipes/category/:category', async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const recipes = await storage.getRecipesByCategory(category);
      res.json(recipes);
    } catch (error) {
      console.error('Error fetching recipes by category:', error);
      res.status(500).json({ error: 'A apărut o eroare la obținerea rețetelor' });
    }
  });
  
  /**
   * GET /api/fasting-recipes/day/:day
   * Returnează rețetele de post recomandate pentru o anumită zi
   */
  app.get('/api/fasting-recipes/day/:day', async (req: Request, res: Response) => {
    try {
      const { day } = req.params;
      const recipes = await storage.getRecipesForDay(day);
      res.json(recipes);
    } catch (error) {
      console.error('Error fetching recipes for day:', error);
      res.status(500).json({ error: 'A apărut o eroare la obținerea rețetelor' });
    }
  });
  
  /**
   * GET /api/fasting-recipes/monastery/:id
   * Returnează rețetele de post asociate unei mănăstiri
   */
  app.get('/api/fasting-recipes/monastery/:id', async (req: Request, res: Response) => {
    try {
      const monasteryId = Number(req.params.id);
      const recipes = await storage.getMonasteryRecipes(monasteryId);
      res.json(recipes);
    } catch (error) {
      console.error('Error fetching monastery recipes:', error);
      res.status(500).json({ error: 'A apărut o eroare la obținerea rețetelor mănăstirii' });
    }
  });
  
  /**
   * GET /api/fasting-recipes/:id
   * Returnează o rețetă de post după ID
   */
  app.get('/api/fasting-recipes/:id', async (req: Request, res: Response) => {
    try {
      const recipeId = Number(req.params.id);
      const recipe = await storage.getRecipe(recipeId);
      
      if (!recipe) {
        return res.status(404).json({ error: 'Rețeta nu a fost găsită' });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({ error: 'A apărut o eroare la obținerea rețetei' });
    }
  });
  
  /**
   * GET /api/fasting-recipes/slug/:slug
   * Returnează o rețetă de post după slug
   */
  app.get('/api/fasting-recipes/slug/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const recipe = await storage.getRecipeBySlug(slug);
      
      if (!recipe) {
        return res.status(404).json({ error: 'Rețeta nu a fost găsită' });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error('Error fetching recipe by slug:', error);
      res.status(500).json({ error: 'A apărut o eroare la obținerea rețetei' });
    }
  });
  
  /**
   * GET /api/fasting-recipes/:id/comments
   * Returnează comentariile pentru o rețetă
   */
  app.get('/api/fasting-recipes/:id/comments', async (req: Request, res: Response) => {
    try {
      const recipeId = Number(req.params.id);
      const comments = await storage.getRecipeComments(recipeId);
      res.json(comments);
    } catch (error) {
      console.error('Error fetching recipe comments:', error);
      res.status(500).json({ error: 'A apărut o eroare la obținerea comentariilor' });
    }
  });
  
  /**
   * POST /api/fasting-recipes
   * Adaugă o nouă rețetă de post
   * Necesită autentificare
   */
  app.post('/api/fasting-recipes', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autentificarea este necesară' });
    }
    
    try {
      const recipeData = req.body;
      
      // Validare
      const validationResult = insertFastingRecipeSchema.safeParse(recipeData);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Date invalide pentru rețetă', 
          details: validationResult.error.format() 
        });
      }
      
      // Generăm un slug dacă nu există
      if (!recipeData.slug) {
        recipeData.slug = slugify(recipeData.title, { 
          lower: true,
          strict: true,
          locale: 'ro'
        });
      }
      
      // Setăm utilizatorul care a creat rețeta
      recipeData.createdBy = req.user.id;
      
      const newRecipe = await storage.createRecipe(recipeData);
      res.status(201).json(newRecipe);
    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ error: 'A apărut o eroare la crearea rețetei' });
    }
  });
  
  /**
   * PATCH /api/fasting-recipes/:id
   * Actualizează o rețetă de post existentă
   * Necesită autentificare și drepturi
   */
  app.patch('/api/fasting-recipes/:id', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autentificarea este necesară' });
    }
    
    try {
      const recipeId = Number(req.params.id);
      const recipeData = req.body;
      
      // Verificăm dacă rețeta există
      const existingRecipe = await storage.getRecipe(recipeId);
      if (!existingRecipe) {
        return res.status(404).json({ error: 'Rețeta nu a fost găsită' });
      }
      
      // Verificăm drepturile: doar creatorul sau admin poate edita
      if (existingRecipe.createdBy !== req.user.id && !isAdmin(req)) {
        return res.status(403).json({ error: 'Nu aveți permisiunea de a edita această rețetă' });
      }
      
      // Actualizăm rețeta
      const updatedRecipe = await storage.updateRecipe(recipeId, recipeData);
      res.json(updatedRecipe);
    } catch (error) {
      console.error('Error updating recipe:', error);
      res.status(500).json({ error: 'A apărut o eroare la actualizarea rețetei' });
    }
  });
  
  /**
   * DELETE /api/fasting-recipes/:id
   * Șterge o rețetă de post
   * Necesită autentificare și drepturi
   */
  app.delete('/api/fasting-recipes/:id', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autentificarea este necesară' });
    }
    
    try {
      const recipeId = Number(req.params.id);
      
      // Verificăm dacă rețeta există
      const existingRecipe = await storage.getRecipe(recipeId);
      if (!existingRecipe) {
        return res.status(404).json({ error: 'Rețeta nu a fost găsită' });
      }
      
      // Verificăm drepturile: doar creatorul sau admin poate șterge
      if (existingRecipe.createdBy !== req.user.id && !isAdmin(req)) {
        return res.status(403).json({ error: 'Nu aveți permisiunea de a șterge această rețetă' });
      }
      
      // Ștergem rețeta
      const success = await storage.deleteRecipe(recipeId);
      
      if (success) {
        res.status(204).end(); // No content
      } else {
        res.status(500).json({ error: 'Ștergerea rețetei a eșuat' });
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      res.status(500).json({ error: 'A apărut o eroare la ștergerea rețetei' });
    }
  });
  
  /**
   * POST /api/fasting-recipes/:id/comments
   * Adaugă un comentariu la o rețetă
   * Necesită autentificare
   */
  app.post('/api/fasting-recipes/:id/comments', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autentificarea este necesară' });
    }
    
    try {
      const recipeId = Number(req.params.id);
      const commentData = req.body;
      
      // Verificăm dacă rețeta există
      const existingRecipe = await storage.getRecipe(recipeId);
      if (!existingRecipe) {
        return res.status(404).json({ error: 'Rețeta nu a fost găsită' });
      }
      
      // Validare
      const validationResult = insertRecipeCommentSchema.safeParse(commentData);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Date invalide pentru comentariu', 
          details: validationResult.error.format() 
        });
      }
      
      // Setăm utilizatorul și ID-ul rețetei
      commentData.userId = req.user.id;
      commentData.recipeId = recipeId;
      
      const newComment = await storage.createRecipeComment(commentData);
      res.status(201).json(newComment);
    } catch (error) {
      console.error('Error creating recipe comment:', error);
      res.status(500).json({ error: 'A apărut o eroare la adăugarea comentariului' });
    }
  });
  
  /**
   * DELETE /api/fasting-recipes/comments/:id
   * Șterge un comentariu
   * Necesită autentificare și drepturi
   */
  app.delete('/api/fasting-recipes/comments/:id', async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autentificarea este necesară' });
    }
    
    try {
      const commentId = Number(req.params.id);
      
      // Verificăm dacă comentariul există și aparține utilizatorului sau este admin
      // Ar trebui adăugată funcționalitatea pentru a obține un comentariu după ID
      // Deocamdată, vom permite doar adminilor să șteargă comentarii
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Nu aveți permisiunea de a șterge acest comentariu' });
      }
      
      // Ștergem comentariul
      const success = await storage.deleteRecipeComment(commentId);
      
      if (success) {
        res.status(204).end(); // No content
      } else {
        res.status(500).json({ error: 'Ștergerea comentariului a eșuat' });
      }
    } catch (error) {
      console.error('Error deleting recipe comment:', error);
      res.status(500).json({ error: 'A apărut o eroare la ștergerea comentariului' });
    }
  });
}