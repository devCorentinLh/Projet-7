const express = require("express");
const path = require('path');
const stuffRoutes = require("./routes/stuff");
const rateLimit = require("express-rate-limit");
const dotEnv = require("dotenv").config({ path: "./config/.env" });
const userRoutes = require("./routes/user");

// Limite le nombre de requêtes API lancées
const limiterDatas = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limite à 50 requêtes
  message: "Trop de requêtes."
});

// Connexion à la base de données MongoDB
const mongooseConnect = require('./middleware/mongodb');
const app = express();

// Helmet
const Helmet = require('./middleware/helmet');

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();});

app.use(express.json());
app.use("/api/books", limiterDatas, stuffRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
