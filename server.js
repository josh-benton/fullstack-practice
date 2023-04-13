const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const dotenv = require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

// Test get route
app.get("/test", (req, res) => {
  res.json("Hello World!");
});

// Get route handler that queries against the database and responds with all rows
app.get("/api/users", (req, res) => {
  pool.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error querying the database");
    } else {
      res.send(result.rows);
    }
  });
});

// Get route handler that queries against the database and responds with a specific row
app.get("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  pool.query("SELECT * FROM users WHERE id = $1", [userId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    } else {
      res.send(result.rows);
    }
  });
});

// Post route handler to the database
app.post("/api/users", (req, res) => {
  const { name, email, password } = req.body;
  pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, password],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.status(201).json(result.rows[0]);
      }
    }
  );
});

// Patch route handler to edit a specific row in the database
app.patch("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const { name, email, password } = req.body;
  const query =
    "UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), password = COALESCE($3, password) WHERE id = $4 RETURNING *";
  const values = [name || null, email || null, password || null, userId];
  pool.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else if (result.rowCount === 0) {
      res.status(404).send(`User with ID ${userId} not found`);
    } else {
      res.status(200).json(result.rows[0]);
    }
  });
});

app.listen(PORT, () => {
  console.log("Server is listening on port 3000...");
});
