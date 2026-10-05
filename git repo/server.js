const express = require("express");
const {
  configure,
  trackTrain,
  checkPNRStatus,
  searchTrainBetweenStations,
  getAvailability,
  fareLookup
} = require("railkit");

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

// Trains between stations
app.get("/between", async (req, res) => {
  try {
    const { from, to, date, key } = req.query;
    if (!from || !to || !key) return res.status(400).json({ error: "Need from, to and key" });
    configure(key);
    const result = await searchTrainBetweenStations(from.toUpperCase(), to.toUpperCase(), date || undefined);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

// Seat availability
app.get("/seats", async (req, res) => {
  try {
    const { train, from, to, date, coach, quota, key } = req.query;
    if (!train || !from || !to || !date || !coach || !key) {
      return res.status(400).json({ error: "Need train, from, to, date, coach, key" });
    }
    configure(key);
    const result = await getAvailability(
      train, from.toUpperCase(), to.toUpperCase(), date, coach.toUpperCase(), (quota || "GN").toUpperCase()
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

// Fare
app.get("/fare", async (req, res) => {
  try {
    const { train, from, to, date, coach, quota, key } = req.query;
    if (!train || !from || !to || !date || !coach || !key) {
      return res.status(400).json({ error: "Need train, from, to, date, coach, key" });
    }
    configure(key);
    const result = await fareLookup(
      train, from.toUpperCase(), to.toUpperCase(), date, coach.toUpperCase(), (quota || "GN").toUpperCase()
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));