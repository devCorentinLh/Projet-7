const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const password = require("../middleware/password");
const rateLimit = require("express-rate-limit");
const RedisStore = require('rate-limit-redis');

const limiterUserLogin = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 10, 
  message: 'Trop de tentatives, réessayez dans 5 minutes'
});

router.post("/signup", password, userCtrl.createUser);
router.post("/login", limiterUserLogin, userCtrl.loginUser);


module.exports = router;