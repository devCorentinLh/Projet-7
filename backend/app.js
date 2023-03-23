const express = require("express");
const mongoose = require("mongoose");
const path = require('path');
const rateLimit = require("express-rate-limit");
const stuffRoutes = require("./routes/stuff");
const userRoutes = require("./routes/user");

const limiterDatas = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  message: "Trop de requêtes API lancées dans les 15 dernières minutes."}); // Limites les requêtes

const mongooseConnect = require('./mongodb'); // Connexion Mongodb

const app = express();

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
