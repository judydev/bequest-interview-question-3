import express from "express";
import cors from "cors";

const PORT = 8080;
const app = express();
const database = { data: "Hello World", timestamp: "2024-12-21T00:00:00Z" };
const backup = { data: "", timestamp: "" };

app.use(cors());
app.use(express.json());

// Routes

app.get("/", (req, res) => {
  res.json(database);
});

app.get("/backup", (req, res) => {
  res.json(backup);
});

app.put("/restore", (req, res) => {
  database.data = backup.data;
  database.timestamp = new Date().toISOString();

  backup.timestamp = new Date().toISOString();
  res.json(database);
});

app.post("/", (req, res) => {
  // Write existing data to backup
  backup.data = database.data; 

  // Write new data to database
  database.data = req.body.data;
  database.timestamp = req.body.timestamp;
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
