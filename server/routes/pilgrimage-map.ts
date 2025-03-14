import { Request, Response } from 'express';
import { Express } from 'express';
import { storage } from '../storage';

// Interfața pentru datele hărții interactive
interface MapDataPoint {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  accesses: number;
  reservations: number;
  value: number; // Valoarea de afișare pe hartă (dimensiunea punctului)
  completedReservations: number;
  incompleteReservations: number;
  type: 'user' | 'organizer';
  aiInteractions?: number;
}

/**
 * Înregistrează rutele pentru harta interactivă
 */
export async function registerPilgrimageMapRoutes(app: Express) {
  /**
   * GET /api/admin/interactive-map
   * Returnează datele pentru harta interactivă
   * Restricționat doar pentru administratori
   */
  app.get('/api/admin/interactive-map', async (req: Request, res: Response) => {
    try {
      // Verificăm dacă utilizatorul este admin
      if (!req.isAuthenticated || !req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acces restricționat doar pentru administratori' });
      }

      // Filtrare opțională după perioada de timp
      const { period = 'all' } = req.query;
      
      // În implementarea reală, aici ar trebui să interogăm baza de date
      // pentru a obține date reale despre accesări, rezervări, etc.
      // Pentru demonstrație, generăm date de exemplu

      // Obținem toate rezervările pentru a calcula statistici
      const allBookings = await getAllBookings();
      
      // Orașe din România cu interacțiuni 
      const mapData: MapDataPoint[] = [
        {
          city: 'București',
          country: 'România',
          latitude: 44.4268,
          longitude: 26.1025,
          accesses: 532,
          reservations: 48,
          completedReservations: 48,
          incompleteReservations: 15,
          type: 'user',
          value: 100,
          aiInteractions: 89
        },
        {
          city: 'Cluj-Napoca',
          country: 'România',
          latitude: 46.7712,
          longitude: 23.6236,
          accesses: 221,
          reservations: 23,
          completedReservations: 23,
          incompleteReservations: 8,
          type: 'user',
          value: 70,
          aiInteractions: 42
        },
        {
          city: 'Iași',
          country: 'România',
          latitude: 47.1585,
          longitude: 27.6014,
          accesses: 198,
          reservations: 15,
          completedReservations: 0,
          incompleteReservations: 15,
          type: 'user',
          value: 60,
          aiInteractions: 37
        },
        {
          city: 'Londra',
          country: 'Marea Britanie',
          latitude: 51.5074,
          longitude: -0.1278,
          accesses: 73,
          reservations: 9,
          completedReservations: 9,
          incompleteReservations: 2,
          type: 'user',
          value: 30,
          aiInteractions: 21
        },
        {
          city: 'Atena',
          country: 'Grecia',
          latitude: 37.9838,
          longitude: 23.7275,
          accesses: 62,
          reservations: 6,
          completedReservations: 6,
          incompleteReservations: 0,
          type: 'user',
          value: 25,
          aiInteractions: 14
        },
        {
          city: 'Roma',
          country: 'Italia',
          latitude: 41.9028,
          longitude: 12.4964,
          accesses: 47,
          reservations: 5,
          completedReservations: 5,
          incompleteReservations: 1,
          type: 'user',
          value: 20,
          aiInteractions: 13
        },
        {
          city: 'Timișoara',
          country: 'România',
          latitude: 45.7489,
          longitude: 21.2087,
          accesses: 132,
          reservations: 17,
          completedReservations: 17,
          incompleteReservations: 3,
          type: 'user',
          value: 45,
          aiInteractions: 28
        },
        {
          city: 'Brașov',
          country: 'România',
          latitude: 45.6427,
          longitude: 25.5887,
          accesses: 158,
          reservations: 19,
          completedReservations: 19,
          incompleteReservations: 4,
          type: 'user',
          value: 50,
          aiInteractions: 31
        }
      ];

      // Calculăm totalurile pentru statistici
      const totalAccesses = mapData.reduce((sum, point) => sum + point.accesses, 0);
      const totalReservations = mapData.reduce((sum, point) => sum + point.reservations, 0);
      const totalCompletedReservations = mapData.reduce((sum, point) => sum + point.completedReservations, 0);
      const totalIncompleteReservations = mapData.reduce((sum, point) => sum + point.incompleteReservations, 0);
      const totalAiInteractions = mapData.reduce((sum, point) => sum + (point.aiInteractions || 0), 0);

      // Construim recomandările
      const recommendations = [
        {
          type: 'high_activity',
          message: 'București și Cluj-Napoca au cea mai mare activitate. Sugestie: Targetare cu reclame pentru utilizatorii care nu au finalizat rezervarea.',
          importance: 'high'
        },
        {
          type: 'incomplete_reservations',
          message: 'Iași are multe rezervări incomplete. Sugestie: Trimiterea unui reminder automat pentru documentele lipsă.',
          importance: 'medium'
        },
        {
          type: 'international_growth',
          message: 'Creștere semnificativă a accesărilor din Londra și Atena. Sugestie: Adăugarea unei pagini în engleză pentru utilizatorii din diaspora.',
          importance: 'high'
        }
      ];

      // Returnăm datele pentru hartă și statisticile
      return res.json({
        mapData,
        statistics: {
          totalAccesses,
          totalReservations,
          totalCompletedReservations,
          totalIncompleteReservations,
          totalAiInteractions,
          interactionRatio: (totalAiInteractions / totalAccesses * 100).toFixed(1),
          completionRate: (totalCompletedReservations / totalReservations * 100).toFixed(1),
          date: new Date().toISOString()
        },
        recommendations
      });
    } catch (error) {
      console.error('Error retrieving interactive map data:', error);
      res.status(500).json({ message: 'A apărut o eroare la obținerea datelor pentru harta interactivă' });
    }
  });

  /**
   * GET /api/admin/daily-report
   * Returnează raportul zilnic pentru administrator
   * Restricționat doar pentru administratori
   */
  app.get('/api/admin/daily-report', async (req: Request, res: Response) => {
    try {
      // Verificăm dacă utilizatorul este admin
      if (!req.isAuthenticated || !req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acces restricționat doar pentru administratori' });
      }

      // Pentru demonstrație, returnăm un raport zilnic
      const dailyReport = {
        date: new Date().toISOString(),
        userStats: {
          activeUsers: 132,
          newReservations: 47,
          incompleteReservations: 12
        },
        userFeedback: [
          {
            issue: 'Contactarea directă a organizatorilor',
            count: 8,
            suggestion: 'Adăugarea unei funcții de chat rapid în platformă'
          },
          {
            issue: 'Confirmări de rezervare pe email',
            count: 5,
            suggestion: 'Verificarea serverului de email și adăugarea unei notificări în aplicație'
          },
          {
            issue: 'Procesul de plată prin transfer bancar',
            count: 3,
            suggestion: 'Adăugarea unui ghid pas cu pas pentru această metodă de plată'
          }
        ],
        organizerFeedback: [
          {
            issue: 'Actualizarea listei de participanți în timp real',
            count: 2,
            suggestion: 'Oferirea unei funcții de editare live a listelor'
          },
          {
            issue: 'Descărcarea simultană a documentelor utilizatorilor',
            count: 1,
            suggestion: 'Adăugarea unui buton „Descarcă toate documentele" pentru fiecare pachet'
          }
        ],
        recommendations: [
          'Integrarea unui sistem de chat între utilizatori și organizatori',
          'Optimizarea notificărilor prin email pentru confirmarea rezervărilor', 
          'Crearea unui tutorial video despre metodele de plată'
        ]
      };

      return res.json(dailyReport);
    } catch (error) {
      console.error('Error generating daily report:', error);
      res.status(500).json({ message: 'A apărut o eroare la generarea raportului zilnic' });
    }
  });
}

/**
 * Funcție auxiliară pentru obținerea tuturor rezervărilor
 * În implementarea reală, acest lucru ar veni direct din baza de date
 */
async function getAllBookings() {
  // În implementarea reală, am obține toate rezervările
  // Pentru demonstrație, returnăm un array gol
  return [];
}