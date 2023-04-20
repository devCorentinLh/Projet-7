const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // récupération du token dans l'en-tête Authorization
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET"); // vérification de la validité du token
    const userId = decodedToken.userId; // extraction de l'identifiant de l'utilisateur à partir du token
    req.auth = {
      userId: userId
    };
    next();
  } catch (error) {
    res.status(401).json({ error }); // renvoie une erreur 401 si l'authentification échoue
  }
};