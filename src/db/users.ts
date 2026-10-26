import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export interface UpsertUserData {
  uid: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  ward?: string | null;
  role?: string | null;
}

export async function getOrCreateUser(userData: UpsertUserData) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid: userData.uid,
        email: userData.email,
        name: userData.name || null,
        phone: userData.phone || null,
        ward: userData.ward || 'Ward 22 - Nagawara',
        role: userData.role || 'citizen',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: userData.email,
          ...(userData.name ? { name: userData.name } : {}),
          ...(userData.phone ? { phone: userData.phone } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database user upsert failed:', error);
    throw new Error('Database user operation failed. Please try again later.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Database query for user failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateUserProfile(uid: string, updateData: Partial<typeof users.$inferInsert>) {
  try {
    const result = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.uid, uid))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Database query for update user failed:', error);
    throw new Error('Database update failed. Please try again later.', { cause: error });
  }
}
