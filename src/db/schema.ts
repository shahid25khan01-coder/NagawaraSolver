import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table linking Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  ward: text('ward').default('Ward 22 - Nagawara'),
  points: integer('points').default(50),
  role: text('role').default('citizen'), // 'citizen' | 'admin' | 'supervisor'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the 'complaints' table with a foreign key to 'users'
export const complaints = pgTable('complaints', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('submitted'),
  priority: text('priority').notNull().default('medium'),
  lat: text('lat').notNull(),
  lng: text('lng').notNull(),
  address: text('address').notNull(),
  landmark: text('landmark'),
  ward: text('ward').notNull().default('Ward 22'),
  photoUrl: text('photo_url').notNull(),
  afterPhotoUrl: text('after_photo_url'),
  citizenName: text('citizen_name').notNull(),
  citizenPhone: text('citizen_phone').notNull(),
  citizenEmail: text('citizen_email').notNull(),
  isAnonymous: boolean('is_anonymous').default(false),
  assignedDepartmentId: text('assigned_department_id'),
  assignedDepartmentName: text('assigned_department_name'),
  assignedSupervisorId: text('assigned_supervisor_id'),
  assignedSupervisorName: text('assigned_supervisor_name'),
  assignedOfficerId: text('assigned_officer_id'),
  assignedOfficerName: text('assigned_officer_name'),
  supervisorNotes: text('supervisor_notes'),
  resolutionNotes: text('resolution_notes'),
  resolvedAt: timestamp('resolved_at'),
  upvotes: integer('upvotes').default(0),
  citizenRating: integer('citizen_rating'),
  citizenFeedback: text('citizen_feedback'),
  caseNumber: integer('case_number'),
  caseMonth: integer('case_month'),
  caseYear: integer('case_year'),
  caseCycle: text('case_cycle'),
  timeline: text('timeline'), // JSON stringified timeline events
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relationships for the 'users' table
export const usersRelations = relations(users, ({ many }) => ({
  complaints: many(complaints),
}));

// Define relationships for the 'complaints' table
export const complaintsRelations = relations(complaints, ({ one }) => ({
  author: one(users, {
    fields: [complaints.userId],
    references: [users.id],
  }),
}));
