import { 
  users, pilgrimages, reviews, bookings, messages,
  products, orders, orderItems, productReviews, cmsContent,
  builderPages, fastingRecipes, recipeComments
} from "@shared/schema";
import type { 
  User, InsertUser, Pilgrimage, InsertPilgrimage, 
  Review, InsertReview, Booking, InsertBooking,
  Message, InsertMessage, VerificationData,
  Product, InsertProduct, Order, InsertOrder,
  OrderItem, InsertOrderItem, ProductReview, InsertProductReview,
  CmsContent, InsertCmsContent, BuilderPage, InsertBuilderPage,
  FastingRecipe, InsertFastingRecipe, RecipeComment, InsertRecipeComment
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { db } from "./db";
import { eq, and, like, ilike, or, desc, sql } from "drizzle-orm";
import * as crypto from "crypto";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";

// Definim global updatedAdminUser pentru a stoca datele actualizate
declare global {
  var updatedAdminUser: User | undefined;
}

const { Pool } = pg;

const MemoryStore = createMemoryStore(session);
const PostgresStore = connectPgSimple(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Verification operations
  createVerificationToken(userId: number, email: string): Promise<string>;
  verifyUserEmail(token: string): Promise<boolean>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  
  // Password reset operations
  createPasswordResetToken(userId: number, email: string): Promise<string>;
  resetPasswordWithToken(token: string, newPassword: string): Promise<boolean>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  
  // Two-factor authentication operations
  createTwoFactorCode(userId: number): Promise<string>;
  verifyTwoFactorCode(userId: number, code: string): Promise<boolean>;
  resetTwoFactorCode(userId: number): Promise<void>;
  
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
  getBookingsByPilgrimageId(pilgrimageId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined>;
  
  // Message operations
  getMessages(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // CMS operations
  getCmsContent(key?: string): Promise<CmsContent[] | CmsContent | undefined>;
  createCmsContent(content: InsertCmsContent): Promise<CmsContent>;
  updateCmsContent(key: string, content: Partial<CmsContent>): Promise<CmsContent | undefined>;
  deleteCmsContent(key: string): Promise<boolean>;
  
  // Builder Pages operations
  getBuilderPages(): Promise<BuilderPage[]>;
  getBuilderPage(id: number): Promise<BuilderPage | undefined>;
  getBuilderPageBySlug(slug: string): Promise<BuilderPage | undefined>;
  getBuilderPageByType(pageType: string): Promise<BuilderPage | undefined>;
  createBuilderPage(page: InsertBuilderPage): Promise<BuilderPage>;
  updateBuilderPage(id: number, page: Partial<BuilderPage>): Promise<BuilderPage | undefined>;
  deleteBuilderPage(id: number): Promise<boolean>;
  
  // Fasting Recipes operations
  getRecipe(id: number): Promise<FastingRecipe | undefined>;
  getRecipeBySlug(slug: string): Promise<FastingRecipe | undefined>;
  getRecipes(filters?: Partial<FastingRecipe>): Promise<FastingRecipe[]>;
  getRecipesByType(recipeType: string): Promise<FastingRecipe[]>;
  getRecipesByCategory(category: string): Promise<FastingRecipe[]>;
  getRecipesForDay(dayOfWeek: string): Promise<FastingRecipe[]>;
  getMonasteryRecipes(monasteryId: number): Promise<FastingRecipe[]>;
  getFeaturedRecipes(limit?: number): Promise<FastingRecipe[]>;
  getRecipeComments(recipeId: number): Promise<RecipeComment[]>;
  createRecipe(recipe: InsertFastingRecipe): Promise<FastingRecipe>;
  updateRecipe(id: number, recipe: Partial<FastingRecipe>): Promise<FastingRecipe | undefined>;
  deleteRecipe(id: number): Promise<boolean>;
  createRecipeComment(comment: InsertRecipeComment): Promise<RecipeComment>;
  deleteRecipeComment(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pilgrimages: Map<number, Pilgrimage>;
  private reviews: Map<number, Review>;
  private bookings: Map<number, Booking>;
  private messages: Map<number, Message>;
  private builderPages: Map<number, BuilderPage>;
  
  sessionStore: any;
  
  private currentUserId: number;
  private currentPilgrimageId: number;
  private currentReviewId: number;
  private currentBookingId: number;
  private currentMessageId: number;
  private currentBuilderPageId: number;

  constructor() {
    this.users = new Map();
    this.pilgrimages = new Map();
    this.reviews = new Map();
    this.bookings = new Map();
    this.messages = new Map();
    this.builderPages = new Map();
    
    this.currentUserId = 1;
    this.currentPilgrimageId = 1;
    this.currentReviewId = 1;
    this.currentBookingId = 1;
    this.currentMessageId = 1;
    this.currentBuilderPageId = 1;
    
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
  
  // Get all users
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Verification operations
  async createVerificationToken(userId: number, email: string): Promise<string> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Create a random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiry for 24 hours
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);
    
    // Update user with token and expiry
    await this.updateUser(userId, {
      verificationToken: token,
      tokenExpiry
    });
    
    return token;
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token
    );
  }
  
  async verifyUserEmail(token: string): Promise<boolean> {
    const user = await this.getUserByVerificationToken(token);
    if (!user) return false;
    
    // Check if token expired
    const now = new Date();
    if (user.tokenExpiry && user.tokenExpiry < now) {
      return false;
    }
    
    // Verify the user
    await this.updateUser(user.id, {
      verified: true,
      verificationToken: null,
      tokenExpiry: null
    });
    
    return true;
  }
  
  // Password reset operations
  async createPasswordResetToken(userId: number, email: string): Promise<string> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Create a random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiry for 1 hour
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);
    
    // Update user with token and expiry
    await this.updateUser(userId, {
      resetToken: token,
      resetTokenExpiry
    });
    
    return token;
  }
  
  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetToken === token
    );
  }
  
  async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserByResetToken(token);
    if (!user) return false;
    
    // Check if token expired
    const now = new Date();
    if (user.resetTokenExpiry && user.resetTokenExpiry < now) {
      return false;
    }
    
    // Update password and clear token
    await this.updateUser(user.id, {
      password: newPassword,
      resetToken: null,
      resetTokenExpiry: null
    });
    
    return true;
  }
  
  // Two-factor authentication operations
  async createTwoFactorCode(userId: number): Promise<string> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry for 5 minutes
    const twoFactorExpiry = new Date();
    twoFactorExpiry.setMinutes(twoFactorExpiry.getMinutes() + 5);
    
    // Update user with code and expiry
    await this.updateUser(userId, {
      twoFactorCode: code,
      twoFactorExpiry
    });
    
    return code;
  }
  
  async verifyTwoFactorCode(userId: number, code: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.twoFactorCode) return false;
    
    // Check if code matches and not expired
    const now = new Date();
    if (user.twoFactorCode !== code || (user.twoFactorExpiry && user.twoFactorExpiry < now)) {
      return false;
    }
    
    return true;
  }
  
  async resetTwoFactorCode(userId: number): Promise<void> {
    await this.updateUser(userId, {
      twoFactorCode: null,
      twoFactorExpiry: null
    });
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
      featured: false,
      // Asigurăm-ne că includedServices și excludedServices sunt întotdeauna arrays
      includedServices: insertPilgrimage.includedServices || [],
      excludedServices: insertPilgrimage.excludedServices || []
    };
    this.pilgrimages.set(id, pilgrimage);
    return pilgrimage;
  }
  
  async updatePilgrimage(id: number, pilgrimageData: Partial<Pilgrimage>): Promise<Pilgrimage | undefined> {
    const pilgrimage = this.pilgrimages.get(id);
    if (!pilgrimage) return undefined;
    
    // Asigurăm-ne că includedServices și excludedServices sunt întotdeauna arrays
    if (pilgrimageData.includedServices === undefined && pilgrimage.includedServices === undefined) {
      pilgrimageData.includedServices = [];
    }
    
    if (pilgrimageData.excludedServices === undefined && pilgrimage.excludedServices === undefined) {
      pilgrimageData.excludedServices = [];
    }
    
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
  
  async getBookingsByPilgrimageId(pilgrimageId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.pilgrimageId === pilgrimageId
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

  // CMS operations
  private cmsContent: Map<string, CmsContent> = new Map();
  private currentCmsId: number = 1;

  async getCmsContent(key?: string): Promise<CmsContent[] | CmsContent | undefined> {
    if (key) {
      // Returnează un singur element după cheie
      return Array.from(this.cmsContent.values()).find((item) => item.key === key);
    } else {
      // Returnează toate elementele
      return Array.from(this.cmsContent.values());
    }
  }

  async createCmsContent(content: InsertCmsContent): Promise<CmsContent> {
    const id = this.currentCmsId++;
    const now = new Date();
    const cmsItem: CmsContent = {
      ...content,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.cmsContent.set(content.key, cmsItem);
    return cmsItem;
  }

  async updateCmsContent(key: string, content: Partial<CmsContent>): Promise<CmsContent | undefined> {
    const existingContent = Array.from(this.cmsContent.values()).find((item) => item.key === key);
    if (!existingContent) return undefined;

    const updatedContent = { 
      ...existingContent, 
      ...content, 
      updatedAt: new Date() 
    };
    
    this.cmsContent.set(key, updatedContent);
    return updatedContent;
  }

  async deleteCmsContent(key: string): Promise<boolean> {
    const content = Array.from(this.cmsContent.values()).find((item) => item.key === key);
    if (!content) return false;

    this.cmsContent.delete(key);
    return true;
  }
  
  // Builder Pages operations
  async getBuilderPages(): Promise<BuilderPage[]> {
    return Array.from(this.builderPages.values());
  }
  
  async getBuilderPage(id: number): Promise<BuilderPage | undefined> {
    return this.builderPages.get(id);
  }
  
  async getBuilderPageBySlug(slug: string): Promise<BuilderPage | undefined> {
    return Array.from(this.builderPages.values()).find(
      (page) => page.slug === slug
    );
  }
  
  async getBuilderPageByType(pageType: string): Promise<BuilderPage | undefined> {
    return Array.from(this.builderPages.values()).find(
      (page) => page.pageType === pageType && page.isPublished
    );
  }
  
  async createBuilderPage(insertPage: InsertBuilderPage): Promise<BuilderPage> {
    const id = this.currentBuilderPageId++;
    const now = new Date();
    const page: BuilderPage = {
      ...insertPage,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.builderPages.set(id, page);
    return page;
  }
  
  async updateBuilderPage(id: number, pageData: Partial<BuilderPage>): Promise<BuilderPage | undefined> {
    const page = this.builderPages.get(id);
    if (!page) return undefined;
    
    const updatedPage = { 
      ...page, 
      ...pageData,
      updatedAt: new Date()
    };
    this.builderPages.set(id, updatedPage);
    return updatedPage;
  }
  
  async deleteBuilderPage(id: number): Promise<boolean> {
    if (!this.builderPages.has(id)) return false;
    
    this.builderPages.delete(id);
    return true;
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

// Implementarea storage-ului pentru PostgreSQL
export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Importăm Pool din pachetul pg ce a fost importat global
    // Inițializăm session store pentru PostgreSQL
    this.sessionStore = new PostgresStore({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
      }),
      createTableIfMissing: true
    });
  }
  
  // Get all users
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      verified: insertUser.role === "admin", // Admin is verified by default
      createdAt: new Date(),
      verificationToken: null,
      tokenExpiry: null
    }).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Verificăm dacă utilizatorul este administratorul (ID special 9999)
    if (id === 9999) {
      // Pentru adminul virtual, simulăm actualizarea returnând datele actualizate
      const adminUser: User = {
        id: 9999,
        username: 'avatour',
        password: 'protected',
        email: userData.email || 'admin@doxa.ro',
        firstName: userData.firstName || 'Admin',
        lastName: userData.lastName || 'Doxa',
        phone: userData.phone !== undefined ? userData.phone : null,
        role: 'admin',
        verified: true,
        verificationToken: null,
        tokenExpiry: null,
        resetToken: null,
        resetTokenExpiry: null,
        twoFactorCode: null,
        twoFactorExpiry: null,
        bio: userData.bio !== undefined ? userData.bio : null,
        profileImage: userData.profileImage !== undefined ? userData.profileImage : null,
        createdAt: new Date()
      };
      
      // Actualizam sesiunea curenta
      global.updatedAdminUser = adminUser;
        
      return adminUser;
    }
    
    // Pentru utilizatorii normali, folosim baza de date
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Verification operations
  async createVerificationToken(userId: number, email: string): Promise<string> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    // Create a random token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiry for 24 hours
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);

    // Update user with token and expiry
    await this.updateUser(userId, {
      verificationToken: token,
      tokenExpiry
    });

    return token;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user;
  }

  async verifyUserEmail(token: string): Promise<boolean> {
    const user = await this.getUserByVerificationToken(token);
    if (!user) return false;

    // Check if token expired
    const now = new Date();
    if (user.tokenExpiry && user.tokenExpiry < now) {
      return false;
    }

    // Verify the user
    await this.updateUser(user.id, {
      verified: true,
      verificationToken: null,
      tokenExpiry: null
    });

    return true;
  }

  // Pilgrimage operations
  async getPilgrimage(id: number): Promise<Pilgrimage | undefined> {
    const [pilgrimage] = await db.select().from(pilgrimages).where(eq(pilgrimages.id, id));
    return pilgrimage;
  }

  async getPilgrimages(filters?: Partial<Pilgrimage>): Promise<Pilgrimage[]> {
    let query = db.select().from(pilgrimages);

    // Verificăm dacă există coloana status în tabelă
    let hasStatusColumn = true;
    try {
      // Încercăm să facem o interogare simplă pentru a verifica existența coloanei
      await db.select({ status: pilgrimages.status }).from(pilgrimages).limit(1);
    } catch (err) {
      console.log("Coloana status nu există în tabela pilgrimages");
      hasStatusColumn = false;
    }

    // Aplicăm filtrele
    if (filters) {
      if (filters.location) {
        query = query.where(ilike(pilgrimages.location, `%${filters.location}%`));
      }
      if (filters.month) {
        query = query.where(eq(pilgrimages.month, filters.month));
      }
      if (filters.saint && filters.saint.length > 0) {
        query = query.where(ilike(pilgrimages.saint, `%${filters.saint}%`));
      }
      if (filters.transportation) {
        query = query.where(eq(pilgrimages.transportation, filters.transportation));
      }
      if (filters.guide) {
        query = query.where(ilike(pilgrimages.guide, `%${filters.guide}%`));
      }
      if (filters.organizerId) {
        query = query.where(eq(pilgrimages.organizerId, filters.organizerId));
      }
      // Folosim featured pentru a determina recomandările
      if (filters.featured !== undefined) {
        try {
          query = query.where(eq(pilgrimages.featured, filters.featured));
        } catch (err) {
          console.error("Eroare la filtrarea după featured:", err);
        }
      }
      // Filtrare după verified
      if (filters.verified !== undefined) {
        try {
          query = query.where(eq(pilgrimages.verified, filters.verified));
        } catch (err) {
          console.error("Eroare la filtrarea după verified:", err);
        }
      }
      // Filtrare după promoted (pelerinaje promovate)
      if (filters.promoted !== undefined) {
        try {
          query = query.where(eq(pilgrimages.promoted, filters.promoted));
        } catch (err) {
          console.error("Eroare la filtrarea după promoted:", err);
        }
      }
      
      // Aplicăm status doar dacă există coloana în tabelă
      if (hasStatusColumn && filters.status) {
        query = query.where(eq(pilgrimages.status, filters.status));
      }
    } else {
      // Implicit filtrăm după verified pentru a arăta doar pelerinajele verificate
      query = query.where(eq(pilgrimages.verified, true));
      console.log("Arăt doar pelerinajele verificate pentru utilizatorii obișnuiți");
    }

    console.log("Filtre aplicate pentru lista de pelerinaje:", filters || { verified: true });
    return await query;
  }

  async createPilgrimage(insertPilgrimage: InsertPilgrimage): Promise<Pilgrimage> {
    console.log("Storage: Creez pelerinaj cu datele:", insertPilgrimage);
    
    try {
      // Verificăm dacă coloana status există în tabelă
      let valuesObject: any = {
        ...insertPilgrimage,
        verified: false,
        featured: false,
        promoted: false,
        promotionLevel: 'none',
        createdAt: new Date()
      };
      
      // Verificăm schema tabelei pentru a vedea dacă există coloana status
      try {
        // Încercăm să facem o interogare simplă pentru a verifica existența coloanei
        const result = await db.select({ status: pilgrimages.status }).from(pilgrimages).limit(1);
        // Dacă ajungem aici, înseamnă că coloana există, așa că o setăm
        valuesObject.status = "draft";
        console.log("Storage: Coloana status există, setez status=draft");
      } catch (err) {
        // Dacă avem eroare, probabil coloana nu există, așa că nu o includem
        console.log("Storage: Coloana status nu există, ignorăm acest câmp");
        // Eliminăm statutul din obiect pentru a evita eroarea
        delete valuesObject.status;
      }
      
      // Inserăm în baza de date
      const [pilgrimage] = await db.insert(pilgrimages).values(valuesObject).returning();
      
      console.log("Storage: Pelerinaj creat cu succes:", pilgrimage.id);
      return pilgrimage;
    } catch (error) {
      console.error("Eroare în storage la crearea pelerinajului:", error);
      throw error;
    }
  }

  async updatePilgrimage(id: number, pilgrimageData: Partial<Pilgrimage>): Promise<Pilgrimage | undefined> {
    const [updatedPilgrimage] = await db.update(pilgrimages)
      .set(pilgrimageData)
      .where(eq(pilgrimages.id, id))
      .returning();
    return updatedPilgrimage;
  }

  // Review operations
  async getReviews(pilgrimageId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.pilgrimageId, pilgrimageId));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values({
      ...insertReview,
      verified: false,
      createdAt: new Date()
    }).returning();
    return review;
  }

  // Booking operations
  async getBookings(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }
  
  async getBookingsByPilgrimageId(pilgrimageId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.pilgrimageId, pilgrimageId));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values({
      ...insertBooking,
      status: "pending",
      paymentStatus: "pending",
      paymentId: null,
      createdAt: new Date()
    }).returning();
    return booking;
  }

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db.update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Message operations
  async getMessages(userId: number): Promise<Message[]> {
    return await db.select().from(messages).where(
      or(
        eq(messages.toUserId, userId),
        eq(messages.fromUserId, userId)
      )
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values({
      ...insertMessage,
      read: false,
      createdAt: new Date()
    }).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db.update(messages)
      .set({ read: true })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  // CMS operations
  async getCmsContent(key?: string): Promise<CmsContent[] | CmsContent | undefined> {
    try {
      if (key) {
        // Returnează un singur element după cheie
        console.log(`[DEBUG] Fetching CMS content for key "${key}"`);
        
        // Selectăm explicit fiecare coloană folosind numele corecte
        const content = await db.select({
          id: cmsContent.id,
          key: cmsContent.key,
          value: cmsContent.value,
          content_type: cmsContent.content_type,
          createdAt: cmsContent.createdAt,
          updatedAt: cmsContent.updatedAt
        }).from(cmsContent).where(eq(cmsContent.key, key));
        
        console.log(`[DEBUG] Found ${content.length} CMS items for key "${key}"`);
        
        if (content.length > 0) {
          // Mapăm la formatul așteptat în restul aplicației
          const result = {
            ...content[0],
            contentType: content[0].content_type // Adăugăm alias camelCase pentru compatibilitate
          };
          
          console.log(`[DEBUG] Returning content for "${key}":`, {
            id: result.id,
            contentType: result.contentType
          });
          
          return result;
        }
        
        console.log(`[DEBUG] No content found for key "${key}"`);
        return undefined; // Returnăm undefined dacă nu găsim nimic
      } else {
        // Returnează toate elementele, selectând explicit coloanele
        const results = await db.select({
          id: cmsContent.id,
          key: cmsContent.key,
          value: cmsContent.value,
          content_type: cmsContent.content_type,
          createdAt: cmsContent.createdAt,
          updatedAt: cmsContent.updatedAt
        }).from(cmsContent);
        
        // Adăugăm alias contentType pentru compatibilitate cu codul existent
        const mappedResults = results.map(item => ({
          ...item,
          contentType: item.content_type
        }));
        
        console.log(`[DEBUG] Found ${results.length} total CMS items`);
        return mappedResults;
      }
    } catch (error) {
      console.error(`[ERROR] Error fetching CMS content for key=${key}:`, error);
      console.error('Trying fallback approach...');
      try {
        // Abordare alternativă pentru compatibilitate
        if (key) {
          const [row] = await db.execute(
            `SELECT id, key, value, content_type as "contentType", created_at as "createdAt", updated_at as "updatedAt"
             FROM cms_content WHERE key = $1`, 
            [key]
          );
          
          if (row) {
            return { ...row, description: undefined };
          }
          return undefined;
        } else {
          const rows = await db.execute(
            `SELECT id, key, value, content_type as "contentType", created_at as "createdAt", updated_at as "updatedAt" 
             FROM cms_content`
          );
          return rows.map(row => ({ ...row, description: undefined }));
        }
      } catch (fallbackError) {
        console.error('Fallback approach also failed:', fallbackError);
        // Aruncăm eroarea originală
        throw error;
      }
    }
  }

  async createCmsContent(content: InsertCmsContent): Promise<CmsContent> {
    // Scriem în log-uri datele primite pentru debugging
    console.log('Trying to create CMS content with data:', JSON.stringify(content));
    
    // Adaptăm datele pentru ambele formate posibile - camelCase și snake_case
    // În cazul în care primim content_type în loc de contentType, sau invers
    const contentTypeValue = content.contentType || (content as any).content_type;
    
    // Pregătim datele pentru inserare, folosind corect content_type (snake_case) pentru baza de date
    const insertData = {
      key: content.key,
      value: content.value,
      content_type: contentTypeValue, // Folosim formatul corect pentru baza de date (snake_case)
      created_at: new Date(), // Folosim snake_case pentru timestamp-uri
      updated_at: new Date()
    };
    
    console.log('Inserting data with adapted field names:', JSON.stringify(insertData));
    
    try {
      // Verificăm dacă există deja un element cu această cheie
      const existingContent = await this.getCmsContent(content.key);
      if (existingContent) {
        console.log(`Content with key ${content.key} already exists, updating instead of creating`);
        return this.updateCmsContent(content.key, content) as Promise<CmsContent>;
      }
      
      // Executăm SQL direct pentru a evita probleme de mapare a numelor de câmpuri
      const result = await db.execute(`
        INSERT INTO cms_content (key, value, content_type, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, key, value, content_type, created_at, updated_at
      `, [
        insertData.key, 
        insertData.value, 
        insertData.content_type,
        insertData.created_at,
        insertData.updated_at
      ]);
      
      if (result && result.rows && result.rows.length > 0) {
        // Creem un obiect cu formatarea corectă pentru clientul aplicației
        const createdItem = {
          id: result.rows[0].id,
          key: result.rows[0].key,
          value: result.rows[0].value,
          contentType: result.rows[0].content_type, // Adăugăm alias camelCase pentru compatibilitate
          createdAt: result.rows[0].created_at,
          updatedAt: result.rows[0].updated_at
        };
        console.log('CMS item created successfully:', createdItem);
        return createdItem as CmsContent;
      }
      
      throw new Error('Failed to create CMS content, no rows returned');
    } catch (error) {
      console.error('Error creating CMS content:', error);
      throw error;
    }
  }

  async updateCmsContent(key: string, content: Partial<CmsContent>): Promise<CmsContent | undefined> {
    try {
      console.log('Updating CMS content for key:', key, 'with data:', JSON.stringify(content));
      
      // Extragem doar câmpurile care există în baza de date și le adaptăm la snake_case
      const contentTypeValue = content.contentType || (content as any).content_type;
      
      // Pregătim datele pentru SQL direct
      const updateFields = [];
      const updateValues = [];
      let paramCounter = 1;
      
      if (content.value !== undefined) {
        updateFields.push(`value = $${paramCounter}`);
        updateValues.push(content.value);
        paramCounter++;
      }
      
      if (contentTypeValue !== undefined) {
        updateFields.push(`content_type = $${paramCounter}`);
        updateValues.push(contentTypeValue);
        paramCounter++;
      }
      
      // Mereu actualizăm data
      updateFields.push(`updated_at = $${paramCounter}`);
      updateValues.push(new Date());
      paramCounter++;
      
      // Dacă nu avem câmpuri de actualizat, returnăm conținutul existent
      if (updateFields.length === 1 && updateFields[0].startsWith('updated_at')) {
        const existingContent = await this.getCmsContent(key);
        return Array.isArray(existingContent) ? existingContent[0] : existingContent;
      }
      
      // Adăugăm condiția WHERE și executăm SQL
      const updateQuery = `
        UPDATE cms_content 
        SET ${updateFields.join(', ')}
        WHERE key = $${paramCounter}
        RETURNING id, key, value, content_type, created_at, updated_at
      `;
      
      // Adăugăm cheia ca ultimul parametru pentru WHERE
      updateValues.push(key);
      
      console.log('Executing update query:', updateQuery, 'with values:', updateValues);
      
      const result = await db.execute(updateQuery, updateValues);
      
      if (result && result.rows && result.rows.length > 0) {
        // Mapăm la formatul așteptat în restul aplicației
        const updatedItem = {
          id: result.rows[0].id,
          key: result.rows[0].key,
          value: result.rows[0].value,
          contentType: result.rows[0].content_type, // Adăugăm alias camelCase pentru compatibilitate
          createdAt: result.rows[0].created_at,
          updatedAt: result.rows[0].updated_at,
        };
        console.log('CMS item updated successfully:', updatedItem);
        return updatedItem as CmsContent;
      }
      
      console.log('No CMS item found with key:', key);
      return undefined;
    } catch (error) {
      console.error('Error updating CMS content:', error);
      throw error;
    }
  }

  async deleteCmsContent(key: string): Promise<boolean> {
    try {
      console.log('Deleting CMS content with key:', key);
      
      const result = await db.execute(`
        DELETE FROM cms_content 
        WHERE key = $1
        RETURNING id
      `, [key]);
      
      const deleted = result && result.rows && result.rows.length > 0;
      console.log('CMS item deleted:', deleted ? 'yes' : 'no');
      
      return deleted;
    } catch (error) {
      console.error('Error deleting CMS content:', error);
      throw error;
    }
  }
  
  // Builder Pages operations
  async getBuilderPages(): Promise<BuilderPage[]> {
    try {
      const pages = await db.select().from(builderPages);
      return pages;
    } catch (error) {
      console.error('Error fetching builder pages:', error);
      return [];
    }
  }
  
  async getBuilderPage(id: number): Promise<BuilderPage | undefined> {
    try {
      const [page] = await db.select().from(builderPages).where(eq(builderPages.id, id));
      return page;
    } catch (error) {
      console.error('Error fetching builder page by ID:', error);
      return undefined;
    }
  }
  
  async getBuilderPageBySlug(slug: string): Promise<BuilderPage | undefined> {
    try {
      const [page] = await db.select().from(builderPages).where(eq(builderPages.slug, slug));
      return page;
    } catch (error) {
      console.error('Error fetching builder page by slug:', error);
      return undefined;
    }
  }
  
  async getBuilderPageByType(pageType: string): Promise<BuilderPage | undefined> {
    try {
      const [page] = await db.select()
        .from(builderPages)
        .where(
          and(
            eq(builderPages.pageType, pageType),
            eq(builderPages.isPublished, true)
          )
        );
      return page;
    } catch (error) {
      console.error('Error fetching builder page by type:', error);
      return undefined;
    }
  }
  
  async createBuilderPage(insertPage: InsertBuilderPage): Promise<BuilderPage> {
    try {
      const now = new Date();
      // Forțăm createdBy să fie null pentru a evita erorile de cheie străină
      const [page] = await db.insert(builderPages).values({
        ...insertPage,
        createdBy: null, // Setăm explicit la null, ignorând orice valoare primită
        createdAt: now,
        updatedAt: now
      }).returning();
      return page;
    } catch (error) {
      console.error('Error creating builder page:', error);
      throw new Error('Failed to create builder page');
    }
  }
  
  async updateBuilderPage(id: number, pageData: Partial<BuilderPage>): Promise<BuilderPage | undefined> {
    try {
      const [updatedPage] = await db.update(builderPages)
        .set({
          ...pageData,
          updatedAt: new Date()
        })
        .where(eq(builderPages.id, id))
        .returning();
      return updatedPage;
    } catch (error) {
      console.error('Error updating builder page:', error);
      return undefined;
    }
  }
  
  async deleteBuilderPage(id: number): Promise<boolean> {
    try {
      const result = await db.delete(builderPages).where(eq(builderPages.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting builder page:', error);
      return false;
    }
  }

  // Fasting Recipe operations
  async getRecipe(id: number): Promise<FastingRecipe | undefined> {
    try {
      const recipes = await db.select().from(fastingRecipes).where(eq(fastingRecipes.id, id)).execute();
      return recipes[0];
    } catch (error) {
      console.error('Error getting recipe:', error);
      return undefined;
    }
  }
  
  async getRecipeBySlug(slug: string): Promise<FastingRecipe | undefined> {
    try {
      const recipes = await db.select().from(fastingRecipes).where(eq(fastingRecipes.slug, slug)).execute();
      return recipes[0];
    } catch (error) {
      console.error('Error getting recipe by slug:', error);
      return undefined;
    }
  }
  
  async getRecipes(filters?: Partial<FastingRecipe>): Promise<FastingRecipe[]> {
    try {
      if (!filters) {
        return await db.select().from(fastingRecipes).execute();
      }

      let query = db.select().from(fastingRecipes);
      
      // Aplicăm filtrele furnizate
      if (filters.recipeType) {
        query = query.where(eq(fastingRecipes.recipeType, filters.recipeType));
      }
      
      if (filters.category) {
        query = query.where(eq(fastingRecipes.category, filters.category));
      }
      
      if (filters.difficulty) {
        query = query.where(eq(fastingRecipes.difficulty, filters.difficulty));
      }
      
      if (filters.isFeatured !== undefined) {
        query = query.where(eq(fastingRecipes.isFeatured, filters.isFeatured));
      }
      
      if (filters.isVerified !== undefined) {
        query = query.where(eq(fastingRecipes.isVerified, filters.isVerified));
      }
      
      if (filters.monasteryId !== undefined) {
        query = query.where(eq(fastingRecipes.monasteryId, filters.monasteryId));
      }
      
      return await query.execute();
    } catch (error) {
      console.error('Error getting recipes with filters:', error);
      return [];
    }
  }
  
  async getRecipesByType(recipeType: string): Promise<FastingRecipe[]> {
    try {
      return await db.select().from(fastingRecipes).where(eq(fastingRecipes.recipeType, recipeType as any)).execute();
    } catch (error) {
      console.error('Error getting recipes by type:', error);
      return [];
    }
  }
  
  async getRecipesByCategory(category: string): Promise<FastingRecipe[]> {
    try {
      return await db.select().from(fastingRecipes).where(eq(fastingRecipes.category, category as any)).execute();
    } catch (error) {
      console.error('Error getting recipes by category:', error);
      return [];
    }
  }
  
  async getRecipesForDay(dayOfWeek: string): Promise<FastingRecipe[]> {
    try {
      // Pentru a căuta rețete recomandate pentru o anumită zi a săptămânii
      // De exemplu: "monday", "wednesday", "friday"
      return await db.select()
        .from(fastingRecipes)
        .where(sql`${fastingRecipes.recommendedForDays} @> ARRAY[${dayOfWeek}]::text[]`)
        .execute();
    } catch (error) {
      console.error('Error getting recipes for day:', error);
      return [];
    }
  }
  
  async getMonasteryRecipes(monasteryId: number): Promise<FastingRecipe[]> {
    try {
      return await db.select().from(fastingRecipes).where(eq(fastingRecipes.monasteryId, monasteryId)).execute();
    } catch (error) {
      console.error('Error getting monastery recipes:', error);
      return [];
    }
  }
  
  async getFeaturedRecipes(limit: number = 10): Promise<FastingRecipe[]> {
    try {
      return await db.select()
        .from(fastingRecipes)
        .where(eq(fastingRecipes.isFeatured, true))
        .limit(limit)
        .execute();
    } catch (error) {
      console.error('Error getting featured recipes:', error);
      return [];
    }
  }
  
  async getRecipeComments(recipeId: number): Promise<RecipeComment[]> {
    try {
      return await db.select()
        .from(recipeComments)
        .where(eq(recipeComments.recipeId, recipeId))
        .execute();
    } catch (error) {
      console.error('Error getting recipe comments:', error);
      return [];
    }
  }
  
  async createRecipe(recipe: InsertFastingRecipe): Promise<FastingRecipe> {
    try {
      const now = new Date();
      const newRecipe = {
        ...recipe,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await db.insert(fastingRecipes).values(newRecipe).returning().execute();
      return result[0];
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  }
  
  async updateRecipe(id: number, recipe: Partial<FastingRecipe>): Promise<FastingRecipe | undefined> {
    try {
      const existingRecipe = await this.getRecipe(id);
      if (!existingRecipe) return undefined;
      
      const now = new Date();
      const updatedRecipe = await db.update(fastingRecipes)
        .set({
          ...recipe,
          updatedAt: now
        })
        .where(eq(fastingRecipes.id, id))
        .returning()
        .execute();
      
      return updatedRecipe[0];
    } catch (error) {
      console.error('Error updating recipe:', error);
      return undefined;
    }
  }
  
  async deleteRecipe(id: number): Promise<boolean> {
    try {
      const result = await db.delete(fastingRecipes).where(eq(fastingRecipes.id, id)).execute();
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return false;
    }
  }
  
  async createRecipeComment(comment: InsertRecipeComment): Promise<RecipeComment> {
    try {
      const result = await db.insert(recipeComments).values(comment).returning().execute();
      return result[0];
    } catch (error) {
      console.error('Error creating recipe comment:', error);
      throw error;
    }
  }
  
  async deleteRecipeComment(id: number): Promise<boolean> {
    try {
      const result = await db.delete(recipeComments).where(eq(recipeComments.id, id)).execute();
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting recipe comment:', error);
      return false;
    }
  }
}

// Folosim DatabaseStorage în loc de MemStorage
export const storage = new DatabaseStorage();
