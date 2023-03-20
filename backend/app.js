const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require('path');
const rateLimit = require("express-rate-limit");
const stuffRoutes = require("./routes/stuff");
const userRoutes = require("./routes/user");
const dotEnv = require("dotenv")
dotEnv.config()
const mongoRoute = process.env.MONGO_ROUTE;
// Utilisation des variables d'environnement
const limiterDatas = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: "Trop de requêtes API lancées (> 100) dans les 15 dernières minutes."});

mongoose.connect(mongoRoute,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée!'));

const app = express();

// Requetes CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content, Accept, Content-Type, Authorization" );
  res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, PATCH, OPTIONS" );
  next();});

app.use(express.json());
app.use("/api/books", limiterDatas, stuffRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;