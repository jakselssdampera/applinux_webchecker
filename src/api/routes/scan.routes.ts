import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { scanEngine } from '../../core/engine.js';
import { getScan, getScanResults, listScans, getDashboardStats } from '../../core/database.js';
import { validateTargetUrl } from '../../utils/url-validator.js';
import { decrypt } from '../../utils/crypto.js';
import { config } from '../../config.js';
import { MODULE_NAMES, type ModuleName } from '../../utils/constants.js';

interface ScanBody {
  url: string;
  modules?: string[];
}

interface ScanParams {
  id: string;
}

interface ListQuery {
  limit?: string;
  offset?: string;
}

export async function scanRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/scan — Start a new scan
   */
  fastify.post('/api/scan', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as ScanBody | undefined;

    if (!body?.url) {
      return reply.status(400).send({
        error: 'Missing required field: url',
        statusCode: 400,
      });
    }

    // Validate URL
    const validation = await validateTargetUrl(body.url);
    if (!validation.valid) {
      return reply.status(400).send({
        error: validation.error,
        statusCode: 400,
      });
    }

    // Determine which modules to run
    const validModules = Object.values(MODULE_NAMES);
    const requestedModules = body.modules?.filter((m): m is ModuleName =>
      validModules.includes(m as ModuleName)
    ) ?? [MODULE_NAMES.PROFILER]; // Default: profiler only

    // Start scan
    const scanId = await scanEngine.startScan({
      targetUrl: validation.url!,
      targetIp: validation.ip ?? null,
      modules: requestedModules,
    });

    return reply.status(202).send({
      scanId,
      status: 'running',
      targetUrl: validation.url,
      targetIp: validation.ip,
      modules: requestedModules,
      message: 'Scan started. Connect to WebSocket for real-time updates.',
    });
  });

  /**
   * GET /api/scan/:id — Get scan details and results
   */
  fastify.get('/api/scan/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as ScanParams;

    const scan = getScan(id);
    if (!scan) {
      return reply.status(404).send({
        error: 'Scan not found',
        statusCode: 404,
      });
    }

    // Get and decrypt results
    const rawResults = getScanResults(id);
    const results = rawResults.map((r) => {
      let data: unknown;
      try {
        const decrypted = config.encryptionKey
          ? decrypt(r.data, config.encryptionKey)
          : r.data;
        data = JSON.parse(decrypted);
      } catch {
        data = { error: 'Failed to decrypt result' };
      }

      return {
        id: r.id,
        module: r.module,
        data,
        severity: r.severity,
        createdAt: r.created_at,
      };
    });

    return reply.send({
      id: scan.id,
      targetUrl: scan.target_url,
      targetIp: scan.target_ip,
      status: scan.status,
      modules: JSON.parse(scan.modules),
      error: scan.error,
      createdAt: scan.created_at,
      completedAt: scan.completed_at,
      results,
    });
  });

  /**
   * GET /api/scans — List all scans
   */
  fastify.get('/api/scans', async (request: FastifyRequest) => {
    const query = request.query as ListQuery;
    const limit = Math.min(parseInt(query.limit ?? '50', 10), 100);
    const offset = parseInt(query.offset ?? '0', 10);

    const scans = listScans(limit, offset);

    return {
      scans: scans.map((s) => ({
        id: s.id,
        targetUrl: s.target_url,
        targetIp: s.target_ip,
        status: s.status,
        modules: JSON.parse(s.modules),
        createdAt: s.created_at,
        completedAt: s.completed_at,
      })),
      pagination: { limit, offset },
    };
  });

  /**
   * GET /api/stats - Dashboard stats
   */
  fastify.get('/api/stats', async () => {
    return getDashboardStats();
  });
}
