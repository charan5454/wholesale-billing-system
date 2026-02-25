©const { Pool } = require('pg');
require('dotenv').config();

// Print some info to see what's going on
console.log('--- PG CLEAR START ---');
console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 'MISSING');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function clear() {
    try {
        console.log('Attemping truncate...');
        const res = await pool.query('TRUNCATE borrowers, history RESTART IDENTITY CASCADE');
        console.log('SUCCESS:', res.command);
    } catch (e) {
        console.error('FAILED:', e.message);
    } finally {
        await pool.end();
        console.log('--- PG CLEAR END ---');
        process.exit(0);
    }
}

clear();
©*cascade08"(84770297d3180137a3ee1b0a38c78dd9b03991232Zfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/clear_pg_simple.js:Gfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator