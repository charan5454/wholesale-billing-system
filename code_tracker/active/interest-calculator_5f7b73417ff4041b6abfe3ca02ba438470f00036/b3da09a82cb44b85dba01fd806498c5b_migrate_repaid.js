íconst { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

function parseEnv() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.join('=').trim();
        }
    });
    return env;
}

const env = parseEnv();
const pool = new Pool({
    user: env.DB_USER || 'root',
    host: env.DB_HOST || 'localhost',
    database: env.DB_NAME || 'interest_calculator',
    password: env.DB_PASSWORD || '',
    port: 5432,
});

async function alter() {
    try {
        console.log('Adding is_repaid column...');
        await pool.query('ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS is_repaid BOOLEAN DEFAULT FALSE');
        console.log('SUCCESS');
    } catch (e) {
        console.error('FAILED:', e.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

alter();
í*cascade08"(5f7b73417ff4041b6abfe3ca02ba438470f000362Yfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/migrate_repaid.js:Gfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator