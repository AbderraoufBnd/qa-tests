// Simple Express downstream server
// listens on port 8085 and exposes a POST /login route
// it expects a JSON body with a `user` field and echoes it back with some extra data

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/login", (req, res) => {
    const body = req.body;
    if (!body || typeof body !== "object") {
        return res.status(400).json({ error: "JSON body required" });
    }
    if (!body.user) {
        return res.status(400).json({ error: "Missing 'user' key" });
    }

    const response = {
        user: body.user,
        ...(body?.data && { data: body.data }),
        token: "fake-jwt-token",
        timestamp: new Date().toISOString(),
    };
    res.json(response);
});

// test helper route: always respond without `user` field
app.post("/login-no-user", (req, res) => {
    const body = req.body;
    if (!body || typeof body !== "object") {
        return res.status(400).json({ error: "JSON body required" });
    }
    if (!body.user) {
        return res.status(400).json({ error: "Missing 'user' key" });
    }

    // deliberately omit the user field to simulate a bad downstream response
    res.json({ token: "fake-jwt-token", timestamp: new Date().toISOString() });
});

// additional route to return non-JSON body for testing
app.post("/login-invalid", (req, res) => {
    // always returns plain text instead of JSON
    res.setHeader("Content-Type", "text/plain");
    res.send("this is not json");
});

const PORT = 8085;
app.listen(PORT, () => {
    console.log(`Downstream server listening on http://localhost:${PORT}`);
});
