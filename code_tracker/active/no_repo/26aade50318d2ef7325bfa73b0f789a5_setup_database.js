îrequire('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

const logFile = 'setup_log.txt';
if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}
function logErr(msg, err) {
  console.error(msg, err);
  fs.appendFileSync(logFile, msg + ' ' + JSON.stringify(err, Object.getOwnPropertyNames(err)) + '\n');
}

async function setupDatabase() {
  log('Starting setup...');
  let connection;
  try {
    log('Connection params: ' + JSON.stringify({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    }));
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    log('Connected to server.');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    log(`Database '${process.env.DB_NAME}' created or checks out.`);

    await connection.changeUser({ database: process.env.DB_NAME });
    log('Changed to target database.');

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.query(createUsersTable);
    log('Users table ready.');

    const createHistoryTable = `
      CREATE TABLE IF NOT EXISTS history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        type VARCHAR(50) NOT NULL,
        principal DECIMAL(15, 2) NOT NULL,
        rate DECIMAL(5, 2) NOT NULL,
        time DECIMAL(5, 2) NOT NULL,
        result JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.query(createHistoryTable);
    log('History table ready.');

    const createBorrowersTable = `
          CREATE TABLE IF NOT EXISTS borrowers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            name VARCHAR(255) NOT NULL,
            village VARCHAR(255),
            age INT,
            amount DECIMAL(15, 2) NOT NULL,
            rate DECIMAL(15, 2) NOT NULL,
            rate_unit VARCHAR(10) DEFAULT 'year',
            given_at DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `;
    await connection.query(createBorrowersTable);
    log('Borrowers table ready.');

  } catch (err) {
    logErr('Error setting up database:', err);
  } finally {
    if (connection) await connection.end();
    log('Setup finished.');
  }
}

setupDatabase();
G *cascade08GÜ *cascade08ÜΩ*cascade08Ω˜ *cascade08˜Ö*cascade08Öâ *cascade08âë*cascade08ëí *cascade08íî*cascade08îï*cascade08ï°*cascade08°¢ *cascade08¢¶*cascade08¶© *cascade08©™*cascade08™π *cascade08πﬂ *cascade08ﬂ‡*cascade08‡· *cascade08·Í*cascade08ÍÎ *cascade08ÎÌ*cascade08ÌÓ *cascade08Ó˛*cascade08˛ä *cascade08äï *cascade08ï∫*cascade08∫… *cascade08…Ï *cascade08ÏÓ*cascade08Óí *cascade08íî*cascade08î∞ *cascade08∞≤*cascade08≤Ÿ *cascade08Ÿ⁄*cascade08⁄‹ *cascade08‹›*cascade08›‰ *cascade08‰Ü*cascade08Üﬂ *cascade08ﬂﬂ*cascade08ﬂ‰ *cascade08‰ç	*cascade08ç	„ *cascade08„„*cascade08„ç *cascade08çè *cascade08èë *cascade08ëë*cascade08ë≥ *cascade08≥µ*cascade08µ∫*cascade08∫º *cascade08ºæ*cascade08æ¿ *cascade08¿˘ *cascade08˘˙*cascade08˙Ô *cascade08Ô *cascade08Ã*cascade08ÃÕ *cascade08Õ“*cascade08“” *cascade08”ö*cascade08öú *cascade08ú¶*cascade08¶ß *cascade08ß≤*cascade08≤≥ *cascade08≥∂*cascade08∂∑ *cascade08∑⁄ *cascade08⁄‹ *cascade08‹ﬁ *cascade08ﬁﬂ*cascade08ﬂ‡ *cascade08‡Â*cascade08ÂÊ *cascade08ÊÔ*cascade08ÔÛ *cascade08ÛÙ*cascade08Ùı *cascade08ı˜*cascade08˜° *cascade08°¢*cascade08¢£ *cascade08£•*cascade08•¶ *cascade08¶™*cascade08™´ *cascade08´¨*cascade08¨≤ *cascade08≤≥*cascade08≥¥ *cascade08¥µ*cascade08µ∂ *cascade08∂∑*cascade08∑∏ *cascade08∏∫*cascade08∫ª *cascade08ªº*cascade08ºæ *cascade08æø*cascade08ø¡ *cascade08¡◊ *cascade08◊Ù*cascade08Ùî *cascade082Yfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/setup_database.js