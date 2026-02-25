Œconst os = require('os');
const fs = require('fs');
const interfaces = os.networkInterfaces();
const ips = [];
for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === 'IPv4' && !alias.internal) {
            ips.push({ name: devName, address: alias.address });
        }
    }
}
fs.writeFileSync('ips.json', JSON.stringify(ips, null, 2));
console.log('Saved ' + ips.length + ' IPs');
Œ*cascade082Sfile:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/save_ips.js