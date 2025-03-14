/**
 * Rute API pentru gestionarea rețetelor de post
 */

import { Request, Response } from 'express';
import { Express } from 'express';
import { storage } from '../storage';
import { eq } from 'drizzle-orm';
import { fastingRecipes } from '../../shared/schema';
import { z } from 'zod';

const isAdmin = (req: Request): boolean => {
  return req.user?.role === 'admin';
};

const isAuthenticated = (req: Request): boolean => {
  return !!req.user;
};

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
      const filters: any = {};
      
      // Adaugă filtrele din query params
      if (req.query.recipeType) {
        filters.recipeType = req.query.recipeType as string;
      }
      
      if (req.query.category) {
        filters.category = req.query.category as string;
      }
      
      if (req.query.difficulty) {
        filters.difficulty = req.query.difficulty as string;
      }
      
      if (req.query.day) {
        // Pentru filtrarea după zile recomandate, vom face o filtrare specială în storage
        // deoarece acest câmp este un array în baza de date
        const day = req.query.day as string;
        const recipes = await storage.getRecipesForDay(day);
        return res.json(recipes);
      }
      
      const recipes = await storage.getRecipes(filters);
      res.json(recipes);
    } catch (error) {
      console.error('Eroare la obținerea rețetelor de post:', error);
      res.status(500).json({ error: 'Eroare la obținerea rețetelor de post' });
    }
  });

  /**
   * GET /api/fasting-recipes/featured
   * Returnează rețetele de post promovate/recomandate
   */
  app.get('/api/fasting-recipes/featured', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const featuredRecipes = await storage.getFeaturedRecipes(limit);
      res.json(featuredRecipes);
    } catch (error) {
      console.error('Eroare la obținerea rețetelor de post recomandate:', error);
      res.status(500).json({ error: 'Eroare la obținerea rețetelor de post recomandate' });
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
      console.error('Eroare la obținerea rețetelor de post după tip:', error);
      res.status(500).json({ error: 'Eroare la obținerea rețetelor de post după tip' });
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
      console.error('Eroare la obținerea rețetelor de post după categorie:', error);
      res.status(500).json({ error: 'Eroare la obținerea rețetelor de post după categorie' });
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
      console.error('Eroare la obținerea rețetelor de post pentru ziua specificată:', error);
      res.status(500).json({ error: 'Eroare la obținerea rețetelor de post pentru ziua specificată' });
    }
  });

  /**
   * GET /api/fasting-recipes/monastery/:id
   * Returnează rețetele de post asociate unei mănăstiri
   */
  app.get('/api/fasting-recipes/monastery/:id', async (req: Request, res: Response) => {
    try {
      const monasteryId = parseInt(req.params.id);
      const recipes = await storage.getMonasteryRecipes(monasteryId);
      res.json(recipes);
    } catch (error) {
      console.error('Eroare la obținerea rețetelor de post de la mănăstire:', error);
      res.status(500).json({ error: 'Eroare la obținerea rețetelor de post de la mănăstire' });
    }
  });

  /**
   * GET /api/fasting-recipes/:id
   * Returnează o rețetă de post după ID
   */
  app.get('/api/fasting-recipes/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipe(id);
      
      if (!recipe) {
        return res.status(404).json({ error: 'Rețeta nu a fost găsită' });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error('Eroare la obținerea rețetei de post:', error);
      res.status(500).json({ error: 'Eroare la obținerea rețetei de post' });
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
      console.error('Eroare la obținerea rețetei de post după slug:', error);
      res.status(500).json({ error: 'Eroare la obținerea rețetei de post după slug' });
    }
  });

  /**
   * GET /api/fasting-recipes/:id/comments
   * Returnează comentariile pentru o rețetă
   */
  app.get('/api/fasting-recipes/:id/comments', async (req: Request, res: Response) => {
    try {
      const recipeId = parseInt(req.params.id);
      const comments = await storage.getRecipeComments(recipeId);
      res.json(comments);
    } catch (error) {
      console.error('Eroare la obținerea comentariilor pentru rețeta de post:', error);
      res.status(500).json({ error: 'Eroare la obținerea comentariilor pentru rețeta de post' });
    }
  });

  /**
   * POST /api/fasting-recipes
   * Adaugă o nouă rețetă de post
   * Necesită autentificare
   */
  app.post('/api/fasting-recipes', async (req: Request, res: Response) => {
    try {
      if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Trebuie să fiți autentificat pentru a adăuga o rețetă' });
      }

      // Schema de validare pentru rețeta de post
      const recipeSchema = z.object({
        title: z.string().min(3, 'Titlul trebuie să aibă cel puțin 3 caractere'),
        slug: z.string().optional(),
        description: z.string().min(10, 'Descrierea trebuie să aibă cel puțin 10 caractere'),
        recipeType: z.string(),
        category: z.string(),
        difficulty: z.string(),
        preparationMinutes: z.number().min(1),
        cookingMinutes: z.number().min(0),
        preparationTime: z.string(),
        servings: z.number().min(1),
        calories: z.number().optional(),
        ingredients: z.array(z.string()),
        steps: z.array(z.string()),
        imageUrl: z.string().optional(),
        source: z.string().optional(),
        monasteryId: z.number().optional(),
        isFeatured: z.boolean().optional(),
        recommendedForDays: z.array(z.string()).optional(),
        occasionTags: z.array(z.string()).optional(),
        feastDay: z.string().optional()
      });

      const validData = recipeSchema.parse(req.body);
      
      // Asigurăm că autorul rețetei este utilizatorul autentificat
      const recipeData = {
        ...validData,
        authorId: req.user?.id,
        slug: validData.slug || validData.title.toLowerCase().replace(/\s+/g, '-'),
      };
      
      const newRecipe = await storage.createRecipe(recipeData);
      res.status(201).json(newRecipe);
    } catch (error) {
      console.error('Eroare la adăugarea rețetei de post:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Date invalide', details: error.errors });
      }
      res.status(500).json({ error: 'Eroare la adăugarea rețetei de post' });
    }
  });

  /**
   * PATCH /api/fasting-recipes/:id
   * Actualizează o rețetă de post existentă
   * Necesită autentificare și drepturi
   */
  app.patch('/api/fasting-recipes/:id', async (req: Request, res: Response) => {
    try {
      if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Trebuie să fiți autentificat pentru a actualiza o rețetă' });
      }

      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipe(id);
      
      if (!recipe) {
        return res.status(404).json({ error: 'Rețeta nu a fost găsită' });
      }
      
      // Verifică drepturile utilizatorului
      if (recipe.authorId !== req.user?.id && !isAdmin(req)) {
        return res.status(403).json({ error: 'Nu aveți permisiunea de a modifica această rețetă' });
      }

      // Schema de validare pentru actualizarea rețetei
      const updateSchema = z.object({
        title: z.string().min(3).optional(),
        slug: z.string().optional(),
        description: z.string().min(10).optional(),
        recipeType: z.string().optional(),
        category: z.string().optional(),
        difficulty: z.string().optional(),
        preparationMinutes: z.number().min(1).optional(),
        cookingMinutes: z.number().min(0).optional(),
        preparationTime: z.string().optional(),
        servings: z.number().min(1).optional(),
        calories: z.number().optional(),
        ingredients: z.array(z.string()).optional(),
        steps: z.array(z.string()).optional(),
        imageUrl: z.string().optional(),
        source: z.string().optional(),
        monasteryId: z.number().optional(),
        isFeatured: z.boolean().optional(),
        recommendedForDays: z.array(z.string()).optional(),
        occasionTags: z.array(z.string()).optional(),
        feastDay: z.string().optional()
      });

      const validData = updateSchema.parse(req.body);
      
      // Doar administratorii pot marca o rețetă ca fiind promovată
      if (validData.isFeatured !== undefined && !isAdmin(req)) {
        delete validData.isFeatured;
      }
      
      const updatedRecipe = await storage.updateRecipe(id, validData);
      
      if (!updatedRecipe) {
        return res.status(500).json({ error: 'Eroare la actualizarea rețetei de post' });
      }
      
      res.json(updatedRecipe);
    } catch (error) {
      console.error('Eroare la actualizarea rețetei de post:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Date invalide', details: error.errors });
      }
      res.status(500).json({ error: 'Eroare la actualizarea rețetei de post' });
    }
  });

  /**
   * DELETE /api/fasting-recipes/:id
   * Șterge o rețetă de post
   * Necesită autentificare și drepturi
   */
  app.delete('/api/fasting-recipes/:id', async (req: Request, res: Response) => {
    try {
      if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Trebuie să fiți autentificat pentru a șterge o rețetă' });
      }

      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipe(id);
      
      if (!recipe) {
        return res.status(404).json({ error: 'Rețeta nu a fost găsită' });
      }
      
      // Verifică drepturile utilizatorului
      if (recipe.authorId !== req.user?.id && !isAdmin(req)) {
        return res.status(403).json({ error: 'Nu aveți permisiunea de a șterge această rețetă' });
      }
      
      const success = await storage.deleteRecipe(id);
      
      if (!success) {
        return res.status(500).json({ error: 'Eroare la ștergerea rețetei de post' });
      }
      
      res.json({ success: true, message: 'Rețeta a fost ștearsă cu succes' });
    } catch (error) {
      console.error('Eroare la ștergerea rețetei de post:', error);
      res.status(500).json({ error: 'Eroare la ștergerea rețetei de post' });
    }
  });

  /**
   * POST /api/fasting-recipes/:id/comments
   * Adaugă un comentariu la o rețetă
   * Necesită autentificare
   */
  app.post('/api/fasting-recipes/:id/comments', async (req: Request, res: Response) => {
    try {
      if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Trebuie să fiți autentificat pentru a adăuga un comentariu' });
      }

      const recipeId = parseInt(req.params.id);
      const recipe = await storage.getRecipe(recipeId);
      
      if (!recipe) {
        return res.status(404).json({ error: 'Rețeta nu a fost găsită' });
      }

      // Schema de validare pentru comentariu
      const commentSchema = z.object({
        content: z.string().min(3, 'Comentariul trebuie să aibă cel puțin 3 caractere'),
        rating: z.number().min(1).max(5)
      });

      const validData = commentSchema.parse(req.body);
      
      const commentData = {
        ...validData,
        recipeId,
        userId: req.user!.id
      };
      
      const newComment = await storage.createRecipeComment(commentData);
      res.status(201).json(newComment);
    } catch (error) {
      console.error('Eroare la adăugarea comentariului:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Date invalide', details: error.errors });
      }
      res.status(500).json({ error: 'Eroare la adăugarea comentariului' });
    }
  });

  /**
   * DELETE /api/fasting-recipes/comments/:id
   * Șterge un comentariu
   * Necesită autentificare și drepturi
   */
  app.delete('/api/fasting-recipes/comments/:id', async (req: Request, res: Response) => {
    try {
      if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Trebuie să fiți autentificat pentru a șterge un comentariu' });
      }

      const id = parseInt(req.params.id);
      // Verifică drepturile utilizatorului
      // Doar administratorii sau utilizatorul care a adăugat comentariul îl pot șterge
      if (!isAdmin(req)) {
        // TODO: Verifică dacă utilizatorul este autorul comentariului
        // Aceasta necesită modificarea storage pentru a obține un comentariu după ID
        // Pentru acum, doar adminii pot șterge comentarii
        return res.status(403).json({ error: 'Nu aveți permisiunea de a șterge acest comentariu' });
      }
      
      const success = await storage.deleteRecipeComment(id);
      
      if (!success) {
        return res.status(500).json({ error: 'Eroare la ștergerea comentariului' });
      }
      
      res.json({ success: true, message: 'Comentariul a fost șters cu succes' });
    } catch (error) {
      console.error('Eroare la ștergerea comentariului:', error);
      res.status(500).json({ error: 'Eroare la ștergerea comentariului' });
    }
  });
}