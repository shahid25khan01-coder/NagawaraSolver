import { db } from './index.ts';
import { complaints, users } from './schema.ts';
import { eq, desc, sql } from 'drizzle-orm';

export interface NewComplaintInput {
  id: string;
  userUid?: string;
  title: string;
  category: string;
  description: string;
  priority: string;
  lat: string;
  lng: string;
  address: string;
  landmark?: string;
  ward: string;
  photoUrl: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail: string;
  isAnonymous?: boolean;
  timeline?: string;
  caseNumber?: number;
  caseMonth?: number;
  caseYear?: number;
  caseCycle?: string;
}

export async function getAllComplaints() {
  try {
    return await db.select().from(complaints).orderBy(desc(complaints.createdAt));
  } catch (error) {
    console.error('Database query for all complaints failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getComplaintById(id: string) {
  try {
    const result = await db.select().from(complaints).where(eq(complaints.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error(`Database query for complaint ${id} failed:`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function createComplaint(input: NewComplaintInput) {
  try {
    let resolvedUserId: number | null = null;
    if (input.userUid) {
      const userRecord = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.uid, input.userUid))
        .limit(1);
      if (userRecord.length > 0) {
        resolvedUserId = userRecord[0].id;
      }
    }

    const inserted = await db
      .insert(complaints)
      .values({
        id: input.id,
        userId: resolvedUserId,
        title: input.title,
        category: input.category,
        description: input.description,
        status: 'submitted',
        priority: input.priority || 'medium',
        lat: input.lat,
        lng: input.lng,
        address: input.address,
        landmark: input.landmark || null,
        ward: input.ward || 'Ward 22',
        photoUrl: input.photoUrl,
        citizenName: input.citizenName,
        citizenPhone: input.citizenPhone,
        citizenEmail: input.citizenEmail,
        isAnonymous: input.isAnonymous ?? false,
        timeline: input.timeline || '[]',
        caseNumber: input.caseNumber,
        caseMonth: input.caseMonth,
        caseYear: input.caseYear,
        caseCycle: input.caseCycle,
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database insertion of complaint failed:', error);
    throw new Error('Database insert failed. Please try again later.', { cause: error });
  }
}

export async function updateComplaintRecord(
  id: string,
  updateFields: Partial<typeof complaints.$inferInsert>
) {
  try {
    const updated = await db
      .update(complaints)
      .set({
        ...updateFields,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, id))
      .returning();

    return updated[0] || null;
  } catch (error) {
    console.error(`Database update of complaint ${id} failed:`, error);
    throw new Error('Database update failed. Please try again later.', { cause: error });
  }
}

export async function incrementComplaintUpvotes(id: string) {
  try {
    const updated = await db
      .update(complaints)
      .set({
        upvotes: sql`${complaints.upvotes} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, id))
      .returning();

    return updated[0] || null;
  } catch (error) {
    console.error(`Database upvote increment for complaint ${id} failed:`, error);
    throw new Error('Database update failed. Please try again later.', { cause: error });
  }
}
