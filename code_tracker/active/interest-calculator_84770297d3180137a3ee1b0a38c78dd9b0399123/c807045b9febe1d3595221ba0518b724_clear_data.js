îconst pool = require('./database');

const clearData = async () => {
    try {
        console.log('--- DATA CLEAR SCRIPT STARTED ---');
        console.log('Connecting to database...');

        // Wait for pool to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Executing TRUNCATE on borrowers and history...');
        const result = await pool.query('TRUNCATE borrowers, history RESTART IDENTITY CASCADE');
        console.log('TRUNCATE result:', result.command);
        console.log('Successfully cleared all records.');
        process.exit(0);
    } catch (err) {
        console.error('ERROR CLEARING DATA:');
        console.error(err.stack || err.message);
        process.exit(1);
    }
};

clearData();
h *cascade08hq*cascade08qr *cascade08rõ*cascade08õù *cascade08ù≤*cascade08≤≥ *cascade08≥’*cascade08’÷ *cascade08÷ﬂ*cascade08ﬂ· *cascade08·¡*cascade08¡¬ *cascade08¬Ÿ*cascade08Ÿ˛ *cascade08˛ç*cascade08çŸ *cascade08Ÿì*cascade08ìï *cascade08ïæ*cascade08æ¬ *cascade08¬√*cascade08√≈ *cascade08≈»*cascade08»  *cascade08 œ*cascade08œî *cascade08"(84770297d3180137a3ee1b0a38c78dd9b03991232Ufile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/clear_data.js:Gfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator