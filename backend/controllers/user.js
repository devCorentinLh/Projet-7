const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.createUser = (req, res, next) => {
  // Création d'un utilisateur avec les informations envoyées dans le corps de la requête
  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  // Validation des données de l'utilisateur créé
  user.validate(function(err) {
    if (err) { // Si une erreur de validation survient, retourner une réponse avec l'erreur
      res.status(400).json({ error: err.message });
    } else { // Sinon, hasher le mot de passe et enregistrer l'utilisateur
      bcrypt
        .hash(req.body.password, 10) // Hasher le mot de passe avec un coût de 10
        .then((hash) => {
          user.password = hash;
          user
            .save() // Enregistrer l'utilisateur dans la base de données
            .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
            .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
    }
  });
};

exports.loginUser = (req, res, next) => {
  // Chercher l'utilisateur correspondant à l'email envoyé dans la requête
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) { // Si aucun utilisateur n'est trouvé, retourner une erreur
        return res
          .status(401)
          .json({ error: "Paire utilisateur/mot de passe incorrect !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        // Comparer le mot de passe envoyé avec celui enregistré dans la base de données
        .then((valid) => {
          if (!valid) { // Si les mots de passe ne correspondent pas, retourner une erreur
            return res
              .status(401)
              .json({ error: "Paire utilisateur/mot de passe incorrect !" });
          }
          // Si les mots de passe correspondent, retourner une réponse avec un jeton d'authentification
          res.status(200).json({
            userId: user._id, // Ajouter l'ID de l'utilisateur à la réponse
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              // Créer un jeton d'authentification avec l'ID de l'utilisateur
              expiresIn: "5h", // Le jeton expirera après 5 heures
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};