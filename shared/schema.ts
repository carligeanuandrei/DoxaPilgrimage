import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema with different roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["pilgrim", "operator", "monastery", "admin"] }).notNull().default("pilgrim"),
  verified: boolean("verified").default(false),
  verificationToken: text("verification_token"),
  tokenExpiry: timestamp("token_expiry"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow()
});

// Pilgrimage tour schema
export const pilgrimages = pgTable("pilgrimages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  month: text("month").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  price: doublePrecision("price").notNull(),
  currency: text("currency").notNull().default("EUR"),
  transportation: text("transportation").notNull(),
  guide: text("guide").notNull(),
  saint: text("saint"),
  duration: integer("duration").notNull(),
  includedServices: json("included_services").$type<string[]>(),
  images: json("images").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  organizerId: integer("organizer_id").notNull(),
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  availableSpots: integer("available_spots").notNull()
});

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  pilgrimageId: integer("pilgrimage_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Bookings schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  pilgrimageId: integer("pilgrimage_id").notNull(),
  userId: integer("user_id").notNull(),
  persons: integer("persons").notNull().default(1),
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] }).notNull().default("pending"),
  totalPrice: doublePrecision("total_price").notNull(),
  paymentId: text("payment_id"),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "refunded"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  verified: true,
  verificationToken: true,
  tokenExpiry: true,
  createdAt: true
});

export const insertPilgrimageSchema = createInsertSchema(pilgrimages).omit({
  id: true,
  createdAt: true,
  verified: true,
  featured: true
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  verified: true,
  createdAt: true
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  paymentId: true,
  paymentStatus: true,
  status: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  read: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPilgrimage = z.infer<typeof insertPilgrimageSchema>;
export type Pilgrimage = typeof pilgrimages.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Login data type
export type LoginData = {
  username: string;
  password: string;
};

// Email verification type
export type VerificationData = {
  token: string;
  userId: number;
  email: string;
};
