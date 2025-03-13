import { pgTable, index, varchar, json, timestamp, foreignKey, serial, integer, text, boolean, numeric, unique, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const monasteryRegion = pgEnum("monastery_region", ['moldova', 'bucovina', 'muntenia', 'oltenia', 'transilvania', 'maramures', 'banat', 'dobrogea'])


export const session = pgTable("session", {
	sid: varchar().primaryKey().notNull(),
	sess: json().notNull(),
	expire: timestamp({ precision: 6, mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const reviews = pgTable("reviews", {
	id: serial().primaryKey().notNull(),
	pilgrimageId: integer("pilgrimage_id"),
	userId: integer("user_id"),
	rating: integer().notNull(),
	comment: text(),
	verified: boolean(),
	createdAt: timestamp("created_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.pilgrimageId],
			foreignColumns: [pilgrimages.id],
			name: "reviews_pilgrimage_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reviews_user_id_fkey"
		}),
]);

export const bookings = pgTable("bookings", {
	id: serial().primaryKey().notNull(),
	pilgrimageId: integer("pilgrimage_id"),
	userId: integer("user_id"),
	persons: integer().notNull(),
	totalPrice: numeric("total_price").notNull(),
	status: text().notNull(),
	paymentStatus: text("payment_status").notNull(),
	paymentId: text("payment_id"),
	createdAt: timestamp("created_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.pilgrimageId],
			foreignColumns: [pilgrimages.id],
			name: "bookings_pilgrimage_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "bookings_user_id_fkey"
		}),
]);

export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	fromUserId: integer("from_user_id"),
	toUserId: integer("to_user_id"),
	subject: text().notNull(),
	content: text().notNull(),
	read: boolean().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.fromUserId],
			foreignColumns: [users.id],
			name: "messages_from_user_id_fkey"
		}),
	foreignKey({
			columns: [table.toUserId],
			foreignColumns: [users.id],
			name: "messages_to_user_id_fkey"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	email: text().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	phone: text(),
	role: text().notNull(),
	verified: boolean(),
	verificationToken: text("verification_token"),
	tokenExpiry: timestamp("token_expiry", { mode: 'string' }),
	profileImage: text("profile_image"),
	bio: text(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	resetToken: text("reset_token"),
	resetTokenExpiry: timestamp("reset_token_expiry", { mode: 'string' }),
	twoFactorCode: text("two_factor_code"),
	twoFactorExpiry: timestamp("two_factor_expiry", { mode: 'string' }),
});

export const cmsContent = pgTable("cms_content", {
	id: serial().primaryKey().notNull(),
	key: text().notNull(),
	value: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	contentType: text("content_type").default('text').notNull(),
}, (table) => [
	unique("cms_content_key_key").on(table.key),
]);

export const builderPages = pgTable("builder_pages", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	pageType: text("page_type"),
	content: text().notNull(),
	meta: text(),
	isPublished: boolean("is_published").default(true).notNull(),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "builder_pages_created_by_fkey"
		}),
	unique("builder_pages_slug_key").on(table.slug),
]);

export const pilgrimages = pgTable("pilgrimages", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	location: text().notNull(),
	month: text().notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	price: numeric().notNull(),
	currency: text().notNull(),
	transportation: text().notNull(),
	guide: text().notNull(),
	saint: text(),
	includes: text().array(),
	excludes: text().array(),
	itinerary: text().array(),
	availableSpots: integer("available_spots").notNull(),
	verified: boolean(),
	featured: boolean(),
	organizerId: integer("organizer_id"),
	createdAt: timestamp("created_at", { mode: 'string' }),
	duration: integer(),
	includedServices: json("included_services"),
	images: json(),
	draft: boolean().default(false),
	promoted: boolean().default(false),
	promotionLevel: text("promotion_level").default('none'),
	promotionExpiry: timestamp("promotion_expiry", { mode: 'string' }),
	promotionStartedAt: timestamp("promotion_started_at", { mode: 'string' }),
	excludedServices: jsonb("excluded_services").default([]),
	status: text().default('active').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizerId],
			foreignColumns: [users.id],
			name: "pilgrimages_organizer_id_fkey"
		}),
]);

export const monasteryEvents = pgTable("monastery_events", {
	id: serial().primaryKey().notNull(),
	monasteryId: integer("monastery_id"),
	name: text().notNull(),
	description: text().notNull(),
	eventDate: timestamp("event_date", { mode: 'string' }).notNull(),
	isRecurring: boolean("is_recurring").notNull(),
	recurrencePattern: text("recurrence_pattern"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.monasteryId],
			foreignColumns: [monasteries.id],
			name: "monastery_events_monastery_id_fkey"
		}),
]);

export const monasteries = pgTable("monasteries", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text().notNull(),
	shortDescription: text("short_description"),
	address: text().notNull(),
	region: monasteryRegion().notNull(),
	city: text().notNull(),
	county: text().notNull(),
	access: text(),
	patronSaint: text("patron_saint"),
	patronSaintDate: timestamp("patron_saint_date", { mode: 'string' }),
	foundedYear: integer("founded_year"),
	history: text(),
	specialFeatures: text("special_features"),
	relics: text().array(),
	type: text().notNull(),
	images: text().array(),
	coverImage: text("cover_image"),
	contactEmail: text("contact_email"),
	contactPhone: text("contact_phone"),
	website: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	latitude: numeric(),
	longitude: numeric(),
	iconDescriptions: jsonb("icon_descriptions"),
	verification: boolean().default(true),
	administratorId: integer("administrator_id"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("monasteries_slug_key").on(table.slug),
]);

export const monasteryServices = pgTable("monastery_services", {
	id: serial().primaryKey().notNull(),
	monasteryId: integer("monastery_id"),
	name: text().notNull(),
	description: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.monasteryId],
			foreignColumns: [monasteries.id],
			name: "monastery_services_monastery_id_fkey"
		}),
]);

export const monasterySchedule = pgTable("monastery_schedule", {
	id: serial().primaryKey().notNull(),
	monasteryId: integer("monastery_id"),
	dayOfWeek: text("day_of_week").notNull(),
	openingTime: text("opening_time").notNull(),
	closingTime: text("closing_time").notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.monasteryId],
			foreignColumns: [monasteries.id],
			name: "monastery_schedule_monastery_id_fkey"
		}),
]);
