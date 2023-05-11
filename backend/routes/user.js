const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const password = require("../middleware/password");

// Limite les tentatives de connexion pour éviter les attaques force brute
const limiterUserLogin = require("../middleware/ratelimit");

router.post("/signup", password, userCtrl.createUser);
router.post("/login", limiterUserLogin, userCtrl.loginUser);

module.exports = router;