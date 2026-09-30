const express = require("express");
const { configure, trackTrain, checkPNRStatus } = require("railkit");

const app = express();

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/", (req, res) => res.send("RailKit proxy OK"));

app.get("/live", async (req, res) => {
  try {
    const { train, date, key } = req.query;
    if (!train || !key) return res.status(400).json({ error: "Need train and key" });
    configure(key);
    const result = await trackTrain(train, date || "today");
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.get("/pnr", async (req, res) => {
  try {
    const { pnr, key } = req.query;
    if (!pnr || !key) return res.status(400).json({ error: "Need pnr and key" });
    configure(key);
    const result = await checkPNRStatus(pnr);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));