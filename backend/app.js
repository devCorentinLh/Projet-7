const express = require("express");
const path = require('path');
const stuffRoutes = require("./routes/stuff");
const userRoutes = require("./routes/user");
const helmet = require('helmet');

// Limite le nombre de requêtes API lancées dans les 10 dernières minutes
const limiterDatas = require("./middleware/ratelimit");

// Connexion à la base de données MongoDB
const mongooseConnect = require('./middleware/mongodb');
const app = express();

// Helmet
app.use(helmet({
      crossOriginResourcePolicy: {policy: "same-site"},
    crossOriginEmbedderPolicy: {policy: "require-corp"}
  }));

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
