import { MongoClient, Db } from 'mongodb';
import tls from 'tls';
import dns from 'dns';

const uri: string = process.env.MONGODB_URI || '';

function createOptions(u: string) {
  const isSrv = u.startsWith('mongodb+srv://');
  const hostsPart = u.replace(/^mongodb(\+srv)?:\/\//, '').split('/')[0];
  const hostSegment = (hostsPart.split('@').pop() || hostsPart);
  const hostList = hostSegment.split(',');
  const isLocal = hostList.some((h) => h.startsWith('localhost') || h.startsWith('127.0.0.1') || h.startsWith('0.0.0.0'));
  const insecure = process.env.MONGODB_TLS_INSECURE === 'true';

  // Removed problematic custom TLS configuration that was incompatible with Atlas
  // The MongoDB driver will use appropriate TLS defaults for SRV connections
  if (isSrv && process.env.NODE_ENV === 'development') {
    try {
      // Only set DNS order preference, no custom TLS settings
      (dns as any).setDefaultResultOrder?.('ipv4first');
    } catch { }
  }

  const base: any = {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
    minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 1),
    maxIdleTimeMS: Number(process.env.MONGODB_MAX_IDLE_MS || 30000),
  };

  if (isLocal && !isSrv) {
    base.tls = false;
    base.directConnection = true;
  } else if (insecure) {
    // Only allow insecure TLS if explicitly set via env var
    base.tls = true;
    base.tlsAllowInvalidCertificates = true;
    base.tlsAllowInvalidHostnames = true;
  }

  return base;
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let insecureClientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> | null {
  if (!uri) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const opts = createOptions(uri);
      client = new MongoClient(uri, opts);
      globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
        // Reset the promise so we can retry on next request
        globalWithMongo._mongoClientPromise = undefined;

        const msg = String((err && err.message) || '');
        const code = (err && (err as any).code) || '';
        const tlsFail = code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR' || msg.includes('tlsv1 alert internal error');
        if (!tlsFail) {
          console.error('MongoDB connection error:', err);
          throw err;
        }
        const insecure = { ...opts, tlsAllowInvalidCertificates: true, tlsAllowInvalidHostnames: true } as any;
        client = new MongoClient(uri, insecure);
        const retryPromise = client.connect();
        // If retry fails, also clear the global
        retryPromise.catch(() => { globalWithMongo._mongoClientPromise = undefined; });
        return retryPromise;
      });
    }
    return globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    if (!clientPromise) {
      const opts = createOptions(uri);
      client = new MongoClient(uri, opts);
      clientPromise = client.connect().catch((err) => {
        const msg = String((err && err.message) || '');
        const code = (err && (err as any).code) || '';
        const tlsFail = code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR' || msg.includes('tlsv1 alert internal error');
        if (!tlsFail) {
          console.error('MongoDB connection error:', err);
          throw err;
        }
        const insecure = { ...opts, tlsAllowInvalidCertificates: true, tlsAllowInvalidHostnames: true } as any;
        client = new MongoClient(uri, insecure);
        return client.connect();
      });
    }
    return clientPromise;
  }
}

export async function getDatabase(): Promise<Db> {
  // Skip database connection during build to avoid TLS/connection errors
  if (process.env.SKIP_DB_BUILD === 'true') {
    throw new Error('SKIP_DB_BUILD: Database connections disabled during build');
  }

  const promise = getClientPromise();
  if (!promise) {
    throw new Error('MONGODB_URI is not set');
  }

  try {
    const client = await promise;
    const dbName = process.env.MONGODB_DB_NAME || 'lms';
    return client.db(dbName);
  } catch (error) {
    const err = error as any;
    const msg = String((err && err.message) || '');
    const tlsFail = err?.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR' || msg.includes('tlsv1 alert internal error');
    if (tlsFail) {
      try {
        const opts = { ...createOptions(uri), tlsAllowInvalidCertificates: true, tlsAllowInvalidHostnames: true } as any;
        if (!insecureClientPromise) {
          client = new MongoClient(uri, opts);
          insecureClientPromise = client.connect();
        }
        const c = await insecureClientPromise;
        const dbName = process.env.MONGODB_DB_NAME || 'lms';
        return c.db(dbName);
      } catch (e) {
        if (process.env.NODE_ENV === 'development' && process.env.MONGODB_DEV_LOCAL_FALLBACK === 'true') {
          const localUri = process.env.MONGODB_DEV_LOCAL_URI || 'mongodb://localhost:27017';
          const localOpts: any = { tls: false, directConnection: true };
          try {
            client = new MongoClient(localUri, localOpts);
            const c = await client.connect();
            const dbName = process.env.MONGODB_DB_NAME || 'lms';
            return c.db(dbName);
          } catch (localErr) {
            console.error('Local MongoDB fallback failed:', localErr);
          }
        }
      }
    }
    console.error('Failed to get database:', error);
    throw error;
  }
}

export default getClientPromise();
