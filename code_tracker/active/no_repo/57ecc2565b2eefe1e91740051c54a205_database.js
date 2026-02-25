≠require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Test connection and initialize tables
const initDb = async () => {
    try {
        const client = await pool.connect();
        console.log('PostgreSQL connected successfully');

        // Auto Table Creation
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50),
                principal NUMERIC,
                rate NUMERIC,
                time NUMERIC,
                result JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS borrowers (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255),
                village VARCHAR(255),
                age INTEGER,
                amount NUMERIC,
                rate NUMERIC,
                rate_unit VARCHAR(20),
                given_at DATE,
                evidence_path TEXT,
                is_repaid BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Add is_repaid column if it doesn't exist (Migration)
            ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS is_repaid BOOLEAN DEFAULT FALSE;
        `);
        console.log('PostgreSQL tables initialized');
        client.release();
    } catch (err) {
        console.error('Database initialization failed:', err.message);
    }
};

initDb();

module.exports = pool;
# *cascade08#(*cascade08() *cascade08)+*cascade08+8 *cascade0889*cascade089M *cascade08MN*cascade08NO *cascade08OQ*cascade08Q] *cascade08]e*cascade08ef *cascade08fh*cascade08hi *cascade08im*cascade08m| *cascade08|*cascade08Ä *cascade08ÄÅ*cascade08ÅÇ *cascade08Çá*cascade08áé *cascade08éè*cascade08èê *cascade08êñ*cascade08ñó *cascade08ó¢*cascade08¢£ *cascade08£ß*cascade08ß© *cascade08©¬*cascade08¬√ *cascade08√∆*cascade08∆« *cascade08«ﬂ*cascade08ﬂ· *cascade08·Ê*cascade08ÊÁ *cascade08ÁÍ*cascade08ÍÎ *cascade08ÎÌ*cascade08ÌÓ *cascade08Óˇ*cascade08ˇÖ *cascade08Öó*cascade08óò *cascade08ò§*cascade08§• *cascade08•®*cascade08®´ *cascade08´Æ*cascade08ÆØ *cascade08Ø≤*cascade08≤≥ *cascade08≥≈*cascade08≈∆ *cascade08∆»*cascade08»  *cascade08 œ*cascade08œ– *cascade08–÷*cascade08÷◊ *cascade08◊ı*cascade08ı˚ *cascade08˚Ñ*cascade08ÑÖ *cascade08Öà*cascade08àä *cascade08äã*cascade08ãç *cascade08çé*cascade08éè *cascade08èì*cascade08ìî *cascade08î•*cascade08•¶ *cascade08¶®*cascade08®™ *cascade08™´*cascade08´¨ *cascade08¨ *cascade08 À *cascade08À—*cascade08—“ *cascade08“¸*cascade08¸˝ *cascade08˝Ç*cascade08ÇÉ *cascade08Éà*cascade08àâ *cascade08âä*cascade08äç *cascade08çè*cascade08èì *cascade08ì†*cascade08†¢ *cascade08¢§*cascade08§• *cascade08•⁄*cascade08⁄€ *cascade08€‡*cascade08‡· *cascade08·‚*cascade08‚„ *cascade08„*cascade08Û *cascade08Ûˇ*cascade08ˇÑ *cascade08ÑÖ*cascade08ÖÜ *cascade08Üå*cascade08åç *cascade08çù*cascade08ùû *cascade08ûÌ*cascade08ÌÓ *cascade08ÓÔ*cascade08Ô *cascade08Ö*cascade08ÖÜ *cascade08Üú*cascade08úü *cascade08ü°*cascade08°• *cascade08•Ø*cascade08Ø∞ *cascade08∞±*cascade08±≤ *cascade08≤ *cascade08 À *cascade08ÀÃ*cascade08ÃÕ *cascade08ÕŸ*cascade08Ÿ⁄ *cascade08⁄¯*cascade08¯˘ *cascade08˘¸*cascade08¸˝ *cascade08˝Ü*cascade08Üá *cascade08áà*cascade08àè *cascade08èö*cascade08öù *cascade08ùü*cascade08ü† *cascade08†¬*cascade08¬ƒ *cascade08ƒ÷*cascade08÷◊ *cascade08◊ﬁ*cascade08ﬁﬂ *cascade08ﬂ·*cascade08·„ *cascade08„˘*cascade08˘˙ *cascade08˙¸*cascade08¸ˇ *cascade08ˇÄ*cascade08ÄÅ *cascade08ÅÇ*cascade08ÇÉ *cascade08Éù*cascade08ùû *cascade08û°*cascade08°£ *cascade08£§*cascade08§• *cascade08•¶*cascade08¶ß *cascade08ß∞*cascade08∞± *cascade08±∏*cascade08∏π *cascade08π *cascade08 Ã *cascade08Ãÿ*cascade08ÿﬁ *cascade08ﬁ„*cascade08„‰ *cascade08‰Ó*cascade08ÓÔ *cascade08Ôã	*cascade08ã	å	 *cascade08å	ç	*cascade08ç	é	 *cascade08é	ó	*cascade08ó	ò	 *cascade08ò	Ã	*cascade08Ã	Õ	 *cascade08Õ	œ	*cascade08œ	–	 *cascade08–	ì
*cascade08ì
î
 *cascade08î
•
*cascade08•
ß
 *cascade08ß
π
*cascade08π
∫
 *cascade08∫
º
*cascade08º
æ
 *cascade08æ
¬
*cascade08¬
√
 *cascade08√
˛
*cascade08˛
ˇ
 *cascade08ˇ
Ä*cascade08ÄÅ *cascade08Å†*cascade08†° *cascade08°æ*cascade08æø *cascade08ø¬*cascade08¬√ *cascade08√Õ*cascade08ÕŒ *cascade08Œ–*cascade08–— *cascade08—“*cascade08“‘ *cascade08‘÷*cascade08÷⁄ *cascade08⁄Î*cascade08ÎÏ *cascade08Ïà*cascade08àã *cascade08ãë*cascade08ëí *cascade08íô*cascade08ôö *cascade08ö© *cascade08©€*cascade08€õ *cascade08õ© *cascade08©´*cascade08´ø *cascade08ø  *cascade08 · *cascade08·Ï*cascade08ÏÔ *cascade08Ô*cascade08Ò *cascade08ÒÚ*cascade08ÚÛ *cascade08ÛÙ*cascade08Ùı *cascade08ıˆ*cascade08ˆ˜ *cascade08˜¸*cascade08¸å *cascade08åè*cascade08èê *cascade08êë*cascade08ë© *cascade08©™*cascade08™Æ *cascade08ÆØ*cascade08Ø” *cascade08”‘*cascade08‘’ *cascade08’›*cascade08›ˇ *cascade08ˇÉ*cascade08ÉÜ *cascade08Üè*cascade08è≠ *cascade082Sfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/database.js