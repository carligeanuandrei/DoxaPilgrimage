import { Express, Request, Response } from 'express';
import { db } from '../db';
import { monasteries } from '@shared/schema';
import { eq, and, sql, or, desc, like, not } from 'drizzle-orm';
import { OrthodoxFeast, getUpcomingFeasts, getFeastsForMonth } from '@shared/orthodox-calendar';

/**
 * Tipuri de recomandări de mănăstiri
 */
type RecommendationType = 
  'by_feast' |    // După hram
  'by_region' |   // După regiune
  'nearby' |      // Aproape de locația utilizatorului
  'similar' |     // Similare cu o mănăstire vizitată
  'popular' |     // Cele mai populare
  'hidden_gems' | // Mai puțin cunoscute, dar valoroase
  'upcoming_feasts'; // Mănăstiri cu hramuri în perioada următoare

/**
 * Parametrii pentru recomandări
 */
interface RecommendationParams {
  type: RecommendationType;
  region?: string;
  monasteryId?: number;
  userLat?: number;
  userLng?: number;
  feastDate?: string;
  month?: number;
  limit?: number;
}

/**
 * Înregistrează rutele pentru recomandările de mănăstiri
 */
export function registerMonasteryRecommendationsRoutes(app: Express) {
  /**
   * GET /api/monasteries/recommendations
   * Oferă recomandări de mănăstiri bazate pe diferiți algoritmi și filtre
   */
  app.get('/api/monasteries/recommendations', async (req: Request, res: Response) => {
    try {
      const type = (req.query.type as RecommendationType) || 'popular';
      const region = req.query.region as string;
      const monasteryId = req.query.monasteryId ? parseInt(req.query.monasteryId as string, 10) : undefined;
      const userLat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const userLng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      const feastDate = req.query.feastDate as string;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      // Construim parametrii pentru algoritm
      const params: RecommendationParams = {
        type,
        region,
        monasteryId,
        userLat,
        userLng,
        feastDate,
        month,
        limit
      };

      // Obținem recomandările
      const recommendations = await getMonasteryRecommendations(params);

      // Formatăm rezultatele
      const formattedRecommendations = recommendations.map(formatMonastery);

      res.json({
        type,
        recommendations: formattedRecommendations
      });
    } catch (error) {
      console.error('Error getting monastery recommendations:', error);
      res.status(500).json({
        message: 'Eroare la obținerea recomandărilor de mănăstiri',
        error: String(error)
      });
    }
  });

  /**
   * GET /api/monasteries/recommendations/feasts
   * Recomandă mănăstiri în funcție de sărbători ortodoxe apropiate
   */
  app.get('/api/monasteries/recommendations/feasts', async (req: Request, res: Response) => {
    try {
      const daysAhead = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      
      // Obținem sărbătorile apropiate
      const upcomingFeasts = getUpcomingFeasts(new Date(), daysAhead);
      
      // Obținem recomandările bazate pe sărbători
      const recommendations = await getMonasteriesByFeasts(upcomingFeasts, limit);
      
      // Formatăm rezultatele
      const formattedRecommendations = recommendations.map(monastery => ({
        ...formatMonastery(monastery),
        feast: upcomingFeasts.find(feast => 
          monastery.patronSaint && 
          (feast.name.toLowerCase().includes(monastery.patronSaint.toLowerCase()) || 
           feast.nameRo.toLowerCase().includes(monastery.patronSaint.toLowerCase()))
        )
      }));

      res.json({
        type: 'upcoming_feasts',
        feasts: upcomingFeasts,
        recommendations: formattedRecommendations
      });
    } catch (error) {
      console.error('Error getting feast-based monastery recommendations:', error);
      res.status(500).json({
        message: 'Eroare la obținerea recomandărilor bazate pe sărbători',
        error: String(error)
      });
    }
  });
  
  /**
   * GET /api/monasteries/recommendations/seasonal
   * Recomandă mănăstiri în funcție de sezon (lună, anotimp)
   */
  app.get('/api/monasteries/recommendations/seasonal', async (req: Request, res: Response) => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string, 10) : (new Date()).getMonth() + 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      
      // Obținem recomandările sezoniere
      const recommendations = await getSeasonalMonasteries(month, limit);
      
      // Obținem sărbătorile pentru luna respectivă
      const monthlyFeasts = getFeastsForMonth(month);
      
      res.json({
        type: 'seasonal',
        month,
        feasts: monthlyFeasts,
        recommendations: recommendations.map(formatMonastery)
      });
    } catch (error) {
      console.error('Error getting seasonal monastery recommendations:', error);
      res.status(500).json({
        message: 'Eroare la obținerea recomandărilor sezoniere de mănăstiri',
        error: String(error)
      });
    }
  });
}

/**
 * Funcția principală pentru obținerea recomandărilor de mănăstiri
 */
async function getMonasteryRecommendations(params: RecommendationParams) {
  switch (params.type) {
    case 'by_feast':
      return getMonasteriesByFeast(params.feastDate, params.limit);
    case 'by_region':
      return getMonasteriesByRegion(params.region, params.limit);
    case 'nearby':
      return getNearbyMonasteries(params.userLat, params.userLng, params.limit);
    case 'similar':
      return getSimilarMonasteries(params.monasteryId, params.limit);
    case 'popular':
      return getPopularMonasteries(params.limit);
    case 'hidden_gems':
      return getHiddenGemMonasteries(params.limit);
    case 'upcoming_feasts':
      const upcomingFeasts = getUpcomingFeasts(new Date(), 30);
      return getMonasteriesByFeasts(upcomingFeasts, params.limit);
    default:
      return getPopularMonasteries(params.limit);
  }
}

/**
 * Obține mănăstiri bazate pe hram
 */
async function getMonasteriesByFeast(feastDate: string | undefined, limit: number = 10) {
  try {
    if (!feastDate) {
      // Dacă nu este specificată o dată de hram, returnăm mănăstiri cu hramuri importante
      const result = await db.select().from(monasteries)
        .where(
          or(
            like(monasteries.patronSaint, '%Sfânta Maria%'),
            like(monasteries.patronSaint, '%Sfântul Nicolae%'),
            like(monasteries.patronSaint, '%Sfântul Gheorghe%'),
            like(monasteries.patronSaint, '%Sfântul Dumitru%')
          )
        )
        .limit(limit);
      return result;
    }

    // Parsăm data sărbătorii
    const date = new Date(feastDate);
    
    // Extragem luna și ziua
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Căutăm mănăstiri care au hramul în aceeași zi și lună
    // Notă: Comparația se face doar cu luna și ziua, fără an
    // Acest SQL raw este folosit pentru a extrage și compara luna și ziua din datele de hram
    const result = await db.select().from(monasteries)
      .where(sql`
        EXTRACT(MONTH FROM "patronSaintDate"::timestamp) = ${month} AND
        EXTRACT(DAY FROM "patronSaintDate"::timestamp) = ${day}
      `)
      .limit(limit);
    
    return result;
  } catch (error) {
    console.error("Error fetching monasteries by feast:", error);
    return [];
  }
}

/**
 * Obține mănăstiri bazate pe o listă de sărbători ortodoxe
 */
async function getMonasteriesByFeasts(feasts: OrthodoxFeast[], limit: number = 10) {
  try {
    // Extragem numele sfinților din sărbători
    const saintNames = feasts
      .filter(feast => feast.type === 'saint' || feast.name.includes('Sfânt') || feast.nameRo.includes('Sfânt'))
      .map(feast => {
        // Extragem numele sfântului din titlul sărbătorii
        const name = feast.nameRo;
        // Eliminăm prefixe comune pentru a obține doar numele sfântului
        return name
          .replace('Sfântul ', '')
          .replace('Sfânta ', '')
          .replace('Sfinții ', '')
          .replace('Sfintele ', '');
      });
    
    // Construim condițiile pentru căutarea în numele sfinților patroni
    const likeConditions = saintNames.map(name => 
      or(
        like(monasteries.patronSaint, `%${name}%`),
        like(monasteries.name, `%${name}%`)
      )
    );
    
    // Căutăm mănăstiri care au legătură cu sfinții din sărbătorile apropiate
    const result = await db.select().from(monasteries)
      .where(or(...likeConditions))
      .limit(limit);
    
    return result;
  } catch (error) {
    console.error("Error fetching monasteries by feasts:", error);
    return [];
  }
}

/**
 * Obține mănăstiri dintr-o regiune specifică
 */
async function getMonasteriesByRegion(region: string | undefined, limit: number = 10) {
  try {
    if (!region) {
      // Dacă nu este specificată o regiune, returnăm mănăstiri din regiuni diverse
      const result = await db.select().from(monasteries)
        .orderBy(sql`RANDOM()`)
        .limit(limit);
      return result;
    }

    // Căutăm mănăstiri din regiunea specificată
    const result = await db.select().from(monasteries)
      .where(eq(monasteries.region, region))
      .orderBy(sql`RANDOM()`)
      .limit(limit);
    
    return result;
  } catch (error) {
    console.error("Error fetching monasteries by region:", error);
    return [];
  }
}

/**
 * Obține mănăstiri în apropiere de o locație
 * Folosește formula Haversine pentru calcularea distanței
 */
async function getNearbyMonasteries(lat: number | undefined, lng: number | undefined, limit: number = 10) {
  try {
    if (!lat || !lng) {
      // Dacă nu sunt specificate coordonatele, returnăm mănăstiri aleatorii
      const result = await db.select().from(monasteries)
        .orderBy(sql`RANDOM()`)
        .limit(limit);
      return result;
    }

    // Folosim formula Haversine pentru a calcula distanța
    // în PostgreSQL și a ordona mănăstirile după distanță
    const result = await db.select().from(monasteries)
      .where(and(
        sql`latitude IS NOT NULL`, 
        sql`longitude IS NOT NULL`
      ))
      .orderBy(sql`
        6371 * acos(
          cos(radians(${lat})) * 
          cos(radians(latitude)) * 
          cos(radians(longitude) - radians(${lng})) + 
          sin(radians(${lat})) * 
          sin(radians(latitude))
        )
      `)
      .limit(limit);
    
    return result;
  } catch (error) {
    console.error("Error fetching nearby monasteries:", error);
    return [];
  }
}

/**
 * Obține mănăstiri similare cu o mănăstire specificată
 */
async function getSimilarMonasteries(monasteryId: number | undefined, limit: number = 10) {
  try {
    if (!monasteryId) {
      // Dacă nu este specificat un ID de mănăstire, returnăm mănăstiri aleatorii
      const result = await db.select().from(monasteries)
        .orderBy(sql`RANDOM()`)
        .limit(limit);
      return result;
    }

    // Obținem mănăstirea de referință
    const referenceMonastery = await db.select().from(monasteries)
      .where(eq(monasteries.id, monasteryId))
      .limit(1);
    
    if (!referenceMonastery.length) {
      return [];
    }
    
    const reference = referenceMonastery[0];
    
    // Căutăm mănăstiri similare - din aceeași regiune sau cu același tip
    const result = await db.select().from(monasteries)
      .where(and(
        not(eq(monasteries.id, monasteryId)),
        or(
          eq(monasteries.region, reference.region),
          eq(monasteries.type, reference.type),
          reference.patronSaint ? like(monasteries.patronSaint, `%${reference.patronSaint}%`) : sql`1=1`
        )
      ))
      .orderBy(sql`RANDOM()`)
      .limit(limit);
    
    return result;
  } catch (error) {
    console.error("Error fetching similar monasteries:", error);
    return [];
  }
}

/**
 * Obține cele mai populare mănăstiri
 * În prezent, simplificat să returneze mănăstiri verificate într-o ordine determinată
 */
async function getPopularMonasteries(limit: number = 10) {
  try {
    // În prezent, simplu - returnăm mănăstiri verificate
    // Ar putea fi extins cu metrici de vizitare sau de rating
    const result = await db.select().from(monasteries)
      .where(eq(monasteries.verification, true))
      .orderBy(desc(monasteries.id))
      .limit(limit);
    
    return result;
  } catch (error) {
    console.error("Error fetching popular monasteries:", error);
    return [];
  }
}

/**
 * Obține mănăstiri mai puțin cunoscute dar valoroase
 */
async function getHiddenGemMonasteries(limit: number = 10) {
  try {
    // Folosim un criteriu simplu: mănăstiri verificate, dar din regiuni mai puțin vizitate
    // și cu conținut bogat (descrieri ample)
    const result = await db.select().from(monasteries)
      .where(and(
        eq(monasteries.verification, true),
        or(
          eq(monasteries.region, 'dobrogea'),
          eq(monasteries.region, 'maramures'),
          eq(monasteries.region, 'crisana'),
          eq(monasteries.region, 'banat')
        ),
        sql`LENGTH(description) > 300`
      ))
      .orderBy(sql`RANDOM()`)
      .limit(limit);
    
    return result;
  } catch (error) {
    console.error("Error fetching hidden gem monasteries:", error);
    return [];
  }
}

/**
 * Obține mănăstiri recomandate pentru sezonul specificat (lună)
 */
async function getSeasonalMonasteries(month: number, limit: number = 10) {
  try {
    // Strategii diferite pentru fiecare lună
    switch (month) {
      case 12:
      case 1:
      case 2:
        // Iarna - mănăstiri din regiuni montane cu acces bun
        return await db.select().from(monasteries)
          .where(or(
            eq(monasteries.region, 'bucovina'),
            eq(monasteries.region, 'transilvania')
          ))
          .orderBy(sql`RANDOM()`)
          .limit(limit);
      
      case 3:
      case 4:
      case 5:
        // Primăvara - mănăstiri cu grădini frumoase
        return await db.select().from(monasteries)
          .where(or(
            like(monasteries.specialFeatures, '%grădin%'),
            like(monasteries.specialFeatures, '%parc%'),
            like(monasteries.description, '%grădin%'),
            like(monasteries.description, '%parc%')
          ))
          .orderBy(sql`RANDOM()`)
          .limit(limit);
      
      case 6:
      case 7:
      case 8:
        // Vara - mănăstiri cu activități turistice
        return await db.select().from(monasteries)
          .where(or(
            like(monasteries.specialFeatures, '%activit%'),
            like(monasteries.specialFeatures, '%turis%'),
            like(monasteries.description, '%activit%'),
            like(monasteries.description, '%turis%')
          ))
          .orderBy(sql`RANDOM()`)
          .limit(limit);
      
      case 9:
      case 10:
      case 11:
        // Toamna - mănăstiri din zone cu peisaje frumoase de toamnă
        return await db.select().from(monasteries)
          .where(or(
            eq(monasteries.region, 'moldova'),
            eq(monasteries.region, 'maramures')
          ))
          .orderBy(sql`RANDOM()`)
          .limit(limit);
      
      default:
        return await db.select().from(monasteries)
          .orderBy(sql`RANDOM()`)
          .limit(limit);
    }
  } catch (error) {
    console.error("Error fetching seasonal monasteries:", error);
    return [];
  }
}

/**
 * Formatează o mănăstire pentru răspunsuri API
 */
function formatMonastery(monastery: any) {
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
}