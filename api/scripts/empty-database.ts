import { Pool } from 'pg';

const TRUNCATE_SQL = `
TRUNCATE TABLE
  "ContactTag",
  "Interaction",
  "OutreachMessage",
  "Contact",
  "FilterJob",
  "Lead",
  "RawLead",
  "Filter",
  "OutreachSequence",
  "users"
RESTART IDENTITY CASCADE;
`;

async function main() {
    if (!process.argv.includes('--yes')) {
        console.error(
            'Aborted. Pass --yes to truncate all application tables (keeps schema and _prisma_migrations).',
        );
        process.exit(1);
    }

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is not set.');
        process.exit(1);
    }

    const pool = new Pool({ connectionString });
    try {
        await pool.query(TRUNCATE_SQL);
        console.log('All application tables truncated. Migration history unchanged.');
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
