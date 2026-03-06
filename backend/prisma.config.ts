import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrate: {
    adapter: async () => {
      const { LibSQLAdapter } = await import('@prisma/adapter-libsql');
      const { createClient } = await import('@libsql/client');
      const client = createClient({ url: 'file:./prisma/dev.db' });
      return new LibSQLAdapter(client);
    },
  },
  datasource: {
    url: 'file:./prisma/dev.db',
  },
});
