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
}

export const storage = new MemStorage();
