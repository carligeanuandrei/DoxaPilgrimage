import { relations } from "drizzle-orm/relations";
import { pilgrimages, reviews, users, bookings, messages, builderPages, monasteries, monasteryEvents, monasteryServices, monasterySchedule } from "./schema";

export const reviewsRelations = relations(reviews, ({one}) => ({
	pilgrimage: one(pilgrimages, {
		fields: [reviews.pilgrimageId],
		references: [pilgrimages.id]
	}),
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id]
	}),
}));

export const pilgrimagesRelations = relations(pilgrimages, ({one, many}) => ({
	reviews: many(reviews),
	bookings: many(bookings),
	user: one(users, {
		fields: [pilgrimages.organizerId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	reviews: many(reviews),
	bookings: many(bookings),
	messages_fromUserId: many(messages, {
		relationName: "messages_fromUserId_users_id"
	}),
	messages_toUserId: many(messages, {
		relationName: "messages_toUserId_users_id"
	}),
	builderPages: many(builderPages),
	pilgrimages: many(pilgrimages),
}));

export const bookingsRelations = relations(bookings, ({one}) => ({
	pilgrimage: one(pilgrimages, {
		fields: [bookings.pilgrimageId],
		references: [pilgrimages.id]
	}),
	user: one(users, {
		fields: [bookings.userId],
		references: [users.id]
	}),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	user_fromUserId: one(users, {
		fields: [messages.fromUserId],
		references: [users.id],
		relationName: "messages_fromUserId_users_id"
	}),
	user_toUserId: one(users, {
		fields: [messages.toUserId],
		references: [users.id],
		relationName: "messages_toUserId_users_id"
	}),
}));

export const builderPagesRelations = relations(builderPages, ({one}) => ({
	user: one(users, {
		fields: [builderPages.createdBy],
		references: [users.id]
	}),
}));

export const monasteryEventsRelations = relations(monasteryEvents, ({one}) => ({
	monastery: one(monasteries, {
		fields: [monasteryEvents.monasteryId],
		references: [monasteries.id]
	}),
}));

export const monasteriesRelations = relations(monasteries, ({many}) => ({
	monasteryEvents: many(monasteryEvents),
	monasteryServices: many(monasteryServices),
	monasterySchedules: many(monasterySchedule),
}));

export const monasteryServicesRelations = relations(monasteryServices, ({one}) => ({
	monastery: one(monasteries, {
		fields: [monasteryServices.monasteryId],
		references: [monasteries.id]
	}),
}));

export const monasteryScheduleRelations = relations(monasterySchedule, ({one}) => ({
	monastery: one(monasteries, {
		fields: [monasterySchedule.monasteryId],
		references: [monasteries.id]
	}),
}));