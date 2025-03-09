import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json, decimal, foreignKey, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  twoFactorCode: text("two_factor_code"),
  twoFactorExpiry: timestamp("two_factor_expiry"),
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
  // Folosim text pentru compatibilitate cu API-ul
  startDate: timestamp("start_date", { mode: 'string' }).notNull(),
  endDate: timestamp("end_date", { mode: 'string' }).notNull(),
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
  status: text("status", { enum: ["draft", "published", "unpublished", "cancelled"] }).notNull().default("draft"),
  // Opțiuni de promovare - acum sunt active
  promoted: boolean("promoted").default(false),
  promotionLevel: text("promotion_level", { enum: ["none", "basic", "premium", "exclusive"] }).notNull().default("none"),
  promotionExpiry: timestamp("promotion_expiry"),
  promotionStartedAt: timestamp("promotion_started_at"),
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
  subject: text("subject").notNull(),
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
  featured: true,
  promoted: true,
  promotionLevel: true,
  promotionExpiry: true,
  promotionStartedAt: true,
  status: true // Omitem și status pentru a-l seta automat în server
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

// Enum pentru statusul comenzilor
export const orderStatusEnum = pgEnum('order_status', ['pending', 'shipped', 'delivered', 'canceled']);

// Marketplace: Produse
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  stock: integer("stock").default(1),
  images: json("images").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow()
});

// Marketplace: Comenzi
export const orders = pgTable("marketplace_orders", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default('pending'),
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at").defaultNow()
});

// Marketplace: Detalii comandă (produse în comandă)
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Marketplace: Recenzii produse
export const productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow()
});

// Definim relațiile între tabele folosind Drizzle relations
export const usersRelations = relations(users, ({ many }) => ({
  pilgrimages: many(pilgrimages, { relationName: "userPilgrimages" }),
  reviews: many(reviews, { relationName: "userReviews" }),
  bookings: many(bookings, { relationName: "userBookings" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  products: many(products, { relationName: "userProducts" }),
  orders: many(orders, { relationName: "userOrders" }),
  productReviews: many(productReviews, { relationName: "userProductReviews" }),
}));

export const pilgrimagesRelations = relations(pilgrimages, ({ one, many }) => ({
  organizer: one(users, { relationName: "userPilgrimages", fields: [pilgrimages.organizerId], references: [users.id] }),
  reviews: many(reviews, { relationName: "pilgrimageReviews" }),
  bookings: many(bookings, { relationName: "pilgrimageBookings" }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  pilgrimage: one(pilgrimages, { relationName: "pilgrimageReviews", fields: [reviews.pilgrimageId], references: [pilgrimages.id] }),
  user: one(users, { relationName: "userReviews", fields: [reviews.userId], references: [users.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  pilgrimage: one(pilgrimages, { relationName: "pilgrimageBookings", fields: [bookings.pilgrimageId], references: [pilgrimages.id] }),
  user: one(users, { relationName: "userBookings", fields: [bookings.userId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { relationName: "sentMessages", fields: [messages.fromUserId], references: [users.id] }),
  receiver: one(users, { relationName: "receivedMessages", fields: [messages.toUserId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, { relationName: "userProducts", fields: [products.sellerId], references: [users.id] }),
  orderItems: many(orderItems),
  reviews: many(productReviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, { relationName: "userOrders", fields: [orders.buyerId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, { fields: [productReviews.productId], references: [products.id] }),
  user: one(users, { relationName: "userProductReviews", fields: [productReviews.userId], references: [users.id] }),
}));

// Insert schemas pentru noile tabele
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  status: true,
  paymentId: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertProductReviewSchema = createInsertSchema(productReviews).omit({
  id: true,
  createdAt: true,
});

// Tipuri pentru marketplace
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
export type ProductReview = typeof productReviews.$inferSelect;

// CMS Content schema
export const cmsContent = pgTable("cms_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  contentType: text("content_type").notNull().default('text'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertCmsContentSchema = createInsertSchema(cmsContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertCmsContent = z.infer<typeof insertCmsContentSchema>;
export type CmsContent = typeof cmsContent.$inferSelect;
