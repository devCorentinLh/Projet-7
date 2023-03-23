const mongoose = require("mongoose");
const dotEnv = require("dotenv").config();
const mongoRoute = (process.env.MONGO);

mongoose.connect(mongoRoute,
    { useNewUrlParser: true,
      useUnifiedTopology: true })
    .then(() => console.log('Connexion Mongo réussie'))
    .catch(() => console.log('Connexion Mongo échouée')); // Connexion Mongo via .env