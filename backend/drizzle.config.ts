import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './schema.ts',
  dbCredentials: {
    url: "file:" + process.env.DB_FILE_NAME!,
  },
});
