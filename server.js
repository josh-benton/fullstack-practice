const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const dotenv = require('dotenv').config();
const { Pool } = require('pg');

app.get("/test", (req, res) => {
  res.json("Hello World!");
});

app.listen(PORT, () => {
  console.log("Server is listening on port 3000...");
});
