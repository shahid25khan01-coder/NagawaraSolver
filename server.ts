import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUserByUid, updateUserProfile } from './src/db/users.ts';
import {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintRecord,
  incrementComplaintUpvotes,
} from './src/db/complaints.ts';

import http from 'http';

dotenv.config();
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();

  // Middleware for JSON parsing
  app.use(express.json({ limit: '15mb' }));

  // ==========================================
  // Auth & User Endpoints (Cloud SQL + Firebase)
  // ==========================================
  app.post('/api/auth/sync-user', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || (req.body.email as string) || '';
      const name = (req.body.name as string) || req.user!.name || null;
      const phone = (req.body.phone as string) || null;
      const ward = (req.body.ward as string) || 'Ward 22 - Nagawara';
      const role = (req.body.role as string) || 'citizen';

      const user = await getOrCreateUser({
        uid,
        email,
        name,
        phone,
        ward,
        role,
      });

      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Failed to sync user in Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to sync user' });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const user = await getUserByUid(uid);
      if (!user) {
        return res.status(404).json({ error: 'User profile not found' });
      }
      res.json({ user });
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch user profile' });
    }
  });

  app.patch('/api/auth/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { name, phone, ward } = req.body;
      const updated = await updateUserProfile(uid, {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(ward !== undefined ? { ward } : {}),
      });
      res.json({ success: true, user: updated });
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
  });

  // ==========================================
  // Complaints Endpoints (Cloud SQL Relational)
  // ==========================================
  app.get('/api/complaints', async (_req, res) => {
    try {
      const list = await getAllComplaints();
      res.json({ complaints: list });
    } catch (error: any) {
      console.error('Failed to retrieve complaints:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve complaints' });
    }
  });

  app.get('/api/complaints/:id', async (req, res) => {
    try {
      const item = await getComplaintById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      res.json({ complaint: item });
    } catch (error: any) {
      console.error(`Failed to retrieve complaint ${req.params.id}:`, error);
      res.status(500).json({ error: error.message || 'Failed to retrieve complaint' });
    }
  });

  app.post('/api/complaints', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const userUid = req.user?.uid;
      const {
        id,
        title,
        category,
        description,
        priority,
        location,
        photoUrl,
        citizenName,
        citizenPhone,
        citizenEmail,
        isAnonymous,
        timeline,
        caseNumber,
        caseMonth,
        caseYear,
        caseCycle,
      } = req.body;

      if (!title || !category || !description || !location || !photoUrl) {
        return res.status(400).json({ error: 'Missing required complaint fields' });
      }

      const complaintId = id || `CP-${Math.floor(1000 + Math.random() * 9000)}`;

      const created = await createComplaint({
        id: complaintId,
        userUid: isAnonymous ? undefined : userUid,
        title,
        category,
        description,
        priority: priority || 'medium',
        lat: String(location.lat ?? '13.0425'),
        lng: String(location.lng ?? '77.6253'),
        address: location.address || 'Nagawara Main Road',
        landmark: location.landmark,
        ward: location.ward || 'Ward 22',
        photoUrl,
        citizenName: isAnonymous ? 'Anonymous Citizen' : (citizenName || 'Nagawara Resident'),
        citizenPhone: isAnonymous ? 'Confidential' : (citizenPhone || '+91 98450 00000'),
        citizenEmail: isAnonymous ? 'anonymous@nagawara.civic' : (citizenEmail || 'resident@nagawara.civic'),
        isAnonymous: Boolean(isAnonymous),
        timeline: typeof timeline === 'string' ? timeline : JSON.stringify(timeline || []),
        caseNumber,
        caseMonth,
        caseYear,
        caseCycle,
      });

      res.status(201).json({ success: true, complaint: created });
    } catch (error: any) {
      console.error('Failed to submit complaint to Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to submit complaint' });
    }
  });

  app.patch('/api/complaints/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Format timeline if passed as object
      const payload: any = { ...updates };
      if (payload.timeline && typeof payload.timeline !== 'string') {
        payload.timeline = JSON.stringify(payload.timeline);
      }
      if (payload.resolvedAt) {
        payload.resolvedAt = new Date(payload.resolvedAt);
      }

      const updated = await updateComplaintRecord(id, payload);
      if (!updated) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      res.json({ success: true, complaint: updated });
    } catch (error: any) {
      console.error(`Failed to update complaint ${req.params.id}:`, error);
      res.status(500).json({ error: error.message || 'Failed to update complaint' });
    }
  });

  app.post('/api/complaints/:id/upvote', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await incrementComplaintUpvotes(id);
      if (!updated) {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      res.json({ success: true, complaint: updated });
    } catch (error: any) {
      console.error(`Failed to upvote complaint ${req.params.id}:`, error);
      res.status(500).json({ error: error.message || 'Failed to upvote complaint' });
    }
  });

  // ==========================================
  // Vite Integration (Dev middleware or static)
  // ==========================================
  const server = http.createServer(app);

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
});
