const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const keysFilePath = path.join(__dirname, "keys.json");

// Load keys
function loadKeys() {
    if (!fs.existsSync(keysFilePath)) {
        fs.writeFileSync(keysFilePath, JSON.stringify({}, null, 2));
    }
    return JSON.parse(fs.readFileSync(keysFilePath));
}

// Route
app.get("/script", (req, res) => {
    try {
        const key = req.query.key;
        const keys = loadKeys();
        const user = keys[key];

        console.log("🔑 Request with key:", key);

        // 🔒 Global kill switch (toggle manually if needed)
        const GLOBAL_KILL = false;

        if (GLOBAL_KILL) {
            return res.json({ allowed: false, kill: true });
        }

        if (!user) return res.json({ allowed: false, kill: false });
        if (!user.active) return res.json({ allowed: false, kill: false });

        const now = new Date();
        const expiry = new Date(user.expires);

        if (now > expiry) return res.json({ allowed: false, kill: false });

        // ✅ Valid user
        res.json({
            allowed: true,
            kill: false
        });

    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ allowed: false, kill: false });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
});