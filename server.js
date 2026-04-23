const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const keysFilePath = path.join(__dirname, "keys.json");
newFunction();
function newFunction() {
    console.log(`🚀 Extension has been moved`);
}

// 🔹 Load keys
function loadKeys() {
    if (!fs.existsSync(keysFilePath)) {
        fs.writeFileSync(keysFilePath, JSON.stringify({}, null, 2));
    }
    return JSON.parse(fs.readFileSync(keysFilePath));
}

// 🔹 Save keys
function saveKeys(data) {
    fs.writeFileSync(keysFilePath, JSON.stringify(data, null, 2));
}

// 🔑 Generate random key
function generateKey() {
    return "user_" + Math.random().toString(36).substring(2, 10);
}

// 📅 Expiry generator
function getExpiry(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
}

// ==============================
// 🔐 MAIN LICENSE CHECK (WITH FP)
// ==============================
app.get("/script", (req, res) => {

    const key = req.query.key;
    const fingerprint = req.query.fp;

    console.log(`🚫 Blocked request | Key: ${key} | FP: ${fingerprint}`);

    return res.status(403).json({
        allowed: false,
        kill: true,
        error: "OUTDATED_VERSION",
        message: "This version is no longer supported.",
        contact: "WhatsApp 0700373370"
    });
});

// ==============================
// 🔑 GENERATE KEY (ADMIN)
// ==============================
app.get("/generate-key", (req, res) => {

    const adminKey = req.query.admin;
    if (adminKey !== "MY_SECRET_ADMIN") {
        return res.status(403).send("Unauthorized");
    }

    const days = parseInt(req.query.days) || 30;
    const keys = loadKeys();

    let newKey;
    do {
        newKey = generateKey();
    } while (keys[newKey]);

    keys[newKey] = {
        expires: getExpiry(days),
        active: true,
        devices: [] // 🔥 important
    };

    saveKeys(keys);

    res.json({
        key: newKey,
        expires: keys[newKey].expires
    });
});

// ==============================
// ❌ REVOKE KEY (ADMIN)
// ==============================
app.get("/revoke-key", (req, res) => {

    const adminKey = req.query.admin;
    if (adminKey !== "MY_SECRET_ADMIN") {
        return res.status(403).send("Unauthorized");
    }

    const key = req.query.key;
    const keys = loadKeys();

    if (!keys[key]) {
        return res.status(404).send("Key not found");
    }

    keys[key].active = false;
    saveKeys(keys);

    res.json({
        success: true,
        message: "Key revoked"
    });
});

// ==============================
// 🚀 START SERVER
// ==============================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
