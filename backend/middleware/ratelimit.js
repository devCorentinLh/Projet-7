const express = require("express");
const path = require('path');
const rateLimit = require("express-rate-limit");


// Limite le nombre de requêtes dans les 5 dernières minutes à 50
const limiterDatas = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  message: "Trop de requêtes."});