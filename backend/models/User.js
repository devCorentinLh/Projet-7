const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Création du schéma de données pour les utilisateurs
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /\S+@\S+\.\S{2,}/.test(v);
      }
    },
    uniqueCaseInsensitive: true
  },
  password: { type: String, required: true },
});

// Ajouter le plugin uniqueValidator au schéma de données
// Pour garantir que deux utilisateurs ne peuvent pas partager la même adresse email
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema)
