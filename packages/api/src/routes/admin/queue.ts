import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { createApiError } from '@spm/shared';
import type { AppEnv } from '../../types.js';
import { skills, versions, users, scans } from '../../db/schema.js';
import { audit } from './audit.js';

export const queueRoutes = new Hono<AppEnv>();

// ── GET /admin/queue — flagged skills awaiting review ──

const QueueQuerySchema = z.object({
  sort: z.enum(['oldest', 'newest', 'confidence']).optional().default('oldest'),
  status: z.enum(['pending', 'all']).optional().default('pending'),
});

queueRoutes.get('/admin/queue', zValidator('query', QueueQuerySchema), async (c) => {
  const db = c.get('db');
  const { sort, status } = c.req.valid('query');

  try {
    const statusFilter =
      status === 'pending'
        ? eq(scans.status, 'flagged')
        : sql`${scans.status} IN ('flagged', 'manual_approved', 'blocked')`;

    let orderBy;
    switch (sort) {
      case 'newest':
        orderBy = desc(scans.scannedAt);
        break;
      case 'confidence':
        orderBy = desc(scans.confidence);
        break;
      case 'oldest':
      default:
        orderBy = asc(scans.scannedAt);
        break;
    }

    // Single JOIN query instead of N+1
    const rows = await db
      .select({
        scanId: scans.id,
        layer: scans.layer,
        scanStatus: scans.status,
        confidence: scans.confidence,
        scannedAt: scans.scannedAt,
        version: versions.version,
        sizeBytes: versions.sizeBytes,
        skillName: skills.name,
        username: users.username,
        trustTier: users.trustTier,
      })
      .from(scans)
      .innerJoin(versions, eq(versions.id, scans.versionId))
      .innerJoin(skills, eq(skills.id, versions.skillId))
      .innerJoin(users, eq(users.id, skills.ownerId))
      .where(statusFilter)
      .orderBy(orderBy);

    const queue = rows.map((row) => {
      const scannedAt = row.scannedAt;
      const submittedAt =
        scannedAt instanceof Date
          ? scannedAt.toISOString()
          : String(scannedAt ?? new Date().toISOString());

      return {
        id: row.scanId,
        skill: row.skillName,
        version: row.version,
        author: {
          username: row.username ?? 'unknown',
          trust_tier: row.trustTier ?? 'registered',
        },
        flags: [
          {
            layer: row.layer,
            type: row.scanStatus,
            confidence: row.confidence,
          },
        ],
        submitted_at: submittedAt,
        size_bytes: row.sizeBytes,
      };
    });

    return c.json({
      queue,
      total: queue.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /admin/queue error:', message, err);
    return c.json({ error: 'internal_error', message, debug: String(err) }, 500);
  }
});

// ── POST /admin/queue/:id/approve — approve a flagged skill ──

const ApproveSchema = z.object({
  notes: z.string().optional(),
});

queueRoutes.post('/admin/queue/:id/approve', zValidator('json', ApproveSchema), async (c) => {
  const db = c.get('db');
  const jwt = c.get('jwtPayload');
  const scanId = c.req.param('id');

  const [scan] = await db
    .select({ id: scans.id, versionId: scans.versionId, status: scans.status })
    .from(scans)
    .where(eq(scans.id, scanId))
    .limit(1);

  if (!scan) {
    return c.json(createApiError('SKILL_NOT_FOUND', { message: 'Queue item not found' }), 404);
  }

  await db.update(scans).set({ status: 'manual_approved' }).where(eq(scans.id, scanId));

  const [ver] = await db
    .select({ version: versions.version, skillId: versions.skillId })
    .from(versions)
    .where(eq(versions.id, scan.versionId))
    .limit(1);

  let skillName = 'unknown';
  if (ver) {
    const [skill] = await db
      .select({ name: skills.name })
      .from(skills)
      .where(eq(skills.id, ver.skillId))
      .limit(1);
    skillName = skill?.name ?? 'unknown';
  }

  const body = c.req.valid('json');
  await audit(
    db,
    jwt.sub,
    'admin.approve',
    { scan_id: scanId, notes: body.notes },
    { versionId: scan.versionId },
  );

  return c.json({
    id: scanId,
    status: 'approved',
    skill: skillName,
    version: ver?.version ?? 'unknown',
    approved_at: new Date().toISOString(),
  });
});

// ── POST /admin/queue/:id/reject — reject a flagged skill ──

const RejectSchema = z.object({
  reason: z.string().min(1),
  notify_author: z.boolean().optional().default(false),
  feedback: z.string().optional(),
});

queueRoutes.post('/admin/queue/:id/reject', zValidator('json', RejectSchema), async (c) => {
  const db = c.get('db');
  const jwt = c.get('jwtPayload');
  const scanId = c.req.param('id');

  const [scan] = await db
    .select({ id: scans.id, versionId: scans.versionId })
    .from(scans)
    .where(eq(scans.id, scanId))
    .limit(1);

  if (!scan) {
    return c.json(createApiError('SKILL_NOT_FOUND', { message: 'Queue item not found' }), 404);
  }

  await db.update(scans).set({ status: 'blocked' }).where(eq(scans.id, scanId));

  const [ver] = await db
    .select({ version: versions.version, skillId: versions.skillId })
    .from(versions)
    .where(eq(versions.id, scan.versionId))
    .limit(1);

  let skillName = 'unknown';
  if (ver) {
    const [skill] = await db
      .select({ name: skills.name })
      .from(skills)
      .where(eq(skills.id, ver.skillId))
      .limit(1);
    skillName = skill?.name ?? 'unknown';
  }

  const body = c.req.valid('json');
  await audit(
    db,
    jwt.sub,
    'admin.reject',
    { scan_id: scanId, reason: body.reason, feedback: body.feedback },
    { versionId: scan.versionId },
  );

  return c.json({
    id: scanId,
    status: 'rejected',
    skill: skillName,
    version: ver?.version ?? 'unknown',
  });
});
