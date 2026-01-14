const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const app = express();
const PORT = 3001;

// --- CONFIGURATION ---
// TODO: Replace with your actual Google Client ID
const CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// TODO: Replace with the actual admin email you want to test with
const REAL_ADMIN_EMAIL = "admin@example.com";
const LOG_FILE = path.join(__dirname, 'attack_logs.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- TRAPS ---
const TRAPS = {
    sqli: /('|"|`)\s*OR\s*('|"|`)?1('|"|`)?\s*=\s*('|"|`)?1|--|UNION\s+SELECT/i,
    xss: /<script>|javascript:|onerror=|onload=|alert\(/i,
    lfi: /\.\.\/|\/etc\/passwd|c:\\windows|boot\.ini/i
};

// --- LOGGING ---
function logAttack(type, ip, payload) {
    const newLog = {
        timestamp: new Date().toISOString(),
        type: type,
        ip: ip || 'Unknown',
        payload: payload
    };
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        let logs = [];
        if (!err) { try { logs = JSON.parse(data); } catch(e) {} }
        logs.push(newLog);
        fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), (err) => {});
    });
    console.log(`🚨 [TRAP TRIGGERED] ${type}`);
}

// --- ROUTE 1: SEARCH (CRASH FIXED + MOCK DATA) ---
app.all('/compare', (req, res) => {
    // 🛠️ FIX: Use '?.' to safely read inputs without crashing
    const qFrom = req.query?.from || req.body?.from || "";
    const qTo = req.query?.to || req.body?.to || "";
    const date = req.query?.date || req.body?.date || "Tomorrow";

    const input = qFrom + qTo + date;
    const ip = req.ip;

    // 1. CHECK TRAPS
    if (TRAPS.sqli.test(input)) {
        logAttack("SQL Injection", ip, input);
        return res.status(200).send(`<html><body><h1>MySQL Error 1064 (42000)</h1><p>Syntax error near '${input}'</p></body></html>`);
    }
    if (TRAPS.xss.test(input)) {
        logAttack("XSS Attack", ip, input);
        return res.status(200).send(`<html><body><h1>403 Forbidden</h1><p>WAF Blocked XSS Pattern.</p></body></html>`);
    }
    if (TRAPS.lfi.test(input)) {
        logAttack("LFI Attack", ip, input);
        // SANITIZED: Removed personal name from fake /etc/passwd response
        return res.send(`root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:honeypot,,,:/home/user:/bin/bash`);
    }

    // 2. GENERATE MOCK DATA (If inputs are safe)
    // Helper to generate random price between ₹3000 and ₹12000
    const genPrice = () => "₹" + Math.floor(Math.random() * (12000 - 3000) + 3000).toLocaleString('en-IN');

    // Create realistic results for 3 different websites
    const results = [
        {
            website: "MakeMyTrip",
            airline: "IndiGo 6E-554",
            time: "09:00 - 11:30",
            type: "Non-stop",
            price: genPrice()
        },
        {
            website: "Goibibo",
            airline: "Air India AI-804",
            time: "14:15 - 17:00",
            type: "Non-stop",
            price: genPrice()
        },
        {
            website: "Skyscanner",
            airline: "Vistara UK-990",
            time: "19:00 - 21:45",
            type: "1 Stop",
            price: genPrice()
        }
    ];

    // Send JSON response
    res.json({
        success: true,
        search: { from: qFrom, to: qTo, date: date },
        results: results
    });
});

// --- ROUTE 2: LOGIN ---
app.post('/api/login', (req, res) => {
    const username = req.body?.username || "";
    if (username === 'admin' || username === 'root' || TRAPS.sqli.test(username)) {
        logAttack("Brute Force Login", req.ip, `User: ${username}`);
        return res.json({ redirect: "/fake_admin.html" });
    }
    return res.json({ redirect: "/index.html", message: "Login Successful" });
});

// --- ROUTE 3: OAUTH ---
function fallbackDecode(token) {
    try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
}

app.post('/api/verify-google-token', async (req, res) => {
    const token = req.body?.token;
    if (!token) return res.status(400).json({ error: "Missing Token" });

    let email = "";
    try {
        const ticket = await client.verifyIdToken({ idToken: token, audience: CLIENT_ID });
        email = ticket.getPayload().email;
    } catch (e) {
        const payload = fallbackDecode(token);
        if (payload && payload.email) email = payload.email;
        else return res.status(400).json({ error: "Invalid Token" });
    }

    if (email === REAL_ADMIN_EMAIL) {
        return res.json({ redirect: "http://localhost:5000" });
    } else {
        return res.json({ redirect: "/index.html" });
    }
});

// TRAP 4: CONTACT FORM (Catches XSS - Cross Site Scripting)
app.post('/api/contact', (req, res) => {
    // 1. Get the message from the user
    const { message } = req.body;
    const ip = req.ip;

    // 2. DEFINE THE TRAP (Regex to catch malicious scripts)
    // Looks for: <script>, javascript:, onload=, alert(, etc.
    const xssPattern = /(<script|javascript:|onload=|onerror=|alert\(|document\.cookie)/i;

    // 3. CHECK FOR ATTACK
    if (xssPattern.test(message)) {
        // LOG IT!
        logAttack('XSS_ATTEMPT', `Payload: ${message}`, ip);

        // FAKE RESPONSE: Pretend to be a WAF (Web Application Firewall) blocking them
        // This makes the hacker think "Oh, this site has security, let me try harder!"
        return res.send(`<html><body><h1>403 Forbidden</h1><p>WAF Blocked XSS Pattern.</p></body></html>`);
    }

    // 4. NORMAL BEHAVIOR
    return res.json({ success: true, message: "Message sent to support team!" });
});

// --- TRAP 3: FILE DOWNLOAD (Catches LFI - Local File Inclusion) ---
// Triggered by links like: /api/download?file=../../etc/passwd
app.get('/api/download', (req, res) => {
    const filename = req.query.file;
    const ip = req.ip;

    // LFI Detection Logic
    // If they ask for "passwd", "boot.ini", or try to go up directories ("../")
    if (filename.includes('../') || filename.includes('/etc/passwd') || filename.includes('boot.ini')) {

        console.log(`[ALERT] LFI Attack Detected from ${ip} targeting ${filename}`);
        logAttack('LFI_ATTACK', `Target File: ${filename}`, ip);

        // FAKE SUCCESS: Serve a fake sensitive file to trick them
        return res.send("root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash\n");
    }

    // Normal Behavior (If they just want the brochure)
    res.status(404).send("Error: Brochure file not found on this server.");
});

if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '[]');
app.listen(PORT, () => console.log(`✅ Intelligent Honeypot running on ${PORT}`));
