import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./database.ts";
import { betterAuth } from "better-auth";
import os from 'os';

function getLocalIp() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  return '0.0.0.0';
}

export const ip = getLocalIp();

export const auth = betterAuth({
  baseURL: `http://${ip}:3000`,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  appName: 'backend',
  plugins: [],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        enum: ['Admin', 'User'],
      },
      number: {
        type: 'string',
        required: true,
        unique: true,
      },
    },
  },
});
