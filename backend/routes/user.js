const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const password = require("../middleware/password");

const rateLimit = require("express-rate-limit");
// Limite les tentatives de connexion pour éviter les attaques force brute
const limiterUserLogin = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // Limite à 50 requêtes
    message: "Trop de requêtes."
  });

router.post("/signup", password, userCtrl.createUser);
router.post("/login", limiterUserLogin, userCtrl.loginUser);

module.exports = router;