import type mongoose from "mongoose";
import net from "net";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/toolshare";
const RECONNECT_COOLDOWN_MS = 60000; // Cooldown between reconnect attempts when offline

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  isConnected: boolean;
  lastAttemptTime: number;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  isConnected: false,
  lastAttemptTime: 0,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

// Ultra-fast 50ms TCP check for local MongoDB daemon to bypass Mongoose's 7-second DNS/SDAM discovery loop
function isPortListening(host: string, port: number, timeoutMs = 60): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let handled = false;

    socket.setTimeout(timeoutMs);

    socket.once("connect", () => {
      handled = true;
      socket.destroy();
      resolve(true);
    });

    socket.once("timeout", () => {
      if (!handled) {
        handled = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.once("error", () => {
      if (!handled) {
        handled = true;
        socket.destroy();
        resolve(false);
      }
    });

    try {
      socket.connect(port, host);
    } catch {
      resolve(false);
    }
  });
}

export async function connectToDatabase(): Promise<{ isConnected: boolean; connection: typeof mongoose | null }> {
  // 1. If already connected, instant 0ms return
  if (cached.conn && cached.isConnected) {
    return { isConnected: true, connection: cached.conn };
  }

  const now = Date.now();
  // 2. If recent check failed, instant 0ms return
  if (!cached.isConnected && cached.lastAttemptTime > 0 && now - cached.lastAttemptTime < RECONNECT_COOLDOWN_MS) {
    return { isConnected: false, connection: null };
  }

  // 3. If connecting to local mongo, probe TCP port in ~15ms first
  const isLocal = MONGODB_URI.includes("localhost") || MONGODB_URI.includes("127.0.0.1");
  if (isLocal) {
    const portMatch = MONGODB_URI.match(/:(\d+)/);
    const port = portMatch ? parseInt(portMatch[1], 10) : 27017;
    const isOnline = await isPortListening("127.0.0.1", port, 60);

    if (!isOnline) {
      cached.isConnected = false;
      cached.lastAttemptTime = now;
      return { isConnected: false, connection: null };
    }
  }

  // 4. Port is reachable or remote Atlas cluster; perform Mongoose connection
  if (!cached.promise) {
    cached.lastAttemptTime = now;
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
    };

    // Lazily import mongoose only when we know the database port is active
    const mongooseModule = (await import("mongoose")).default;

    cached.promise = mongooseModule
      .connect(MONGODB_URI, opts)
      .then((m) => {
        cached.isConnected = true;
        cached.conn = m;
        console.log("Connected to MongoDB:", MONGODB_URI);
        return m;
      })
      .catch(() => {
        cached.isConnected = false;
        cached.conn = null;
        cached.promise = null;
        cached.lastAttemptTime = Date.now();
        return null;
      });
  }

  try {
    const conn = await cached.promise;
    if (conn) {
      cached.conn = conn;
      cached.isConnected = true;
      return { isConnected: true, connection: conn };
    }
  } catch (e) {
    cached.promise = null;
    cached.isConnected = false;
    cached.lastAttemptTime = Date.now();
  }

  return { isConnected: false, connection: null };
}

export default connectToDatabase;
