const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

// Définit où les fichiers téléchargés doivent être stockés sur le serveur et comment les renommer.
// Dans ce cas, ils sont stockés dans un dossier appelé "images".
// Le nom du fichier est composé du nom original du fichier, de l'horodatage actuel, et de l'extension du fichier.
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

// Initialise l'objet de middleware de téléchargement de fichiers.
// Il utilise la configuration de stockage et limite la taille des fichiers à 200000 octets (200 Ko).
// Il vérifie également que le type de fichier est autorisé en utilisant l'objet MIME_TYPES.
const upload = multer({
  storage,
  limits: { fileSize: 200000 },
  fileFilter: (req, file, callback) => {
    if (MIME_TYPES[file.mimetype]) {
      callback(null, true);
    } else {
      callback(new Error("Format de fichier non pris en charge"), false);
    }
  },
}).single("image");

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(err.httpCode || 400).json({
        message: "Une erreur est survenue lors du téléchargement de l'image",
      });
    }
    next();
  });
};
