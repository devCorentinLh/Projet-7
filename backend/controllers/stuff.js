const Book = require("../models/Book");
const fs = require("fs");
const sharp = require("sharp");

// fonction pour redimensionner l'image
const resizeImage = async (imagePath) => {
  await new Promise((resolve, reject) => {
    sharp(imagePath)
      .resize({ width: 300, height: 300, fit: 'contain' })
      .toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          fs.writeFileSync(imagePath, buffer);
          resolve();
        }
      });
  });
  const metadata = await sharp(imagePath).metadata();
  console.log("Image après le redimensionnement : ", metadata);
};

// fonction pour enregistrer un nouveau livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject.userId; // on supprime l'userId dans l'objet du livre pour ne pas le modifier
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    averageRating: bookObject.ratings[0].grade // on récupère la note de la première évaluation pour le calcul de la note moyenne
  });
  book
    .save()
    .then(() => {
      // appel de la fonction resize pour redimensionner l'image
      resizeImage(req.file.path)
        .then(() => {
          res.status(201).json({ message: "Livre enregistré !" }); // Requête traitée avec succès et création d’un document
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ error: err });
        });
    })
    .catch((error) => res.status(400).json({ error: bookObject }));
};

// fonction pour modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };
  delete bookObject.userId; // on supprime l'userId dans l'objet du livre pour ne pas le modifier
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // vérification que userId du livre est égal à celui connecté.
      if (book.userId !== req.auth.userId) {
        res
          .status(401)
          .json({ message: "Vous n'êtes pas le créateur de ce livre." });
      } else {
        if (bookObject.imageUrl) {
          const filename = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            // appel de la fonction resize pour redimensionner l'image
            resizeImage(req.file.path)
              .then(() => {
                updateNewBook();
              })
              .catch((err) => {
                console.log(err);
                res.status(400).json({ error: err });
              });
          });
        } else {
          updateNewBook();
        }
        function updateNewBook() {
          Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
            .then(() => {
              res.status(200).json(bookObject);
            })
            .catch((err) => res.status(401).json({ err }));
        }
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Cette fonction gère l'erreur lors de la récupération de tous les livres
// Si une erreur se produit, elle renvoie un message d'erreur avec un code d'état HTTP 400
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error: "erreur" }));
};

// Cette fonction supprime un livre de la base de données
// Si le livre n'appartient pas à l'utilisateur actuel, elle renvoie un message d'erreur avec un code d'état HTTP 401
// Elle supprime également l'image associée au livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" }); // requête non autorisé
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () =>
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Livre supprimé !" })) // Requête traitée avec succès
            .catch((err) => res.status(400).json({ err })) // Erreur de la requête
        );
      }
    })
    .catch((error) => {
      res.status(500).json({ error }); // Erreur interne du serveur
    });
};

// Cette fonction renvoie les trois meilleurs livres classés par note moyenne décroissante
// Si une erreur se produit, elle renvoie un message d'erreur avec un code d'état HTTP 400
exports.getBestBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res
        .status(200)
                .json(
          [...books]
            .sort((a, b) => b.averageRating - a.averageRating) // tri décroissant avec sort
            .splice(0, 3) //remonte les 3 premiers livres
        );
    })
    .catch((err) => res.status(400).json({ err }));
};

// Cette fonction récupère un livre spécifique de la base de données
// Elle modifie l'URL de l'image pour renvoyer une URL valide
// Si une erreur se produit, elle renvoie un message d'erreur avec un code d'état HTTP 400
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then((book) => {
    const imageUrl = `${req.protocol}://${req.get("host")}/images/${book.imageUrl.split("/images/")[1]}`;
  res.status(200).json({...book._doc, imageUrl});
  })
  .catch((error) => {
  res.status(400).json({ error });
  });
  };

// Cette fonction ajoute une note à un livre spécifique dans la base de données
// Elle calcule également la nouvelle note moyenne pour le livre
// Si une erreur se produit, elle renvoie un message d'erreur avec un code d'état HTTP 400 ou 401
  exports.postRating = (req, res, next) => {
    const newRating = { ...req.body };
    newRating.grade = newRating.rating;
    delete newRating.rating;
    Book.findOne({ _id: req.params.id })
      .then((book) => {
        const cloneBook = { ...book._doc };
        cloneBook.ratings.push(newRating); // Ajouter la nouvelle note à la fin du tableau
        function calcAverageGrade(arr) {
          let avr = Math.round((arr.reduce((acc, elem) => acc + elem.grade, 0) / arr.length) * 100) / 100;
          return avr;
        };
        cloneBook.averageRating = calcAverageGrade(cloneBook.ratings);
        Book.updateOne(
          { _id: req.params.id },
          { ...cloneBook }
        )
          .then(() => {
            res.status(200).json(cloneBook);
          })
          .catch((err) => {
            res.status(401).json({ err });
          });
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  };
