import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Get comprehensive health status
router.get('/', (req: Request, res: Response) => {
  const mongoConnectionState = mongoose.connection.readyState;
  const mongoReadyStates: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const health = {
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: {
      status: mongoReadyStates[mongoConnectionState],
      state: mongoConnectionState,
      host: mongoose.connection.host,
      db: mongoose.connection.db?.getName() || 'unknown',
      connected: mongoConnectionState === 1
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT || '4000'
    },
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    }
  };

  // Return different status codes based on database connection
  if (mongoConnectionState !== 1) {
    health.ok = false;
    return res.status(503).json(health);
  }

  res.status(200).json(health);
});

// Extended database diagnostics
router.get('/db', async (req: Request, res: Response) => {
  try {
    const mongoConnectionState = mongoose.connection.readyState;
    const mongoReadyStates: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Try to ping the database
    const admin = mongoose.connection.db?.admin();
    let pingResult = null;
    let collections: string[] = [];

    if (admin && mongoConnectionState === 1) {
      try {
        pingResult = await admin.ping();
        const collectionList = await mongoose.connection.db!.listCollections().toArray();
        collections = collectionList?.map((c: { name: string }) => c.name) || [];
      } catch (err) {
        console.error('Ping error:', err);
      }
    }

    const dbStatus = {
      ok: mongoConnectionState === 1,
      timestamp: new Date().toISOString(),
      connection: {
        state: mongoReadyStates[mongoConnectionState],
        readyState: mongoConnectionState,
        host: mongoose.connection.host || 'unknown',
        database: mongoose.connection.db?.getName() || 'unknown',
        uri: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 40) + '...' : 'NOT SET'
      },
      ping: pingResult ? 'success' : 'not available',
      collections: collections.length > 0 ? collections : 'none or unable to list',
      mongoVersion: mongoose.version
    };

    if (mongoConnectionState !== 1) {
      return res.status(503).json(dbStatus);
    }

    res.status(200).json(dbStatus);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(503).json({
      ok: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
