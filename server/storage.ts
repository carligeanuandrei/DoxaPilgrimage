import { users, pilgrimages, reviews, bookings, messages } from "@shared/schema";
import type { 
  User, InsertUser, Pilgrimage, InsertPilgrimage, 
  Review, InsertReview, Booking, InsertBooking,
  Message, InsertMessage 
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Pilgrimage operations
  getPilgrimage(id: number): Promise<Pilgrimage | undefined>;
  getPilgrimages(filters?: Partial<Pilgrimage>): Promise<Pilgrimage[]>;
  createPilgrimage(pilgrimage: InsertPilgrimage): Promise<Pilgrimage>;
  updatePilgrimage(id: number, pilgrimageData: Partial<Pilgrimage>): Promise<Pilgrimage | undefined>;
  
  // Review operations
  getReviews(pilgrimageId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Booking operations
  getBookings(userId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined>;
  
  // Message operations
  getMessages(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pilgrimages: Map<number, Pilgrimage>;
  private reviews: Map<number, Review>;
  private bookings: Map<number, Booking>;
  private messages: Map<number, Message>;
  
  sessionStore: session.SessionStore;
  
  private currentUserId: number;
  private currentPilgrimageId: number;
  private currentReviewId: number;
  private currentBookingId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.pilgrimages = new Map();
    this.reviews = new Map();
    this.bookings = new Map();
    this.messages = new Map();
    
    this.currentUserId = 1;
    this.currentPilgrimageId = 1;
    this.currentReviewId = 1;
    this.currentBookingId = 1;
    this.currentMessageId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Add an admin user for initial setup
    this.createUser({
      username: "admin",
      password: "admin", // This will be hashed by auth.ts
      email: "admin@doxa.com",
      firstName: "Admin",
      lastName: "Doxa",
      role: "admin",
    });
    
    // Add a tour operator
    this.createUser({
      username: "touroperator",
      password: "operator123", // This will be hashed by auth.ts
      email: "operator@doxa.com",
      firstName: "Orthodox",
      lastName: "Tours",
      role: "operator",
      phone: "+40722123456",
      bio: "Organizator de pelerinaje cu experiență de peste 10 ani.",
    });
    
    // Add a monastery account
    this.createUser({
      username: "putnamonastery",
      password: "putna123", // This will be hashed by auth.ts
      email: "putna@monastery.ro",
      firstName: "Mănăstirea",
      lastName: "Putna",
      role: "monastery",
      phone: "+40723456789",
      bio: "Mănăstirea Putna, ctitoria lui Ștefan cel Mare din 1469.",
    });
    
    // Add demo pilgrimages
    this.addDemoPilgrimages();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      verified: insertUser.role === "admin", // Admin is verified by default
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Pilgrimage operations
  async getPilgrimage(id: number): Promise<Pilgrimage | undefined> {
    return this.pilgrimages.get(id);
  }
  
  async getPilgrimages(filters?: Partial<Pilgrimage>): Promise<Pilgrimage[]> {
    let results = Array.from(this.pilgrimages.values());
    
    if (filters) {
      // Filter pilgrimages based on provided filters
      results = results.filter(pilgrimage => {
        for (const [key, value] of Object.entries(filters)) {
          // Skip undefined filters
          if (value === undefined) continue;
          
          // Handle special cases for partial text matching
          if (typeof value === 'string' && typeof pilgrimage[key as keyof Pilgrimage] === 'string') {
            if (!(pilgrimage[key as keyof Pilgrimage] as string).toLowerCase().includes(value.toLowerCase())) {
              return false;
            }
          } 
          // Exact match for other types
          else if (pilgrimage[key as keyof Pilgrimage] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return results;
  }
  
  async createPilgrimage(insertPilgrimage: InsertPilgrimage): Promise<Pilgrimage> {
    const id = this.currentPilgrimageId++;
    const now = new Date();
    const pilgrimage: Pilgrimage = { 
      ...insertPilgrimage, 
      id, 
      createdAt: now,
      verified: false,
      featured: false
    };
    this.pilgrimages.set(id, pilgrimage);
    return pilgrimage;
  }
  
  async updatePilgrimage(id: number, pilgrimageData: Partial<Pilgrimage>): Promise<Pilgrimage | undefined> {
    const pilgrimage = this.pilgrimages.get(id);
    if (!pilgrimage) return undefined;
    
    const updatedPilgrimage = { ...pilgrimage, ...pilgrimageData };
    this.pilgrimages.set(id, updatedPilgrimage);
    return updatedPilgrimage;
  }
  
  // Review operations
  async getReviews(pilgrimageId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.pilgrimageId === pilgrimageId
    );
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const now = new Date();
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt: now,
      verified: false 
    };
    this.reviews.set(id, review);
    return review;
  }
  
  // Booking operations
  async getBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const now = new Date();
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt: now,
      status: "pending",
      paymentStatus: "pending" 
    };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...bookingData };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  // Message operations
  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.toUserId === userId || message.fromUserId === userId
    );
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: now,
      read: false 
    };
    this.messages.set(id, message);
    return message;
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, read: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  // Helper method to add demo pilgrimages
  private addDemoPilgrimages(): void {
    // Helper function to create dates X days from now
    const daysFromNow = (days: number): Date => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    };
    
    // Get IDs of our demo users
    const operatorId = 2; // touroperator
    const monasteryId = 3; // putnamonastery
    
    // 1. Romania - North Moldova (Putna, Sihăstria, Nicula)
    this.createPilgrimage({
      title: "Pelerinaj la Mănăstirile din Moldova de Nord",
      description: "Vizitați cele mai importante mănăstiri din nordul Moldovei, inclusiv Putna, Sucevița, Moldovița, Voroneț și Humor. Bucurați-vă de peisajele pitorești și descoperiți istoria bogată a acestor lăcașuri de cult ortodoxe.",
      location: "Moldova - România",
      month: "Iunie",
      saint: "Ștefan cel Mare",
      startDate: daysFromNow(30),
      endDate: daysFromNow(35),
      price: 450,
      currency: "EUR",
      transportation: "Autocar",
      guide: "Părintele Vasile",
      duration: 6,
      includedServices: ["Transport", "Cazare 5 nopți", "Mic dejun", "Ghid spiritual", "Intrări la obiective"],
      images: ["putna.jpg", "voronet.jpg", "moldovita.jpg"],
      organizerId: monasteryId,
      availableSpots: 30
    });
    
    this.createPilgrimage({
      title: "Pelerinaj la Mănăstirea Sihăstria - Părintele Cleopa",
      description: "Mănăstirea Sihăstria este una dintre cele mai importante așezări monahale din România. Vizitați locul unde a viețuit marele duhovnic Părintele Cleopa și participați la slujbe și rugăciuni în acest loc sfânt.",
      location: "Neamț - România",
      month: "August",
      saint: "Sfântul Paisie de la Neamț",
      startDate: daysFromNow(60),
      endDate: daysFromNow(62),
      price: 250,
      currency: "EUR",
      transportation: "Autocar",
      guide: "Părintele Nicolae",
      duration: 3,
      includedServices: ["Transport", "Cazare 2 nopți", "Mic dejun și cină", "Ghid spiritual"],
      images: ["sihastria1.jpg", "sihastria2.jpg"],
      organizerId: operatorId,
      availableSpots: 25
    });

    this.createPilgrimage({
      title: "Pelerinaj la Mănăstirea Nicula - Icoana Făcătoare de Minuni",
      description: "Mănăstirea Nicula este locul unde se află celebra icoană făcătoare de minuni a Maicii Domnului. În fiecare an, mii de pelerini vin aici pentru a participa la Adormirea Maicii Domnului, una dintre cele mai mari sărbători ortodoxe.",
      location: "Cluj - România",
      month: "August",
      saint: "Maica Domnului",
      startDate: daysFromNow(75),
      endDate: daysFromNow(77),
      price: 220,
      currency: "EUR",
      transportation: "Autocar",
      guide: "Părintele Grigore",
      duration: 3,
      includedServices: ["Transport", "Cazare 2 nopți", "Toate mesele", "Ghid spiritual", "Participare la slujbele de sărbătoare"],
      images: ["nicula1.jpg", "nicula2.jpg"],
      organizerId: operatorId,
      availableSpots: 40
    });
    
    // 2. Grecia - Muntele Athos
    this.createPilgrimage({
      title: "Pelerinaj la Muntele Athos - Grădina Maicii Domnului",
      description: "Muntele Athos, cunoscut și ca Grădina Maicii Domnului, este una dintre cele mai importante comunități monahale din lume. Acest pelerinaj vă oferă posibilitatea de a vizita mănăstirile athonite, de a participa la slujbe și de a vă întâlni cu viața spirituală a călugărilor.",
      location: "Muntele Athos - Grecia",
      month: "Septembrie",
      saint: "Sfântul Atanasie Athonitul",
      startDate: daysFromNow(90),
      endDate: daysFromNow(97),
      price: 750,
      currency: "EUR",
      transportation: "Avion și feribot",
      guide: "Părintele Atanasie",
      duration: 8,
      includedServices: ["Zbor București-Salonic", "Transfer port-aeroport", "Feribot", "Diamonitirion (permis Athos)", "Cazare în mănăstiri", "Ghid spiritual experimentat"],
      images: ["athos1.jpg", "athos2.jpg", "athos3.jpg"],
      organizerId: operatorId,
      availableSpots: 15
    });
    
    this.createPilgrimage({
      title: "Pelerinaj Salonic și Meteora - Pe urmele Sfântului Dimitrie",
      description: "Descoperiți locurile sfinte din Grecia de Nord, inclusiv Salonic, unde se află moaștele Sfântului Dimitrie, izvorâtorul de mir, și complexul monastic Meteora, cu mănăstirile sale spectaculoase construite pe stânci.",
      location: "Salonic și Meteora - Grecia",
      month: "Octombrie",
      saint: "Sfântul Dimitrie",
      startDate: daysFromNow(110),
      endDate: daysFromNow(115),
      price: 580,
      currency: "EUR",
      transportation: "Autocar",
      guide: "Părintele Dimitrie",
      duration: 6,
      includedServices: ["Transport", "Cazare 5 nopți hotel 3*", "Mic dejun", "Ghid spiritual", "Intrări la obiective"],
      images: ["salonic.jpg", "meteora.jpg"],
      organizerId: operatorId,
      availableSpots: 35
    });
    
    // 3. Terra Sfântă (Israel, Palestina, Iordania)
    this.createPilgrimage({
      title: "Pelerinaj în Terra Sfântă - Pe urmele Mântuitorului",
      description: "Un pelerinaj complet în Țara Sfântă, urmând pașii Mântuitorului Iisus Hristos. Veți vizita Ierusalimul, Betleemul, Nazaretul, râul Iordan, Marea Galileii și alte locuri importante menționate în Sfânta Scriptură.",
      location: "Israel și Palestina",
      month: "Aprilie",
      saint: "Învierea Domnului",
      startDate: daysFromNow(180),
      endDate: daysFromNow(187),
      price: 990,
      currency: "EUR",
      transportation: "Avion",
      guide: "Părintele Daniel",
      duration: 8,
      includedServices: ["Zbor București-Tel Aviv", "Transport local", "Cazare 7 nopți hotel 4*", "Demipensiune", "Ghid spiritual", "Ghid local arabofon", "Toate intrările la obiective"],
      images: ["ierusalim.jpg", "betleem.jpg", "nazaret.jpg"],
      organizerId: operatorId,
      availableSpots: 30
    });
    
    this.createPilgrimage({
      title: "Pelerinaj Israel și Iordania - Extindere la Muntele Sinai",
      description: "Un pelerinaj complet care include atât Țara Sfântă cât și locuri importante din Iordania, inclusiv Muntele Nebo, de unde Moise a văzut Pământul Făgăduinței, și Petra. Opțional, vizită la Muntele Sinai în Egipt.",
      location: "Israel, Palestina și Iordania",
      month: "Noiembrie",
      saint: "Sfântul Moise",
      startDate: daysFromNow(200),
      endDate: daysFromNow(210),
      price: 1250,
      currency: "EUR",
      transportation: "Avion",
      guide: "Părintele Moise",
      duration: 11,
      includedServices: ["Zbor București-Tel Aviv", "Transport local", "Cazare 10 nopți hotel 4*", "Demipensiune", "Ghid spiritual", "Ghid local", "Toate intrările la obiective", "Viză Iordania"],
      images: ["iordania.jpg", "sinai.jpg", "petra.jpg"],
      organizerId: operatorId,
      availableSpots: 20
    });
    
    // 4. Italia Catolică (Vatican, Roma, Assisi, Padova)
    this.createPilgrimage({
      title: "Pelerinaj la Roma și Vatican - Bazilicile Romei",
      description: "Vizitați cele mai importante bazilici și biserici din Roma, inclusiv Bazilica Sfântul Petru din Vatican, Bazilica San Giovanni in Laterano, Santa Maria Maggiore și San Paolo fuori le mura.",
      location: "Roma și Vatican - Italia",
      month: "Mai",
      saint: "Sfinții Apostoli Petru și Pavel",
      startDate: daysFromNow(220),
      endDate: daysFromNow(225),
      price: 680,
      currency: "EUR",
      transportation: "Avion",
      guide: "Părintele Pietro",
      duration: 6,
      includedServices: ["Zbor București-Roma", "Transport local", "Cazare 5 nopți hotel 3*", "Mic dejun", "Ghid spiritual", "Audiență papală (când este posibil)"],
      images: ["vatican.jpg", "roma.jpg"],
      organizerId: operatorId,
      availableSpots: 25
    });
    
    this.createPilgrimage({
      title: "Pelerinaj în Italia: Assisi, Padova, Loreto și San Giovanni Rotondo",
      description: "Vizitați locurile legate de Sfântul Francisc (Assisi), Sfântul Anton (Padova), Casa Sfântă a Maicii Domnului (Loreto) și Sfântul Padre Pio (San Giovanni Rotondo).",
      location: "Italia",
      month: "Iulie",
      saint: "Sfântul Francisc și Sfântul Anton",
      startDate: daysFromNow(240),
      endDate: daysFromNow(248),
      price: 790,
      currency: "EUR",
      transportation: "Avion",
      guide: "Părintele Antonio",
      duration: 9,
      includedServices: ["Zbor București-Roma", "Transport local", "Cazare 8 nopți hotel 3*", "Mic dejun", "Ghid spiritual", "Toate intrările la obiective"],
      images: ["assisi.jpg", "padova.jpg", "loreto.jpg"],
      organizerId: operatorId,
      availableSpots: 30
    });

    // Mark some pilgrimages as verified and featured
    const pilgrimages = Array.from(this.pilgrimages.values());
    for (const pilgrimage of pilgrimages) {
      // Verify all pilgrimages for demo
      this.updatePilgrimage(pilgrimage.id, { verified: true });
      
      // Feature some pilgrimages
      if ([1, 4, 7, 9].includes(pilgrimage.id)) {
        this.updatePilgrimage(pilgrimage.id, { featured: true });
      }
    }
    
    // Add some reviews
    this.createReview({
      pilgrimageId: 1,
      userId: 1,
      rating: 5,
      comment: "O experiență spirituală deosebită. Mănăstirile din Moldova sunt incredibile, frescele de la Voroneț sunt uimitoare!"
    });
    
    this.createReview({
      pilgrimageId: 4,
      userId: 1,
      rating: 5,
      comment: "Muntele Athos este cu adevărat Grădina Maicii Domnului. Experiența va rămâne în sufletul meu pentru totdeauna."
    });
    
    this.createReview({
      pilgrimageId: 7,
      userId: 1,
      rating: 5,
      comment: "Să pășești pe urmele Mântuitorului este o experiență transformatoare. Ierusalimul este exact cum mi-l imaginam!"
    });
  }
}

export const storage = new MemStorage();
