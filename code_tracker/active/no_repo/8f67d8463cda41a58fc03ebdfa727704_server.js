»Iconsole.log('--- SERVER.JS INITIALIZING (PG VERSION) ---');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// --- Routes ---

// Register
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hashedPassword]);
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        if (err.code === '23505') { // Postgres unique_violation
            return res.status(400).json({ error: 'Username already exists' });
        }
        console.error('REGISTRATION ERROR:', err.message);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) {
        console.error('LOGIN ERROR:', err.message);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Middleware for protected routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Calculate Endpoint (Remains pure logic)
app.post('/api/calculate', (req, res) => {
    const { type, principal, rate, time, timeUnit, frequency, currency, rateUnit } = req.body;
    let P = parseFloat(principal);
    let R = parseFloat(rate);
    let T = parseFloat(time);
    let n = parseInt(frequency || 1);

    if (rateUnit === 'month') R = R * 12;
    if (timeUnit === 'months') T = T / 12;

    let interest = 0;
    let total = 0;
    let emi = 0;
    let chartData = [];
    let labels = [];

    if (type === 'simple') {
        interest = (P * R * T) / 100;
        total = P + interest;
        for (let i = 0; i <= Math.ceil(T); i++) {
            labels.push(`Year ${i}`);
            chartData.push(P + (P * R * i) / 100);
        }
    } else if (type === 'compound') {
        total = P * Math.pow((1 + (R / (100 * n))), (n * T));
        interest = total - P;
        for (let i = 0; i <= Math.ceil(T); i++) {
            labels.push(`Year ${i}`);
            chartData.push(P * Math.pow((1 + (R / (100 * n))), (n * i)));
        }
    } else if (type === 'emi') {
        const monthlyRate = R / (12 * 100);
        const months = T * 12;
        if (monthlyRate === 0) {
            emi = P / months;
        } else {
            emi = (P * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        }
        total = emi * months;
        interest = total - P;

        let balance = P;
        labels.push('Start');
        chartData.push(P);
        const step = Math.max(1, Math.floor(months / 10));

        for (let i = 1; i <= months; i++) {
            const interestForMonth = balance * monthlyRate;
            balance -= (emi - interestForMonth);
            if (i % step === 0 || i === months) {
                labels.push(`Month ${i}`);
                chartData.push(Math.max(0, balance));
            }
        }
    }

    res.json({ interest, total, emi, labels, chartData });
});

// Save History
app.post('/api/history', authenticateToken, async (req, res) => {
    const { type, principal, rate, time, result } = req.body;
    try {
        await db.query(
            'INSERT INTO history (user_id, type, principal, rate, time, result) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, type, principal, rate, time, JSON.stringify(result)]
        );
        res.status(201).json({ message: 'History saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save history' });
    }
});

// Get History
app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM history WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update Borrower
app.put('/api/borrowers/:id', authenticateToken, upload.single('evidence'), async (req, res) => {
    const { id } = req.params;
    const { name, village, age, amount, rate, rateUnit, givenAt } = req.body;
    let evidencePath = req.body.existingEvidence || null;

    if (req.file) {
        evidencePath = `uploads/${req.file.filename}`;
    }

    try {
        // Verify ownership
        const ownerCheck = await db.query('SELECT id FROM borrowers WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized to edit this borrower' });
        }

        await db.query(
            'UPDATE borrowers SET name = $1, village = $2, age = $3, amount = $4, rate = $5, rate_unit = $6, given_at = $7, evidence_path = $8 WHERE id = $9 AND user_id = $10',
            [name, village, age, amount, rate, rateUnit, givenAt, evidencePath, id, req.user.id]
        );
        res.json({ message: 'Borrower updated successfully' });
    } catch (err) {
        console.error('UPDATE BORROWER ERROR:', err.message);
        res.status(500).json({ error: 'Failed to update borrower: ' + err.message });
    }
});

// Update Borrower Status (Repaid or not)
app.patch('/api/borrowers/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { isRepaid } = req.body;

    try {
        const ownerCheck = await db.query('SELECT id FROM borrowers WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized to update this borrower' });
        }

        await db.query('UPDATE borrowers SET is_repaid = $1 WHERE id = $2 AND user_id = $3', [isRepaid, id, req.user.id]);
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error('UPDATE STATUS ERROR:', err.message);
        res.status(500).json({ error: 'Failed to update status: ' + err.message });
    }
});

// Add Borrower
app.post('/api/borrowers', authenticateToken, upload.single('evidence'), async (req, res) => {
    const { name, village, age, amount, rate, rateUnit, givenAt } = req.body;
    const evidencePath = req.file ? `uploads/${req.file.filename}` : null;

    try {
        await db.query(
            'INSERT INTO borrowers (user_id, name, village, age, amount, rate, rate_unit, given_at, evidence_path) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [req.user.id, name, village, age, amount, rate, rateUnit, givenAt, evidencePath]
        );
        res.status(201).json({ message: 'Borrower added successfully' });
    } catch (err) {
        console.error('ADD BORROWER ERROR:', err.message);
        res.status(500).json({ error: 'Failed to add borrower: ' + err.message });
    }
});

// Get Borrowers
app.get('/api/borrowers', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM borrowers WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error('GET BORROWERS ERROR:', err.message);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
( *cascade08(5*cascade085= *cascade08=º *cascade08ºÕ*cascade08Õø*cascade08ø‘ *cascade08‘¿*cascade08¿À *cascade08ÀÅ *cascade08Å *cascade08‚*cascade08‚° *cascade08°÷*cascade08÷ƒ *cascade08ƒƒ*cascade08ƒö	 *cascade08ö	ø	*cascade08ø	ú	 *cascade08ú	ü	*cascade08ü	Œ *cascade08Œ‘*cascade08‘• *cascade08•²*cascade08²¥ *cascade08¥¼*cascade08¼¿ *cascade08¿Ç*cascade08Ç€ *cascade08€‚*cascade08‚ƒ *cascade08ƒ‘*cascade08‘¤ *cascade08¤¥*cascade08¥§ *cascade08§ª*cascade08ªâ *cascade08âä*cascade08ä *cascade08‚*cascade08‚ƒ *cascade08ƒˆ*cascade08ˆ‰ *cascade08‰‹*cascade08‹ò *cascade08òõ*cascade08õö *cascade08öù*cascade08ùú *cascade08úü*cascade08ü *cascade08*cascade08  *cascade08 ¨*cascade08¨á *cascade08áã*cascade08ãä *cascade08äò*cascade08òš *cascade08š¬ *cascade08¬Á*cascade08Áµ *cascade08µ¿*cascade08¿Ö *cascade08Öƒ *cascade08ƒÀ  *cascade08À À *cascade08À İ$ *cascade08İ$Ş$*cascade08Ş$à$ *cascade08à$á$*cascade08á$â$ *cascade08â$ä$*cascade08ä$å$ *cascade08å$æ$*cascade08æ$è$ *cascade08è$é$*cascade08é$ÿ$ *cascade08ÿ$€%*cascade08€%‚' *cascade08‚') *cascade08))*cascade08)’) *cascade08’)”)*cascade08”)–) *cascade08–)˜)*cascade08˜)š) *cascade08š)œ)*cascade08œ)) *cascade08) )*cascade08 )¢) *cascade08¢)¤)*cascade08¤)², *cascade08²,³,*cascade08³,´, *cascade08´,·,*cascade08·,ğ, *cascade08ğ,ò,*cascade08ò,°- *cascade08°-·-*cascade08·-». *cascade08».¾. *cascade08¾.£8*cascade08£8ó>*cascade08ó>¯? *cascade08¯?Ê?*cascade08Ê?´@ *cascade08´@¸@ *cascade08¸@º@*cascade08º@»@ *cascade08»@½@*cascade08½@¾@ *cascade08¾@¿@*cascade08¿@À@ *cascade08À@Æ@*cascade08Æ@Ç@ *cascade08Ç@É@*cascade08É@Ê@ *cascade08Ê@Ğ@*cascade08Ğ@Ò@ *cascade08Ò@Ó@*cascade08Ó@Ô@ *cascade08Ô@Õ@*cascade08Õ@Ö@ *cascade08Ö@Û@*cascade08Û@Ü@ *cascade08Ü@ß@*cascade08ß@ã@ *cascade08ã@æ@*cascade08æ@è@ *cascade08è@é@*cascade08é@î@ *cascade08î@ï@*cascade08ï@ğ@ *cascade08ğ@ò@*cascade08ò@ó@ *cascade08ó@ô@*cascade08ô@ö@ *cascade08ö@ù@*cascade08ù@ú@ *cascade08ú@ü@*cascade08ü@‚A *cascade08‚A„B *cascade08„B“B*cascade08“BB *cascade08BŸB*cascade08ŸB¡B *cascade08¡B£B*cascade08£B¥B *cascade08¥B§B*cascade08§B©B *cascade08©B«B*cascade08«B­B *cascade08­B¯B*cascade08¯B±B *cascade08±B³B*cascade08³BµB *cascade08µB·B*cascade08·B¹B *cascade08¹B»B*cascade08»B½B *cascade08½B¿B*cascade08¿B‘C *cascade08‘CŸC*cascade08ŸC¤D *cascade08¤D»D*cascade08»D¾D *cascade08¾DÆD*cascade08ÆD‡E *cascade08‡E‰E*cascade08‰EŠE *cascade08ŠE˜E*cascade08˜E¬E *cascade08¬E¯E *cascade08¯EœF *cascade08œFF*cascade08FF *cascade08F¡F*cascade08¡FÜF *cascade08ÜFŞF*cascade08ŞFœG *cascade08œG£G*cascade08£GÖG *cascade08ÖGîG*cascade08îGñG *cascade08ñGùG*cascade08ùG²H *cascade08²H´H*cascade08´HµH *cascade08µHÃH*cascade08ÃHÚH *cascade08ÚHùH *cascade08ùH§I *cascade08§I¨I*cascade08¨I©I *cascade08©IªI*cascade08ªI´I *cascade08´I»I *cascade082Qfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/server.js