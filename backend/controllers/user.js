const bcrypt = require("bcrypt");
// bcrypt est utilisé pour hasher le mot de passe de l'utilisateur avant de l'enregistrer dans la base de données
const jwt = require("jsonwebtoken");
// jsonwebtoken est utilisé pour attribuer un jeton d'authentification à un utilisateur au moment de la connexion
const User = require("../models/User");
// Importer le modèle User
const hashNumber =  (process.env.HASH);
// Importer le nombre de hachages du mot de passe stocké dans le fichier .env

exports.createUser = (req, res, next) => {
  // Récupérer l'adresse email en minuscules
  const email = req.body.email.toLowerCase();
  // Création d'un utilisateur avec les informations envoyées dans le corps de la requête
  const user = new User({
    email: email,
    password: req.body.password,
  });

  // Validation des données de l'utilisateur créé
  user.validate(function(err) {
    if (err) { // Si une erreur de validation survient, retourner une réponse avec l'erreur
      res.status(400).json({ error: err.message });
    } else {
      // Sinon, hasher le mot de passe et enregistrer l'utilisateur
      // Bcrypt va hasher le mot de passe envoyé avec un coût de 10 pour créer une chaîne de caractères sécurisée
      bcrypt
        .hash(req.body.password, hashNumber) // Hasher le mot de passe avec un coût stocké dans le fichier .env
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
  // Récupérer l'adresse email en minuscules
  const email = req.body.email.toLowerCase();

  // Chercher l'utilisateur correspondant à l'email envoyé dans la requête
  User.findOne({ email: email })
    .then((user) => {
      if (!user) { // Si aucun utilisateur n'est trouvé, retourner une erreur
        return res
          .status(401)
          .json({ error: "Paire utilisateur/mot de passe incorrect !" });
      }
      // Bcrypt va hasher le mot de passe envoyé et le comparer avec le hash enregistré dans la base de données
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
              expiresIn: "4h", // Le jeton expirera après 4 heures
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
